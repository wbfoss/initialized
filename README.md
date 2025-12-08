# Initialized - GitHub Year-in-Review 2025

A stunning 3D visualization of your GitHub contributions, transforming your coding journey into an interactive galactic experience.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Three.js](https://img.shields.io/badge/Three.js-0.181-black?logo=three.js)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **3D Galactic Visualization** - Your contributions rendered as stars, nebulae, and constellations using Three.js
- **GitHub OAuth Integration** - Secure authentication via NextAuth.js
- **Real-time Stats** - Fetches live data from GitHub's GraphQL API
- **Achievement System** - 15+ unlockable badges based on your contributions
- **Public Profile Sharing** - Share your year in review with custom OG images
- **Theme Variants** - Nebula Blue, Supernova Violet, and Dark Matter themes
- **Privacy Controls** - Choose to include/exclude private repositories

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL with Prisma 7 |
| 3D Graphics | Three.js / React Three Fiber |
| Authentication | NextAuth.js v5 |
| Styling | Tailwind CSS 4 |
| Validation | Zod |
| Testing | Vitest |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub OAuth App credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wbfoss/initialized.git
   cd initialized
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/initialized"

   # Auth
   AUTH_SECRET="your-secret-key-min-32-chars"
   AUTH_GITHUB_ID="your-github-oauth-app-id"
   AUTH_GITHUB_SECRET="your-github-oauth-app-secret"

   # App
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Creating a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Initialized (or your choice)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run seed` | Seed demo user data |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── 2025/              # Dashboard page
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

## Security

- **Token Encryption**: OAuth tokens are encrypted using AES-256-GCM
- **Input Validation**: All API inputs validated with Zod schemas
- **Rate Limiting**:
  - Stats refresh: 5 requests/hour
  - Settings updates: 20 requests/minute
- **Database Transactions**: Atomic operations for data integrity

## Achievements

| Badge | Name | Description |
|-------|------|-------------|
| STREAK_MASTER | Streak Master | 30+ day contribution streak |
| CENTURY | Century | 100+ contributions in a month |
| POLYGLOT | Polyglot | Used 5+ programming languages |
| GALAXY_WANDERER | Galaxy Wanderer | Contributed to 10+ repos |
| NIGHT_OWL | Night Owl | Commits between midnight-4am |
| EARLY_BIRD | Early Bird | Commits between 5-7am |
| THOUSAND_CLUB | Thousand Club | 1000+ contributions in the year |
| PR_MACHINE | PR Machine | 50+ pull requests |
| BUG_HUNTER | Bug Hunter | 30+ issues opened |
| CONSISTENT | Consistent | Contributions every month |
| OPEN_SOURCERER | Open Sourcerer | Contributed to public repos |
| STAR_COLLECTOR | Star Collector | Repos gained 100+ stars |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Three.js](https://threejs.org/) for 3D graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for React integration
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Vercel](https://vercel.com/) for hosting
