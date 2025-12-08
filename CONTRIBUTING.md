# Contributing to Initialized

Thank you for your interest in contributing to Initialized! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check existing [issues](https://github.com/wbfoss/initialized/issues) to avoid duplicates
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, browser)

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain why it would benefit users

### Pull Requests

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/initialized.git
   cd initialized
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

5. **Commit**
   ```bash
   git commit -m "feat: add your feature description"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation
   - `style:` formatting
   - `refactor:` code restructuring
   - `test:` adding tests
   - `chore:` maintenance

6. **Push & Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- GitHub OAuth App

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/initialized"
AUTH_SECRET="your-secret-key-min-32-chars"
AUTH_GITHUB_ID="your-github-oauth-app-id"
AUTH_GITHUB_SECRET="your-github-oauth-app-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Running Locally

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Running Tests

```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
```

## Project Structure

```
src/
├── app/           # Next.js pages and API routes
├── components/    # React components
│   ├── three/     # 3D visualization
│   └── ui/        # UI components
├── lib/           # Utilities and services
└── types/         # TypeScript definitions
```

## Style Guide

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Formatting**: Prettier handles this automatically

## Questions?

Open an issue or reach out to the maintainers.

Thank you for contributing!
