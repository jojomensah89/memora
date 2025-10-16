# GitHub Configuration

This directory contains CI/CD configuration for Memora.

## Files

- **workflows/ci.yml** - Main CI pipeline (lint, typecheck, test, build)
- **PULL_REQUEST_TEMPLATE.md** - Template for pull requests
- **ISSUE_TEMPLATE/** - Templates for bug reports and feature requests

## CI Pipeline

The CI pipeline runs on every push to `main` or `develop` and on every pull request.

### Jobs

1. **Lint** - Runs `bun run check` (Biome linter)
2. **TypeCheck** - Runs `bun run check-types` (TypeScript validation)
3. **Test** - Runs `bun test` (test suite)
4. **Build** - Builds web and server apps
5. **Database** - Validates Prisma schema

All jobs must pass before a PR can be merged (when branch protection is enabled).

## Git Hooks

- **pre-commit** - Automatically formats staged files with Ultracite
- **pre-push** - Runs type checking and tests before push

## Next Steps

1. Push these changes to GitHub
2. Go to repo Settings → Branches
3. Add branch protection rule for `main`
4. Require status checks: `lint`, `typecheck`, `build`
