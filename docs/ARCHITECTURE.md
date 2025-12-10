# Architecture Guide

This document provides an overview of the Initialized codebase structure and key architectural decisions.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── 2025/              # Main dashboard page
│   ├── about/             # About page
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── og/            # OG image generation
│   │   ├── public/        # Public profile API
│   │   ├── settings/      # User settings
│   │   └── stats/         # Stats endpoints
│   ├── privacy/           # Privacy policy
│   ├── settings/          # Settings page
│   └── u/[username]/      # Public profile pages
├── components/
│   ├── three/             # 3D visualization components
│   │   ├── AchievementHall.tsx
│   │   ├── ActivityOrbit.tsx
│   │   ├── DashboardScene.tsx
│   │   ├── LanguageNebula.tsx
│   │   ├── OverviewStar.tsx
│   │   ├── RepoConstellation.tsx
│   │   ├── SquadronFormation.tsx
│   │   └── StarfieldCanvas.tsx
│   ├── providers/         # React context providers
│   └── ui/                # UI components (shadcn/ui)
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── crypto.ts          # Token encryption utilities
│   ├── github.ts          # GitHub API service
│   ├── prisma.ts          # Prisma client
│   ├── rate-limit.ts      # Rate limiting utilities
│   ├── utils.ts           # Utility functions
│   └── validations.ts     # Zod schemas
└── types/                 # TypeScript type definitions
```

---

## Core Modules

### Authentication (`src/lib/auth.ts`)

Uses NextAuth.js v5 with GitHub OAuth provider. Tokens are encrypted at rest using AES-256-GCM before database storage.

### GitHub API (`src/lib/github.ts`)

GraphQL-based service for fetching user contribution data, repository stats, and activity metrics from GitHub's API.

### 3D Visualization (`src/components/three/`)

Built with React Three Fiber, each component represents a different aspect of your GitHub journey:

| Component | Purpose |
|-----------|---------|
| `StarfieldCanvas` | Base canvas with animated starfield background |
| `DashboardScene` | Main scene orchestrating all 3D elements |
| `OverviewStar` | Central star representing total contributions |
| `RepoConstellation` | Repository connections as star constellations |
| `LanguageNebula` | Language distribution as colorful nebulae |
| `ActivityOrbit` | Contribution activity in orbital rings |
| `AchievementHall` | Unlocked badges displayed as trophies |
| `SquadronFormation` | Collaboration/team contribution display |

### API Routes (`src/app/api/`)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/*` | * | NextAuth authentication handlers |
| `/api/stats/refresh` | POST | Refresh GitHub stats from API |
| `/api/settings` | GET/PUT | User preference management |
| `/api/public/[username]` | GET | Public profile data |
| `/api/og/[username]` | GET | Generate OG images for sharing |

---

## Achievement System

16 achievements are calculated based on contribution patterns:

| Badge | Trigger |
|-------|---------|
| `NIGHT_OWL` | Commits between midnight-4am |
| `EARLY_BIRD` | Commits between 5-7am |
| `STREAK_MASTER` | 30+ day contribution streak |
| `CENTURY` | 100+ contributions in a month |
| `POLYGLOT` | Used 5+ programming languages |
| `GALAXY_WANDERER` | Contributed to 10+ repos |
| `TEAM_PLAYER` | Collaborated with 10+ developers |
| `CONSISTENT` | Contributions every month |
| `THOUSAND_CLUB` | 1000+ contributions in the year |
| `PR_MACHINE` | 50+ pull requests |
| `STAR_COLLECTOR` | Own repos with 100+ total stars |
| `BUG_HUNTER` | 30+ issues opened |
| `OPEN_SOURCERER` | Contributed to 5+ public repos |
| `FIRST_CONTACT` | Made first contribution of the year |
| `WARP_SPEED` | High velocity contributor (200+ contributions) |
| `WEEKEND_WARRIOR` | Made contributions on weekends |

---

## Database Schema

Using Prisma with PostgreSQL:

- **User**: GitHub user data and encrypted tokens
- **Stats**: Cached contribution statistics
- **Settings**: User preferences (theme, privacy, sharing)

---

## Rate Limiting

Implemented per-user rate limiting to protect both the app and GitHub API:

- **Stats refresh**: 5 requests per hour
- **Settings updates**: 20 requests per minute

---

## Theme System

Three theme variants available:

1. **Nebula Blue** - Cool blues and cyans
2. **Supernova Violet** - Purple and pink tones
3. **Dark Matter** - Deep blacks with subtle highlights

Themes are persisted in user settings and applied via CSS custom properties.

---

## Related Documentation

- [Setup Guide](./SETUP.md) - Development environment setup
- [Contributing](../CONTRIBUTING.md) - Contribution guidelines
