import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { prisma } from './prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email read:org',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile) return false;

      const githubProfile = profile as unknown as {
        id: number;
        login: string;
        name?: string;
        avatar_url?: string;
        email?: string;
        created_at?: string;
      };

      try {
        await prisma.user.upsert({
          where: { githubId: String(githubProfile.id) },
          update: {
            username: githubProfile.login,
            name: githubProfile.name,
            avatarUrl: githubProfile.avatar_url,
            email: githubProfile.email,
            githubCreatedAt: githubProfile.created_at ? new Date(githubProfile.created_at) : undefined,
          },
          create: {
            githubId: String(githubProfile.id),
            username: githubProfile.login,
            name: githubProfile.name,
            avatarUrl: githubProfile.avatar_url,
            email: githubProfile.email,
            githubCreatedAt: githubProfile.created_at ? new Date(githubProfile.created_at) : null,
          },
        });

        const dbUser = await prisma.user.findUnique({
          where: { githubId: String(githubProfile.id) },
        });

        if (dbUser && account.access_token) {
          await prisma.oAuthAccount.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
            },
            create: {
              userId: dbUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
            },
          });
        }

        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (token.sub) {
        const user = await prisma.user.findUnique({
          where: { githubId: token.sub },
        });
        if (user) {
          session.user.id = user.id;
          session.user.username = user.username;
        }
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.sub = String((profile as unknown as { id: number }).id);
      }
      return token;
    },
  },
  pages: {
    signIn: '/',
  },
});
