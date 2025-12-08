'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Share2, Check, Download, ArrowLeft } from 'lucide-react';

interface IDCardClientProps {
  user: {
    username: string;
    name: string | null;
    avatarUrl: string | null;
    githubCreatedAt: string | null;
    githubId: string;
  };
  stats: {
    totalContributions: number;
    totalCommits: number;
    longestStreak: number;
    achievementCount: number;
    topLanguages: string[];
  };
}

function calculateClearanceLevel(githubCreatedAt: string | null): { level: number; title: string } {
  if (!githubCreatedAt) return { level: 1, title: 'ENSIGN' };
  const createdDate = new Date(githubCreatedAt);
  const now = new Date();
  const yearsOnGitHub = Math.floor((now.getTime() - createdDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (yearsOnGitHub >= 15) return { level: 10, title: 'FLEET ADMIRAL' };
  if (yearsOnGitHub >= 12) return { level: 9, title: 'ADMIRAL' };
  if (yearsOnGitHub >= 10) return { level: 8, title: 'VICE ADMIRAL' };
  if (yearsOnGitHub >= 8) return { level: 7, title: 'COMMODORE' };
  if (yearsOnGitHub >= 6) return { level: 6, title: 'CAPTAIN' };
  if (yearsOnGitHub >= 4) return { level: 5, title: 'COMMANDER' };
  if (yearsOnGitHub >= 3) return { level: 4, title: 'LT COMMANDER' };
  if (yearsOnGitHub >= 2) return { level: 3, title: 'LIEUTENANT' };
  if (yearsOnGitHub >= 1) return { level: 2, title: 'LT JUNIOR GRADE' };
  return { level: 1, title: 'ENSIGN' };
}

function getDivision(languages: string[]): { name: string; color: string } {
  const lang = languages[0]?.toLowerCase() || '';
  if (['javascript', 'typescript', 'react', 'vue', 'angular'].some(l => lang.includes(l))) {
    return { name: 'OPERATIONS', color: '#f59e0b' }; // Gold
  }
  if (['python', 'r', 'julia', 'matlab'].some(l => lang.includes(l))) {
    return { name: 'SCIENCE', color: '#22d3ee' }; // Blue
  }
  if (['rust', 'go', 'c', 'c++', 'java', 'kotlin'].some(l => lang.includes(l))) {
    return { name: 'ENGINEERING', color: '#ef4444' }; // Red
  }
  return { name: 'COMMAND', color: '#f59e0b' }; // Gold default
}

export function IDCardClient({ user, stats }: IDCardClientProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const clearance = calculateClearanceLevel(user.githubCreatedAt);
  const division = getDivision(stats.topLanguages);
  const serialNumber = `SFC-${user.githubId.slice(-6).toUpperCase().padStart(6, '0')}`;
  const issueDate = user.githubCreatedAt
    ? new Date(user.githubCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'CLASSIFIED';
  const stardate = `${new Date().getFullYear()}.${Math.floor((Date.now() % 31536000000) / 86400000).toString().padStart(3, '0')}`;

  const shareUrl = `https://initialized.dev/u/${user.username}/2025/id-card`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono">
      {/* Back button */}
      <div className="w-full max-w-lg mb-4">
        <Link
          href={`/u/${user.username}/2025`}
          className="inline-flex items-center gap-2 text-[#f59e0b] hover:text-[#f59e0b]/80 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      {/* ID Card */}
      <div ref={cardRef} className="w-full max-w-lg">
        <div
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl border-2"
          style={{ borderColor: division.color }}
        >
          {/* Top Header Bar */}
          <div className="flex">
            <div
              className="w-32 h-14 rounded-br-[30px] flex items-center justify-center"
              style={{ backgroundColor: division.color }}
            >
              <span className="text-black text-[10px] font-bold tracking-widest">LCARS</span>
            </div>
            <div
              className="flex-1 h-14 flex items-center px-4"
              style={{ backgroundColor: division.color }}
            >
              <span className="text-black text-xs font-bold tracking-[0.2em]">
                STARFLEET DEVELOPER COMMAND
              </span>
            </div>
            <div className="w-16 h-14 bg-[#9370db] rounded-bl-[30px] flex items-center justify-center">
              <span className="text-black text-[10px] font-bold">2025</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="flex gap-6">
              {/* Photo Section */}
              <div className="flex-shrink-0">
                <div
                  className="w-28 h-36 rounded-lg p-1"
                  style={{ backgroundColor: division.color }}
                >
                  <div className="w-full h-full bg-black rounded-md overflow-hidden flex items-center justify-center">
                    <Avatar className="w-24 h-32 rounded-none">
                      <AvatarImage src={user.avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback
                        className="text-3xl font-bold rounded-none"
                        style={{ backgroundColor: `${division.color}30`, color: division.color }}
                      >
                        {user.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                {/* Photo label */}
                <div className="text-center mt-2">
                  <div className="text-[8px] text-gray-500 tracking-widest">PHOTO ID</div>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-3">
                {/* Name */}
                <div>
                  <div className="text-[9px] text-gray-500 tracking-widest mb-1">NAME</div>
                  <div className="text-xl font-bold text-white tracking-wide">
                    {user.name || user.username}
                  </div>
                  <div className="text-sm text-[#9370db]">@{user.username}</div>
                </div>

                {/* Rank & Division */}
                <div className="flex gap-4">
                  <div>
                    <div className="text-[9px] text-gray-500 tracking-widest mb-1">RANK</div>
                    <div className="text-sm font-bold" style={{ color: division.color }}>
                      {clearance.title}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 tracking-widest mb-1">DIVISION</div>
                    <div className="text-sm font-bold" style={{ color: division.color }}>
                      {division.name}
                    </div>
                  </div>
                </div>

                {/* Serial & Clearance */}
                <div className="flex gap-4">
                  <div>
                    <div className="text-[9px] text-gray-500 tracking-widest mb-1">SERIAL NO.</div>
                    <div className="text-sm font-mono text-[#22d3ee]">{serialNumber}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 tracking-widest mb-1">CLEARANCE</div>
                    <div className="text-sm font-bold text-[#cc6666]">LEVEL {clearance.level}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-lg font-bold" style={{ color: division.color }}>
                    {stats.totalContributions.toLocaleString()}
                  </div>
                  <div className="text-[8px] text-gray-500 tracking-widest">CONTRIB</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#22d3ee]">
                    {stats.totalCommits.toLocaleString()}
                  </div>
                  <div className="text-[8px] text-gray-500 tracking-widest">COMMITS</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#9370db]">
                    {stats.longestStreak}
                  </div>
                  <div className="text-[8px] text-gray-500 tracking-widest">STREAK</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#cc6666]">
                    {stats.achievementCount}
                  </div>
                  <div className="text-[8px] text-gray-500 tracking-widest">MEDALS</div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            {stats.topLanguages.length > 0 && (
              <div className="mt-4">
                <div className="text-[9px] text-gray-500 tracking-widest mb-2">SPECIALIZATIONS</div>
                <div className="flex gap-2 flex-wrap">
                  {stats.topLanguages.slice(0, 3).map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 text-[10px] font-bold tracking-wider rounded"
                      style={{ backgroundColor: `${division.color}20`, color: division.color }}
                    >
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex">
            <div className="w-20 h-10 bg-[#cc6666] rounded-tr-[20px]" />
            <div className="flex-1 bg-gradient-to-r from-[#cc6666] via-[#9370db] to-[#22d3ee] flex items-center justify-center">
              <span className="text-black text-[9px] font-bold tracking-[0.15em]">
                INITIALIZED.DEV • STARDATE {stardate}
              </span>
            </div>
            <div className="w-20 h-10 bg-[#22d3ee] rounded-tl-[20px]" />
          </div>

          {/* Issue Date Watermark */}
          <div className="absolute bottom-14 right-4 text-right">
            <div className="text-[8px] text-gray-600">ISSUED</div>
            <div className="text-[10px] text-gray-500">{issueDate}</div>
          </div>

          {/* Holographic Effect Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                ${division.color}10 2px,
                ${division.color}10 4px
              )`
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={copyShareLink}
          className="flex items-center gap-2 px-6 py-3 bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Share'}
        </button>
        <Link
          href={`/u/${user.username}/2025`}
          className="flex items-center gap-2 px-6 py-3 bg-[#9370db] hover:bg-[#9370db]/80 text-black text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
        >
          View Full Profile
        </Link>
      </div>

      {/* Share URL Display */}
      <div className="mt-4 text-center">
        <div className="text-[10px] text-gray-500 tracking-widest mb-1">SHAREABLE URL</div>
        <code className="text-xs text-[#22d3ee] bg-gray-900 px-3 py-1 rounded">
          {shareUrl}
        </code>
      </div>
    </div>
  );
}
