# CI/CD Setup Guide for Memora

> Complete guide for setting up Continuous Integration and Continuous Deployment

## 🎯 What This Adds

This CI/CD setup ensures code quality and smooth deployment by:
- **Pre-commit hooks**: Lint and format code before every commit
- **Pre-push hooks**: Run type checks and tests before pushing
- **GitHub Actions**: Automated CI pipeline on every PR and push
- **Branch protection**: Enforce quality standards before merging
- **Automated deployment**: Deploy to Vercel on every push to main

## 📋 Quick Start

### 1. Initialize Husky (Git Hooks)

```bash
# Husky and lint-staged are already installed
bunx husky init
```

This creates a `.husky/` directory with Git hook scripts.

### 2. Create Pre-Commit Hook

```bash
# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

bunx lint-staged
EOF

# Make it executable (Mac/Linux)
chmod +x .husky/pre-commit
```

**What it does**: Runs linting and formatting on staged files before commit.

### 3. Create Pre-Push Hook

```bash
# Create pre-push hook
cat > .husky/pre-push << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running type check..."
bun run check-types || exit 1

echo "🧪 Running tests..."
bun test || exit 1

echo "✅ All checks passed!"
EOF

# Make it executable (Mac/Linux)
chmod +x .husky/pre-push
```

**What it does**: Runs type checking and tests before push.

### 4. Test Git Hooks

```bash
# Test pre-commit
echo "// test comment" >> apps/web/src/app/page.tsx
git add apps/web/src/app/page.tsx
git commit -m "test: pre-commit hook"
# Should run linting automatically

# Test pre-push (after you have tests)
git push
# Should run type check and tests
```

## 🔧 GitHub Actions Setup

### 1. Create CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Run linter
        run: bun run check

  typecheck:
    name: TypeScript Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Run type check
        run: bun run check-types

  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Run tests
        run: bun test

  build:
    name: Build Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Build web
        run: bun run build --filter=web
      
      - name: Build server
        run: bun run build --filter=server

  database:
    name: Database Schema Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Generate Prisma Client
        run: bun run db:generate
      
      - name: Validate Prisma Schema
        run: cd packages/db && bunx prisma validate
```

### 2. Test CI Workflow

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make a change
echo "# Test" >> README.md
git add README.md
git commit -m "test: CI pipeline"
git push -u origin test/ci-pipeline

# Open PR on GitHub
# Verify all checks run and pass
```

## 🚀 Deployment Workflow (Vercel)

### 1. Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Create new token: "GitHub Actions"
3. Copy token

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `VERCEL_TOKEN`
4. Value: (paste your Vercel token)
5. Click "Add secret"

### 3. Create Deployment Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: bun add -g vercel
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 🛡️ Branch Protection

### Setup in GitHub

1. Go to repo → Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - Select: `lint`, `typecheck`, `build`
   - ✅ Require branches to be up to date before merging
5. Save changes

**Result**: No one can push directly to main. All changes must go through PR with passing checks.

## 📝 PR Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
<!-- Add screenshots here -->

## Related Issues
<!-- Link related issues: Closes #123 -->
```

## 🐛 Issue Templates

### Bug Report

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Describe the bug
A clear and concise description of what the bug is.

## To Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected behavior
A clear and concise description of what you expected to happen.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]

## Additional context
Add any other context about the problem here.
```

### Feature Request

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Is your feature request related to a problem?
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

## Describe the solution you'd like
A clear and concise description of what you want to happen.

## Describe alternatives you've considered
A clear and concise description of any alternative solutions or features you've considered.

## Additional context
Add any other context or screenshots about the feature request here.
```

## 🔄 Dependabot (Optional)

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    groups:
      production-dependencies:
        dependency-type: "production"
      development-dependencies:
        dependency-type: "development"
```

**What it does**: Automatically creates PRs to update dependencies weekly.

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Pre-commit hook runs on `git commit`
- [ ] Pre-push hook runs on `git push`
- [ ] CI workflow runs on PR creation
- [ ] All CI jobs pass (lint, typecheck, build)
- [ ] Branch protection prevents direct push to main
- [ ] PR template appears when creating PR
- [ ] Deployment workflow runs on merge to main
- [ ] Vercel deployment succeeds

## 🎯 Expected Workflow

### Day-to-Day Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... code ...

# 3. Commit (pre-commit hook runs)
git add .
git commit -m "feat: add my feature"
# ✅ Linting runs automatically

# 4. Push (pre-push hook runs)
git push -u origin feature/my-feature
# ✅ Type check and tests run automatically

# 5. Open PR on GitHub
# ✅ CI pipeline runs (lint, typecheck, test, build)

# 6. Get approval, merge
# ✅ Auto-deploys to Vercel
```

## 🚨 Troubleshooting

### Hook not running?

```bash
# Re-initialize Husky
bunx husky init

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

### CI failing on GitHub but passing locally?

- Check Node/Bun versions match
- Ensure `bun.lock` is committed
- Use `--frozen-lockfile` in CI

### Want to skip hooks temporarily?

```bash
# Skip pre-commit (use sparingly!)
git commit --no-verify -m "message"

# Skip pre-push
git push --no-verify
```

### CI says "command not found"?

- Ensure script exists in `package.json`
- Check working directory in workflow
- Verify dependencies are installed

## 📊 CI/CD Benefits

✅ **Code Quality**: Every commit is linted and formatted  
✅ **Type Safety**: TypeScript errors caught before merge  
✅ **Test Coverage**: Tests run automatically  
✅ **Build Validation**: Ensure code builds successfully  
✅ **Team Consistency**: Everyone follows same standards  
✅ **Fast Feedback**: Know if changes break anything within minutes  
✅ **Automated Deployment**: Push to main = live in production  
✅ **Protected Main**: No accidental direct pushes  

## 🎓 Best Practices

1. **Never skip hooks**: They're there for a reason
2. **Keep CI fast**: Optimize slow tests
3. **Fix broken CI immediately**: Don't let it stay red
4. **Review CI logs**: Learn from failures
5. **Update dependencies regularly**: Use Dependabot
6. **Write good commit messages**: Follow conventional commits
7. **Keep PRs small**: Easy to review and test

## 📚 Resources

- [Husky Docs](https://typicode.github.io/husky/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Now your Memora project has a professional CI/CD pipeline!** 🚀
