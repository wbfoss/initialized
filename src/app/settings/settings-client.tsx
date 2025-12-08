'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, RefreshCw, Check, Loader2 } from 'lucide-react';

interface SettingsClientProps {
  user: {
    username: string;
    name: string | null;
    avatarUrl: string | null;
  };
  initialSettings: {
    publicProfileEnabled: boolean;
    includePrivateRepos: boolean;
    themeVariant: string;
  };
}

const THEME_OPTIONS = [
  { value: 'nebula-blue', label: 'Nebula Blue', colors: ['#3b82f6', '#8b5cf6'] },
  { value: 'supernova-violet', label: 'Supernova Violet', colors: ['#8b5cf6', '#ec4899'] },
  { value: 'dark-matter', label: 'Dark Matter', colors: ['#374151', '#1f2937'] },
];

export function SettingsClient({ user, initialSettings }: SettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: 2025,
          ...settings,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/stats/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2025 }),
      });
      router.push('/2025');
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/2025')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
            Settings
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-8 border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex items-center gap-4 p-6">
            <Avatar className="h-16 w-16 border-2 border-zinc-700">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-xl">
                {user.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{user.name || user.username}</h2>
              <p className="text-zinc-400">@{user.username}</p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>Control who can see your Year in Review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-zinc-400">
                  Allow others to view your 2025 Year in Review at{' '}
                  <span className="font-mono text-purple-400">
                    /u/{user.username}/2025
                  </span>
                </p>
              </div>
              <Switch
                id="public-profile"
                checked={settings.publicProfileEnabled}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, publicProfileEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="private-repos">Include Private Repositories</Label>
                <p className="text-sm text-zinc-400">
                  Include activity from private repos in your private dashboard
                </p>
              </div>
              <Switch
                id="private-repos"
                checked={settings.includePrivateRepos}
                onCheckedChange={(checked) =>
                  setSettings((s) => ({ ...s, includePrivateRepos: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="mb-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Customize the look of your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setSettings((s) => ({ ...s, themeVariant: theme.value }))}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    settings.themeVariant === theme.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div
                    className="mb-3 h-8 rounded-md"
                    style={{
                      background: `linear-gradient(to right, ${theme.colors[0]}, ${theme.colors[1]})`,
                    }}
                  />
                  <p className="font-medium">{theme.label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Data</CardTitle>
            <CardDescription>Manage your GitHub data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Re-scan 2025 Data</p>
                <p className="text-sm text-zinc-400">
                  Fetch the latest data from GitHub
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 border-zinc-700 bg-transparent hover:bg-zinc-800"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="mb-8 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="border-red-800 text-red-400 hover:bg-red-900/20"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
