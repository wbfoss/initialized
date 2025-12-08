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
          // Note: read:org is optional - if user denies, we still proceed
          scope: 'read:user user:email read:org',
        },
      },
    }),
  ],
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile) {
        console.error('SignIn failed: Missing account or profile');
        return false;
      }

      const githubProfile = profile as unknown as {
        id: number;
        login: string;
        name?: string;
        avatar_url?: string;
        email?: string;
        created_at?: string;
      };

      console.log('SignIn attempt for:', githubProfile.login);

      try {
        // First, try to find existing user by githubId
        const existingUser = await prisma.user.findUnique({
          where: { githubId: String(githubProfile.id) },
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { githubId: String(githubProfile.id) },
            data: {
              username: githubProfile.login,
              name: githubProfile.name,
              avatarUrl: githubProfile.avatar_url,
              email: githubProfile.email,
              githubCreatedAt: githubProfile.created_at ? new Date(githubProfile.created_at) : undefined,
            },
          });
        } else {
          // Check if username already exists (case-insensitive)
          const usernameExists = await prisma.user.findFirst({
            where: {
              username: {
                equals: githubProfile.login,
                mode: 'insensitive',
              },
            },
          });

          if (usernameExists) {
            // Username collision - append GitHub ID to make unique
            await prisma.user.create({
              data: {
                githubId: String(githubProfile.id),
                username: `${githubProfile.login}_${githubProfile.id}`,
                name: githubProfile.name,
                avatarUrl: githubProfile.avatar_url,
                email: githubProfile.email,
                githubCreatedAt: githubProfile.created_at ? new Date(githubProfile.created_at) : null,
              },
            });
          } else {
            await prisma.user.create({
              data: {
                githubId: String(githubProfile.id),
                username: githubProfile.login,
                name: githubProfile.name,
                avatarUrl: githubProfile.avatar_url,
                email: githubProfile.email,
                githubCreatedAt: githubProfile.created_at ? new Date(githubProfile.created_at) : null,
              },
            });
          }
        }

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

        console.log('SignIn successful for:', githubProfile.login);
        return true;
      } catch (error) {
        console.error('Error during sign in for', githubProfile.login, ':', error);
        // Log the full error for debugging
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
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
    error: '/auth/error',
  },
});
