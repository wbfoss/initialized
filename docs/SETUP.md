# Development Setup Guide

This guide covers everything you need to set up Initialized for local development.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- GitHub OAuth App credentials

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/wbfoss/initialized.git
cd initialized
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

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

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Creating a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:
   - **Application name**: `Initialized` (or your choice)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Generate and copy a **Client Secret**

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run seed` | Seed demo user data |

---

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

---

## Security Features

- **Token Encryption**: OAuth tokens encrypted using AES-256-GCM
- **Input Validation**: All API inputs validated with Zod schemas
- **Rate Limiting**:
  - Stats refresh: 5 requests/hour
  - Settings updates: 20 requests/minute
- **Database Transactions**: Atomic operations for data integrity

---

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and the `DATABASE_URL` is correct:

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### OAuth Callback Errors

- Verify your callback URL matches exactly: `http://localhost:3000/api/auth/callback/github`
- Ensure `NEXTAUTH_URL` matches your development URL

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (warning: deletes all data)
npx prisma db push --force-reset
```

---

## Next Steps

- Read the [Architecture Guide](./ARCHITECTURE.md) to understand the codebase
- Check [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
