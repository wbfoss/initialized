import { Metadata } from 'next';
import Link from 'next/link';
import { Github, Rocket, Star, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About | initialized.dev',
  description: 'Learn about initialized.dev - Your GitHub Year in Review 2025',
};

export default function AboutPage() {
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
            <Link href="/privacy" className="text-sm text-zinc-400 hover:text-white">
              Privacy
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
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-4">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Your Year in Code,{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Visualized
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            initialized.dev transforms your GitHub contributions into an interactive galactic
            dashboard, celebrating your coding journey through 2025.
          </p>
        </div>

        {/* Features */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">What We Offer</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 inline-flex rounded-full bg-blue-500/20 p-3">
                <Github className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">GitHub Integration</h3>
              <p className="text-sm text-zinc-400">
                Securely connect your GitHub account with read-only access. We only request
                the minimum permissions needed.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 inline-flex rounded-full bg-purple-500/20 p-3">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">3D Visualization</h3>
              <p className="text-sm text-zinc-400">
                Watch your contributions transform into a stunning 3D galactic scene with
                stars, planets, and nebulae.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="mb-4 inline-flex rounded-full bg-pink-500/20 p-3">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Share Your Journey</h3>
              <p className="text-sm text-zinc-400">
                Generate a public profile to share your achievements with friends, colleagues,
                and the community.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Sign in with GitHub</h3>
                <p className="text-sm text-zinc-400">
                  Connect your GitHub account using OAuth. We only request read access to your
                  public profile and contributions.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Generate Your Review</h3>
                <p className="text-sm text-zinc-400">
                  Click the generate button and we&apos;ll fetch your 2025 GitHub activity,
                  including commits, pull requests, issues, and more.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Explore Your Galaxy</h3>
                <p className="text-sm text-zinc-400">
                  Your dashboard shows your stats, top repositories, languages, collaborators,
                  and unlocked achievements in an interactive 3D scene.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Share with the World</h3>
                <p className="text-sm text-zinc-400">
                  Enable your public profile and share your Year in Review on social media
                  or with a direct link.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold">Open Source</h2>
          <p className="mx-auto mb-6 max-w-xl text-zinc-400">
            initialized.dev is open source and built with Next.js, TypeScript, Prisma, and
            Three.js. Contributions are welcome!
          </p>
          <a
            href="https://github.com/wbfoss/initialized"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-black hover:bg-zinc-200"
          >
            <Github className="h-5 w-5" />
            View on GitHub
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        <div className="mx-auto max-w-4xl px-4">
          <p>
            Built with <Heart className="inline h-4 w-4 text-pink-500" /> for the developer
            community
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
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
