'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access was denied. This could be due to a database error or permission issue.',
  Verification: 'The verification link has expired or has already been used.',
  Default: 'An authentication error occurred.',
  OAuthSignin: 'Error constructing OAuth authorization URL.',
  OAuthCallback: 'Error handling OAuth callback.',
  OAuthCreateAccount: 'Could not create user account.',
  EmailCreateAccount: 'Could not create email user account.',
  Callback: 'Error in authentication callback.',
  OAuthAccountNotLinked: 'This email is already associated with another account.',
  SessionRequired: 'Please sign in to access this page.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full">
        {/* LCARS-style frame */}
        <div className="bg-[#cc6666] rounded-tl-[40px] p-1">
          <div className="bg-black rounded-tl-[36px] p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-[#cc6666] animate-pulse" />
              <h1 className="text-[#cc6666] text-xl font-bold tracking-widest">
                AUTHENTICATION ERROR
              </h1>
            </div>

            {/* Error code */}
            <div className="bg-[#cc6666]/10 border border-[#cc6666]/30 rounded p-4 mb-6">
              <div className="text-[10px] text-[#cc6666]/60 uppercase tracking-widest mb-1">
                Error Code
              </div>
              <div className="text-[#f59e0b] text-lg font-bold">
                {error}
              </div>
            </div>

            {/* Error message */}
            <div className="mb-6">
              <div className="text-[10px] text-[#9370db]/60 uppercase tracking-widest mb-2">
                Details
              </div>
              <p className="text-[#ffebb8]/80 text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>

            {/* Troubleshooting */}
            <div className="mb-6">
              <div className="text-[10px] text-[#22d3ee]/60 uppercase tracking-widest mb-2">
                Troubleshooting
              </div>
              <ul className="text-[#ffebb8]/60 text-xs space-y-2">
                <li>• Try clearing your browser cookies</li>
                <li>• Revoke and re-authorize the app in GitHub settings</li>
                <li>• If using private browsing, try normal mode</li>
                <li>• Wait a moment and try again</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 text-center px-4 py-3 bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
              >
                Try Again
              </Link>
              <a
                href="https://github.com/settings/applications"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-4 py-3 bg-[#9370db] hover:bg-[#9370db]/80 text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
              >
                GitHub Apps
              </a>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="h-2 bg-gradient-to-r from-[#cc6666] via-[#9370db] to-[#22d3ee] rounded-b" />
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#f59e0b] animate-pulse">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
