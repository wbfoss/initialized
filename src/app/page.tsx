'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Github, Rocket, Star, Users } from 'lucide-react';

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/2025');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center px-4 text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
            initialized.dev
          </h1>
          <p className="mt-2 text-lg text-zinc-400">GitHub Year in Review 2025</p>
        </div>

        {/* Hero card */}
        <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center gap-6 p-8">
            <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-4">
              <Rocket className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold text-white">
                Your 2025, reimagined as a star map
              </h2>
              <p className="text-zinc-400">
                Transform your GitHub contributions into an interactive galactic dashboard
              </p>
            </div>

            <Button
              onClick={() => signIn('github')}
              className="w-full gap-2 bg-white text-black hover:bg-zinc-200"
              size="lg"
            >
              <Github className="h-5 w-5" />
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-blue-500/20 p-3">
              <Github className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Connect GitHub</h3>
            <p className="text-sm text-zinc-400">
              Securely link your GitHub account with read-only access
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-purple-500/20 p-3">
              <Star className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">Generate Your Map</h3>
            <p className="text-sm text-zinc-400">
              Watch your contributions transform into a 3D galactic visualization
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-pink-500/20 p-3">
              <Users className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="font-semibold text-white">Share & Explore</h3>
            <p className="text-sm text-zinc-400">
              Share your Year in Review and discover others
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 z-10 text-center text-sm text-zinc-500">
        <a
          href="https://github.com/wbfoss/initialized"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          Open Source on GitHub
        </a>
      </footer>

      <style jsx>{`
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .stars {
          background-image:
            radial-gradient(2px 2px at 20px 30px, white, transparent),
            radial-gradient(2px 2px at 40px 70px, white, transparent),
            radial-gradient(1px 1px at 90px 40px, white, transparent),
            radial-gradient(2px 2px at 160px 120px, white, transparent),
            radial-gradient(1px 1px at 230px 80px, white, transparent),
            radial-gradient(2px 2px at 300px 150px, white, transparent),
            radial-gradient(1px 1px at 370px 50px, white, transparent),
            radial-gradient(2px 2px at 440px 180px, white, transparent);
          background-repeat: repeat;
          background-size: 500px 500px;
          animation: twinkle 5s ease-in-out infinite;
          opacity: 0.5;
        }

        .stars2 {
          background-image:
            radial-gradient(1px 1px at 50px 50px, white, transparent),
            radial-gradient(1px 1px at 150px 130px, white, transparent),
            radial-gradient(2px 2px at 250px 80px, white, transparent),
            radial-gradient(1px 1px at 350px 200px, white, transparent),
            radial-gradient(2px 2px at 450px 100px, white, transparent);
          background-repeat: repeat;
          background-size: 600px 600px;
          animation: twinkle 7s ease-in-out infinite;
          animation-delay: 1s;
          opacity: 0.3;
        }

        .stars3 {
          background-image:
            radial-gradient(1px 1px at 100px 100px, #60a5fa, transparent),
            radial-gradient(2px 2px at 200px 200px, #a78bfa, transparent),
            radial-gradient(1px 1px at 300px 50px, #f472b6, transparent),
            radial-gradient(2px 2px at 400px 150px, #60a5fa, transparent);
          background-repeat: repeat;
          background-size: 700px 700px;
          animation: twinkle 9s ease-in-out infinite;
          animation-delay: 2s;
          opacity: 0.4;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
