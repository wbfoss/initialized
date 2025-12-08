import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | initialized.dev',
  description: 'Privacy policy for initialized.dev - How we handle your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link
            href="/"
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent"
          >
            initialized.dev
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/about" className="text-sm text-zinc-400 hover:text-white">
              About
            </Link>
            <a
              href="https://github.com/wbfoss/initialized"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-zinc-400">Last updated: December 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* Overview */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Overview</h2>
            <p className="text-zinc-400">
              initialized.dev is committed to protecting your privacy. This policy explains what
              data we collect, how we use it, and your rights regarding your information.
            </p>
          </section>

          {/* Data Collection */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-500/20 p-2">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-semibold">What We Collect</h2>
            </div>
            <div className="space-y-4 text-zinc-400">
              <p>When you sign in with GitHub, we collect:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-white">GitHub Profile Information:</strong> Your username,
                  display name, avatar URL, and email (if public)
                </li>
                <li>
                  <strong className="text-white">Contribution Data:</strong> Your public commits,
                  pull requests, issues, and repositories for the year 2025
                </li>
                <li>
                  <strong className="text-white">OAuth Tokens:</strong> Access tokens to fetch your
                  GitHub data (stored securely and never shared)
                </li>
              </ul>
              <p>
                We do <strong className="text-white">NOT</strong> collect:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Private repository code or content</li>
                <li>Your GitHub password</li>
                <li>Personal messages or notifications</li>
                <li>Payment information</li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-purple-500/20 p-2">
                <Lock className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold">How We Use Your Data</h2>
            </div>
            <div className="space-y-4 text-zinc-400">
              <ul className="ml-6 list-disc space-y-2">
                <li>Generate your personalized Year in Review dashboard</li>
                <li>Calculate achievements and statistics</li>
                <li>Display your public profile (if enabled by you)</li>
                <li>Improve the application experience</li>
              </ul>
              <p>We will never:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Sell your data to third parties</li>
                <li>Use your data for advertising</li>
                <li>Share your data without your consent</li>
              </ul>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Data Storage & Security</h2>
            <div className="space-y-4 text-zinc-400">
              <p>
                Your data is stored securely in our database hosted on Vercel&apos;s infrastructure.
                We implement industry-standard security measures including:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Encrypted connections (HTTPS/TLS)</li>
                <li>Secure token storage</li>
                <li>Regular security updates</li>
                <li>Access controls and authentication</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-pink-500/20 p-2">
                <Trash2 className="h-5 w-5 text-pink-400" />
              </div>
              <h2 className="text-2xl font-semibold">Your Rights</h2>
            </div>
            <div className="space-y-4 text-zinc-400">
              <p>You have the right to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-white">Access:</strong> View all data we have about you
                </li>
                <li>
                  <strong className="text-white">Control:</strong> Choose whether your profile is
                  public or private
                </li>
                <li>
                  <strong className="text-white">Delete:</strong> Request complete deletion of your
                  account and data
                </li>
                <li>
                  <strong className="text-white">Revoke:</strong> Disconnect your GitHub account at
                  any time
                </li>
              </ul>
              <p>
                To delete your account or request your data, please contact us through GitHub issues
                or revoke access from your{' '}
                <a
                  href="https://github.com/settings/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 underline hover:text-purple-300"
                >
                  GitHub OAuth settings
                </a>
                .
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Cookies</h2>
            <p className="text-zinc-400">
              We use essential cookies only for authentication and session management. We do not use
              tracking cookies or third-party analytics that collect personal information.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold">Changes to This Policy</h2>
            <p className="text-zinc-400">
              We may update this privacy policy from time to time. We will notify users of any
              material changes by updating the &quot;Last updated&quot; date at the top of this
              page.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
            <p className="text-zinc-400">
              If you have questions about this privacy policy or your data, please open an issue on
              our{' '}
              <a
                href="https://github.com/wbfoss/initialized/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 underline hover:text-purple-300"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex justify-center gap-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <a
              href="https://github.com/wbfoss/initialized"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
