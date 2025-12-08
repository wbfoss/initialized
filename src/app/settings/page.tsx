import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SettingsClient } from './settings-client';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/');
  }

  const settings = await prisma.profileSettings.findUnique({
    where: {
      userId_year: {
        userId: session.user.id,
        year: 2025,
      },
    },
  });

  return (
    <SettingsClient
      user={{
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
      }}
      initialSettings={{
        publicProfileEnabled: settings?.publicProfileEnabled ?? false,
        includePrivateRepos: settings?.includePrivateRepos ?? false,
        themeVariant: settings?.themeVariant ?? 'nebula-blue',
      }}
    />
  );
}
