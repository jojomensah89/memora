# Memora - Complete Task Breakdown

> **Every task broken down to the smallest implementable unit**

**Legend:**
- 🔴 Critical path (blocks other features)
- 🟡 Important (core feature)
- 🟢 Enhancement (nice to have)
- 🔵 Polish/UX

---

## Phase 0: Environment & Setup

### 0.1 Environment Variables
- [ ] 🔴 Create `.env` file in `apps/server/`
- [ ] 🔴 Add `DATABASE_URL` (SQLite: `file:./dev.db`)
- [ ] 🔴 Add `BETTER_AUTH_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] 🔴 Add `CORS_ORIGIN` (`http://localhost:3001`)
- [ ] 🟡 Add placeholder for `CLAUDE_API_KEY`
- [ ] 🟡 Add placeholder for `GEMINI_API_KEY`
- [ ] 🟡 Add placeholder for `OPENAI_API_KEY`
- [ ] 🟡 Add placeholders for S3 credentials (`S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`)
- [ ] 🔴 Create `.env.example` with all keys (no values)
- [ ] 🔴 Add `.env` to `.gitignore` (verify it exists)

### 0.2 Web Environment
- [ ] 🔴 Create `.env.local` file in `apps/web/`
- [ ] 🔴 Add `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`
- [ ] 🔴 Add `NEXT_PUBLIC_APP_URL=http://localhost:3001`

### 0.3 Verify Setup
- [ ] 🔴 Run `bun install` from root
- [ ] 🔴 Run `bun run dev` and verify both servers start
- [ ] 🔴 Open `http://localhost:3001` and verify app loads
- [ ] 🔴 Open `http://localhost:3000` and verify API responds

---

## Phase 1: Database Schema & Models

### 1.1 Core User Models
- [ ] 🔴 Open `packages/db/prisma/schema/schema.prisma`
- [ ] 🔴 Verify `datasource` is configured for SQLite
- [ ] 🔴 Add `User` model with fields: `id`, `email`, `name`, `avatar`, `createdAt`, `updatedAt`
- [ ] 🔴 Add `@@unique([email])` to User
- [ ] 🔴 Add `@@index([email])` to User

### 1.2 Organization Models
- [ ] 🔴 Add `Organization` model with: `id`, `name`, `slug`, `avatar`, `tokenLimit`, `spendingLimit`, `createdAt`, `updatedAt`
- [ ] 🔴 Add `@@unique([slug])` to Organization
- [ ] 🔴 Add `@@index([slug])` to Organization
- [ ] 🔴 Create `Role` enum with values: `OWNER`, `ADMIN`, `MEMBER`
- [ ] 🔴 Add `OrganizationMember` model with: `id`, `userId`, `organizationId`, `role`, `joinedAt`
- [ ] 🔴 Add relation: `userId` → `User.id` (cascade delete)
- [ ] 🔴 Add relation: `organizationId` → `Organization.id` (cascade delete)
- [ ] 🔴 Add `@@unique([userId, organizationId])`
- [ ] 🔴 Add `@@index([userId])` and `@@index([organizationId])`

### 1.3 Chat Models
- [ ] 🔴 Create `AIProvider` enum with: `CLAUDE`, `GEMINI`, `OPENAI`
- [ ] 🔴 Add `Chat` model with: `id`, `title`, `provider`, `model`, `parentId`, `forkedFromMessageId`, `userId`, `createdAt`, `updatedAt`
- [ ] 🔴 Add self-relation for chat forks: `parentId` → `Chat.id`
- [ ] 🔴 Add relation: `userId` → `User.id` (cascade delete)
- [ ] 🔴 Add `@@index([userId, createdAt])`
- [ ] 🔴 Add `@@index([parentId])`

### 1.4 Message Models
- [ ] 🔴 Create `MessageRole` enum with: `USER`, `ASSISTANT`, `SYSTEM`
- [ ] 🔴 Add `Message` model with: `id`, `content`, `role`, `tokens`, `cost`, `latency`, `chatId`, `userId`, `createdAt`
- [ ] 🔴 Add relation: `chatId` → `Chat.id` (cascade delete)
- [ ] 🔴 Add relation: `userId` → `User.id`
- [ ] 🔴 Add `@@index([chatId, createdAt])`

### 1.5 Context Models
- [ ] 🔴 Create `ContextType` enum with: `FILE`, `URL`, `GITHUB_REPO`, `VIBE_RULE`, `DOCUMENT`
- [ ] 🔴 Create `ContextScope` enum with: `LOCAL`, `GLOBAL`
- [ ] 🔴 Add `ContextItem` model with: `id`, `name`, `description`, `type`, `scope`, `content`, `rawContent`, `metadata`, `fileSize`, `tokens`, `userId`, `organizationId`, `parentId`, `createdAt`, `updatedAt`
- [ ] 🔴 Add relation: `userId` → `User.id` (cascade delete)
- [ ] 🔴 Add relation: `organizationId` → `Organization.id` (cascade delete, nullable)
- [ ] 🔴 Add self-relation for versions: `parentId` → `ContextItem.id`
- [ ] 🔴 Add `@@index([userId, scope])`
- [ ] 🔴 Add `@@index([organizationId, scope])`

### 1.6 Tag Models
- [ ] 🔴 Add `Tag` model with: `id`, `name`, `color`
- [ ] 🔴 Add many-to-many relation: `tags` on `ContextItem` and `contextItems` on `Tag`
- [ ] 🔴 Add `@@unique([name])` to Tag

### 1.7 Context Usage Models
- [ ] 🔴 Add `ChatContextItem` join table with: `id`, `chatId`, `contextItemId`, `addedAt`
- [ ] 🔴 Add relation: `chatId` → `Chat.id` (cascade delete)
- [ ] 🔴 Add relation: `contextItemId` → `ContextItem.id` (cascade delete)
- [ ] 🔴 Add `@@unique([chatId, contextItemId])`

### 1.8 Sharing Models
- [ ] 🔴 Add `ChatShare` model with: `id`, `token`, `isPublic`, `expiresAt`, `chatId`, `sharedById`, `createdAt`
- [ ] 🔴 Add relation: `chatId` → `Chat.id` (cascade delete)
- [ ] 🔴 Add relation: `sharedById` → `User.id`
- [ ] 🔴 Add `@@unique([token])`
- [ ] 🔴 Add `@@index([token])`

### 1.9 Invite Models
- [ ] 🔴 Add `Invite` model with: `id`, `email`, `token`, `role`, `expiresAt`, `acceptedAt`, `organizationId`, `createdAt`
- [ ] 🔴 Add relation: `organizationId` → `Organization.id` (cascade delete)
- [ ] 🔴 Add `@@unique([organizationId, email])`
- [ ] 🔴 Add `@@unique([token])`
- [ ] 🔴 Add `@@index([token])`

### 1.10 Token Usage Models
- [ ] 🔴 Add `TokenUsage` model with: `id`, `provider`, `model`, `tokens`, `cost`, `userId`, `organizationId`, `createdAt`
- [ ] 🔴 Add relation: `userId` → `User.id`
- [ ] 🔴 Add relation: `organizationId` → `Organization.id` (nullable)
- [ ] 🔴 Add `@@index([userId, createdAt])`
- [ ] 🔴 Add `@@index([organizationId, createdAt])`

### 1.11 Database Migration
- [ ] 🔴 Run `bun run db:generate` from root
- [ ] 🔴 Run `bun run db:push` from root
- [ ] 🔴 Verify no errors in console
- [ ] 🔴 Run `bun run db:studio` and verify all tables exist
- [ ] 🔴 Close Prisma Studio

---

## Phase 2: Theme & Design System

### 2.1 Update Theme Colors (Optional but Recommended)
- [ ] 🟡 Open `apps/web/src/index.css`
- [ ] 🟡 In `:root`, change `--primary` from `oklch(0.205 0 0)` to `oklch(0.55 0.22 264)` (blue)
- [ ] 🟡 In `.dark`, change `--primary` from `oklch(0.922 0 0)` to `oklch(0.488 0.243 264)` (blue)
- [ ] 🔵 Test by running dev server and toggling theme

### 2.2 Add Context Type Colors
- [ ] 🟢 In `:root`, add `--color-orange: oklch(0.7 0.15 50);`
- [ ] 🟢 Add `--color-teal: oklch(0.65 0.12 180);`
- [ ] 🟢 Add `--color-purple: oklch(0.6 0.2 290);`
- [ ] 🟢 Add `--color-green: oklch(0.7 0.18 145);`
- [ ] 🟢 Add `--color-pink: oklch(0.7 0.2 350);`
- [ ] 🟢 Add same colors to `.dark` section

### 2.3 Verify Existing Shadcn Components
- [ ] 🔴 Verify `apps/web/src/components/ui/` exists
- [ ] 🔴 Check that `button.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx` exist
- [ ] 🔴 Check that `dropdown-menu.tsx`, `tabs.tsx`, `checkbox.tsx`, `badge.tsx` exist

---

## Phase 3: CI/CD & Git Hooks

### 3.1 Setup Husky
- [ ] 🔴 Verify Husky is installed (check `package.json` devDependencies)
- [ ] 🔴 If not installed: `bun add -D husky`
- [ ] 🔴 Initialize Husky: `bunx husky init`
- [ ] 🔴 Verify `.husky/` directory was created
- [ ] 🔴 Add prepare script to root `package.json`: `"prepare": "husky"`

### 3.2 Setup Pre-Commit Hook (Linting)
- [ ] 🔴 Verify lint-staged is installed (check `package.json` devDependencies)
- [ ] 🔴 If not installed: `bun add -D lint-staged`
- [ ] 🔴 Create `.husky/pre-commit` file: `bunx husky add .husky/pre-commit "bunx lint-staged"`
- [ ] 🔴 Make pre-commit executable: `chmod +x .husky/pre-commit` (Mac/Linux) or verify on Windows
- [ ] 🔴 Verify lint-staged config exists in `package.json` or create `.lintstagedrc.js`
- [ ] 🔴 Update lint-staged config to run on staged files:
  ```json
  {
    "*.{js,jsx,ts,tsx}": ["bun run check"],
    "*.{json,jsonc,css,md,mdx}": ["bun run check"]
  }
  ```
- [ ] 🔴 Test pre-commit: Make a change, `git add`, `git commit -m "test"`, verify linting runs

### 3.3 Setup Pre-Push Hook (Tests)
- [ ] 🟡 Create `.husky/pre-push` file: `bunx husky add .husky/pre-push "bun test"`
- [ ] 🟡 Make pre-push executable: `chmod +x .husky/pre-push`
- [ ] 🟡 Update pre-push to run type checking and tests:
  ```bash
  #!/bin/sh
  . "$(dirname "$0")/_/husky.sh"
  
  echo "🔍 Running type check..."
  bun run check-types || exit 1
  
  echo "🧪 Running tests..."
  bun test || exit 1
  
  echo "✅ All checks passed!"
  ```
- [ ] 🟡 Test pre-push: `git push` to trigger hook (or create dummy test first)

### 3.4 Setup GitHub Actions Workflow
- [ ] 🔴 Create `.github/workflows/` directory in project root
- [ ] 🔴 Create `.github/workflows/ci.yml` file
- [ ] 🔴 Add workflow name and trigger:
  ```yaml
  name: CI
  
  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main, develop]
  ```

### 3.5 Configure CI Job - Lint
- [ ] 🔴 Add lint job to ci.yml:
  ```yaml
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
  ```

### 3.6 Configure CI Job - Type Check
- [ ] 🔴 Add typecheck job to ci.yml:
  ```yaml
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
  ```

### 3.7 Configure CI Job - Tests
- [ ] 🟡 Add test job to ci.yml:
  ```yaml
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
        
        - name: Upload coverage
          uses: codecov/codecov-action@v3
          if: always()
          with:
            file: ./coverage/coverage-final.json
  ```

### 3.8 Configure CI Job - Build
- [ ] 🔴 Add build job to ci.yml:
  ```yaml
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
  ```

### 3.9 Add Database Check (Optional)
- [ ] 🟢 Add database validation job:
  ```yaml
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

### 3.10 Setup Dependabot (Optional)
- [ ] 🟢 Create `.github/dependabot.yml` file
- [ ] 🟢 Configure for npm package updates:
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

### 3.11 Add PR Template
- [ ] 🟢 Create `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] 🟢 Add PR checklist:
  ```markdown
  ## Description
  <!-- Describe your changes -->
  
  ## Type of Change
  - [ ] Bug fix
  - [ ] New feature
  - [ ] Breaking change
  - [ ] Documentation update
  
  ## Checklist
  - [ ] Code follows project style guidelines
  - [ ] Self-review completed
  - [ ] Comments added for complex code
  - [ ] Documentation updated
  - [ ] No new warnings generated
  - [ ] Tests added/updated
  - [ ] All tests passing
  - [ ] Dependent changes merged
  ```

### 3.12 Add Issue Templates
- [ ] 🟢 Create `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] 🟢 Add bug report template with sections: Description, Steps to Reproduce, Expected Behavior, Screenshots, Environment
- [ ] 🟢 Create `.github/ISSUE_TEMPLATE/feature_request.md`
- [ ] 🟢 Add feature request template with sections: Problem, Proposed Solution, Alternatives, Additional Context

### 3.13 Setup Branch Protection Rules (In GitHub)
- [ ] 🟡 Go to GitHub repo → Settings → Branches
- [ ] 🟡 Add branch protection rule for `main`:
  - [ ] Require pull request before merging
  - [ ] Require approvals: 1
  - [ ] Require status checks to pass: lint, typecheck, build
  - [ ] Require branches to be up to date
  - [ ] Do not allow bypassing

### 3.14 Add Deployment Workflow (Vercel)
- [ ] 🟡 Create `.github/workflows/deploy.yml`
- [ ] 🟡 Add deployment trigger (on push to main)
- [ ] 🟡 Configure Vercel deployment:
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
- [ ] 🟡 Add `VERCEL_TOKEN` to GitHub Secrets

### 3.15 Test Complete CI/CD Pipeline
- [ ] 🔴 Create a test branch: `git checkout -b test/ci-cd`
- [ ] 🔴 Make a small change (add comment to a file)
- [ ] 🔴 Commit change: should trigger pre-commit hook (lint)
- [ ] 🔴 Push branch: should trigger pre-push hook (tests)
- [ ] 🔴 Open PR on GitHub: should trigger CI workflow
- [ ] 🔴 Verify all CI checks pass (lint, typecheck, build)
- [ ] 🔴 Merge PR: should trigger deployment (if configured)
- [ ] 🔴 Verify deployment succeeds

### 3.16 Document CI/CD Setup
- [ ] 🟢 Update README.md with CI/CD badges
- [ ] 🟢 Add section explaining Git hooks
- [ ] 🟢 Document how to skip hooks (if needed): `git commit --no-verify`
- [ ] 🟢 Document how to run checks manually

---

## Phase 4: Core Chat UI

### 3.1 Create Chat Store (Zustand)
- [ ] 🔴 Create file `apps/web/src/stores/chat-store.ts`
- [ ] 🔴 Import `create` from `zustand`
- [ ] 🔴 Import `persist` from `zustand/middleware`
- [ ] 🔴 Define `ChatStore` interface with: `currentChatId`, `chats`, `messages`, `selectedProvider`, `selectedModel`, `isStreaming`, `selectedContextIds`
- [ ] 🔴 Add `setCurrentChat` action
- [ ] 🔴 Add `setChats` action
- [ ] 🔴 Add `addMessage` action (to messages map)
- [ ] 🔴 Add `updateMessage` action
- [ ] 🔴 Add `setProvider` and `setModel` actions
- [ ] 🔴 Add `setStreaming` action
- [ ] 🔴 Add `toggleContextId` action (add/remove from selectedContextIds)
- [ ] 🔴 Add `clearSelectedContext` action
- [ ] 🔴 Wrap in `persist` middleware, persist only `currentChatId`
- [ ] 🔴 Export `useChatStore` hook

### 3.2 Create Context Store (Zustand)
- [ ] 🟡 Create file `apps/web/src/stores/context-store.ts`
- [ ] 🟡 Define `ContextStore` interface with: `localItems`, `globalItems`, `selectedIds`, `isLoading`, `uploadProgress`
- [ ] 🟡 Add `setLocalItems` action
- [ ] 🟡 Add `setGlobalItems` action
- [ ] 🟡 Add `toggleSelected` action
- [ ] 🟡 Add `clearSelected` action
- [ ] 🟡 Add `setUploadProgress` action (map of fileId → percent)
- [ ] 🟡 Export `useContextStore` hook

### 3.3 Create Org Store (Zustand)
- [ ] 🟡 Create file `apps/web/src/stores/org-store.ts`
- [ ] 🟡 Define `OrgStore` interface with: `currentOrgId`, `organizations`
- [ ] 🟡 Add `setCurrentOrg` action
- [ ] 🟡 Add `setOrganizations` action
- [ ] 🟡 Wrap in `persist` middleware, persist `currentOrgId`
- [ ] 🟡 Export `useOrgStore` hook

### 3.4 Create Main Layout Component
- [ ] 🔴 Create file `apps/web/src/components/layout/main-layout.tsx`
- [ ] 🔴 Add `'use client'` directive at top
- [ ] 🔴 Create functional component `MainLayout` accepting `children`
- [ ] 🔴 Add three-column flex layout: `flex h-screen`
- [ ] 🔴 Add left sidebar div: `w-60 border-r` (240px = 15rem = w-60)
- [ ] 🔴 Add center content div: `flex-1 flex flex-col`
- [ ] 🔴 Add right sidebar div: `w-80 border-l` (320px = 20rem = w-80)
- [ ] 🔴 Export component

### 3.5 Create Left Sidebar Component
- [ ] 🔴 Create file `apps/web/src/components/layout/sidebar.tsx`
- [ ] 🔴 Add `'use client'` directive
- [ ] 🔴 Add sidebar container with padding
- [ ] 🔴 Add app logo/title at top: "Memora"
- [ ] 🔴 Add "New Chat" button (use Shadcn Button)
- [ ] 🔴 Add section: "Recent Chats" heading
- [ ] 🔴 Add placeholder list (empty for now)
- [ ] 🔴 Add "Settings" button at bottom
- [ ] 🔴 Export component

### 3.6 Create Chat Header Component
- [ ] 🔴 Create file `apps/web/src/components/chat/chat-header.tsx`
- [ ] 🔴 Add `'use client'` directive
- [ ] 🔴 Accept props: `chatTitle`, `onShare`, `onModelChange`
- [ ] 🔴 Add header container with border-bottom
- [ ] 🔴 Add editable title (Input component)
- [ ] 🔴 Add model selector button (placeholder for now)
- [ ] 🔴 Add share button (Button with ShareIcon from lucide-react)
- [ ] 🔴 Add more options button (ellipsis icon)
- [ ] 🔴 Export component

### 3.7 Create Chat Message Component
- [ ] 🔴 Create file `apps/web/src/components/chat/chat-message.tsx`
- [ ] 🔴 Add `'use client'` directive
- [ ] 🔴 Accept props: `message` (with `id`, `role`, `content`, `createdAt`, `tokens`, `cost`)
- [ ] 🔴 Create container with conditional alignment (right for user, left for assistant)
- [ ] 🔴 Add avatar (use Shadcn Avatar component)
- [ ] 🔴 Add message bubble with rounded corners
- [ ] 🔴 Add content (render as text for now)
- [ ] 🔴 Add timestamp at bottom (use `date-fns` format)
- [ ] 🔴 Add metadata row: tokens and cost (small text)
- [ ] 🔴 Add fork button (visible on hover) with fork icon
- [ ] 🔴 Apply different styles for user vs assistant
- [ ] 🔴 Export component

### 3.8 Create Chat Messages List Component
- [ ] 🔴 Create file `apps/web/src/components/chat/chat-messages.tsx`
- [ ] 🔴 Add `'use client'` directive
- [ ] 🔴 Accept props: `messages` (array)
- [ ] 🔴 Create scrollable container: `flex-1 overflow-y-auto`
- [ ] 🔴 Map over messages and render ChatMessage for each
- [ ] 🔴 Add empty state when no messages
- [ ] 🔴 Add auto-scroll to bottom on new message (useEffect with ref)
- [ ] 🔴 Export component

### 3.9 Create Chat Input Component
- [ ] 🔴 Create file `apps/web/src/components/chat/chat-input.tsx`
- [ ] 🔴 Add `'use client'` directive
- [ ] 🔴 Accept props: `onSend`, `disabled`, `estimatedCost`
- [ ] 🔴 Add state for input value (useState)
- [ ] 🔴 Create form with onSubmit handler
- [ ] 🔴 Add auto-growing Textarea (use Shadcn Textarea)
- [ ] 🔴 Add placeholder: "Message..."
- [ ] 🔴 Add send button (disabled when input is empty)
- [ ] 🔴 Handle Enter key to send (Shift+Enter for new line)
- [ ] 🔴 Show estimated cost in small text near button
- [ ] 🔴 Clear input after send
- [ ] 🔴 Export component

### 3.10 Create Chat Container Component
- [ ] 🔴 Create file `apps/web/src/components/chat/chat-container.tsx`
- [ ] 🔴 Add `'use client'` directive
- [ ] 🔴 Import ChatHeader, ChatMessages, ChatInput
- [ ] 🔴 Create container with flex column layout
- [ ] 🔴 Add ChatHeader at top (fixed)
- [ ] 🔴 Add ChatMessages in middle (flex-1, scrollable)
- [ ] 🔴 Add ChatInput at bottom (fixed)
- [ ] 🔴 Export component

### 3.11 Assemble Main Layout
- [ ] 🔴 Open `apps/web/src/components/layout/main-layout.tsx`
- [ ] 🔴 Import Sidebar component
- [ ] 🔴 Import ChatContainer component
- [ ] 🔴 Place Sidebar in left column
- [ ] 🔴 Place ChatContainer in center column
- [ ] 🔴 Add placeholder for right sidebar (just empty div for now)
- [ ] 🔴 Test by rendering in a page

### 3.12 Create Chat Page
- [ ] 🔴 Create file `apps/web/src/app/(dashboard)/chat/page.tsx`
- [ ] 🔴 Import MainLayout
- [ ] 🔴 Create page component that renders MainLayout
- [ ] 🔴 Add hardcoded mock messages for testing
- [ ] 🔴 Test by visiting `http://localhost:3001/chat`
- [ ] 🔴 Verify layout looks correct in browser

### 3.13 Style Polish
- [ ] 🔵 Adjust spacing and padding throughout
- [ ] 🔵 Ensure borders are subtle
- [ ] 🔵 Test dark mode toggle
- [ ] 🔵 Verify responsive behavior (resize browser)

---

## Phase 4: AI Provider Integration

### 4.1 Create AI Provider Interface
- [ ] 🔴 Create file `apps/server/src/lib/ai/provider.ts`
- [ ] 🔴 Define `AIProviderInterface` interface with methods: `sendMessage`, `estimateCost`, `countTokens`
- [ ] 🔴 Define `SendMessageParams` type: `messages`, `model`, `stream`
- [ ] 🔴 Export interface

### 4.2 Create Claude Provider
- [ ] 🟡 Install Anthropic SDK: `bun add @anthropic-ai/sdk` (run in `apps/server/`)
- [ ] 🟡 Create file `apps/server/src/lib/ai/claude.ts`
- [ ] 🟡 Import Anthropic SDK
- [ ] 🟡 Implement `ClaudeProvider` class implementing `AIProviderInterface`
- [ ] 🟡 Implement `sendMessage` using `streamText` from `ai` package
- [ ] 🟡 Implement `estimateCost` with pricing: Sonnet $3/1M, Opus $15/1M, Haiku $0.25/1M
- [ ] 🟡 Implement `countTokens` (rough estimate: `text.length / 4`)
- [ ] 🟡 Export instance

### 4.3 Create Gemini Provider
- [ ] 🟡 Create file `apps/server/src/lib/ai/gemini.ts`
- [ ] 🟡 Import `google` from `@ai-sdk/google` (already installed)
- [ ] 🟡 Implement `GeminiProvider` class
- [ ] 🟡 Implement `sendMessage` using `streamText` from `ai` package
- [ ] 🟡 Implement `estimateCost` with pricing: Pro $7/1M, Flash $0.35/1M
- [ ] 🟡 Implement `countTokens`
- [ ] 🟡 Export instance

### 4.4 Create OpenAI Provider
- [ ] 🟡 Install OpenAI SDK: `bun add openai` (run in `apps/server/`)
- [ ] 🟡 Create file `apps/server/src/lib/ai/openai.ts`
- [ ] 🟡 Import OpenAI SDK
- [ ] 🟡 Implement `OpenAIProvider` class
- [ ] 🟡 Implement `sendMessage` using `streamText` from `ai` package
- [ ] 🟡 Implement `estimateCost`: GPT-4 Turbo $10/1M, GPT-4 $30/1M, GPT-3.5 $0.50/1M
- [ ] 🟡 Implement `countTokens`
- [ ] 🟡 Export instance

### 4.5 Create Provider Factory
- [ ] 🔴 Create file `apps/server/src/lib/ai/index.ts`
- [ ] 🔴 Import all providers
- [ ] 🔴 Create `getProvider` function accepting `provider` enum
- [ ] 🔴 Return appropriate provider instance based on enum
- [ ] 🔴 Add error handling for invalid provider
- [ ] 🔴 Export function

### 4.6 Create Chat Router (tRPC)
- [ ] 🔴 Create file `packages/api/src/routers/chat.ts`
- [ ] 🔴 Import `router`, `publicProcedure`, `protectedProcedure` from `../index`
- [ ] 🔴 Import `z` from `zod`
- [ ] 🔴 Import prisma client
- [ ] 🔴 Create `chatRouter` using `router` function
- [ ] 🔴 Export router

### 4.7 Implement Chat List Query
- [ ] 🔴 In `chatRouter`, add `list` procedure using `protectedProcedure`
- [ ] 🔴 Add input schema: `z.object({ limit: z.number().optional(), cursor: z.string().optional() })`
- [ ] 🔴 Implement query to fetch user's chats from database
- [ ] 🔴 Order by `updatedAt` descending
- [ ] 🔴 Implement cursor-based pagination
- [ ] 🔴 Return chats array and nextCursor

### 4.8 Implement Create Chat Mutation
- [ ] 🔴 Add `create` procedure using `protectedProcedure`
- [ ] 🔴 Add input schema: `z.object({ title: z.string().optional(), provider: z.enum([...]), model: z.string() })`
- [ ] 🔴 Implement mutation to create chat in database
- [ ] �4 Set `userId` from `ctx.session.user.id`
- [ ] 🔴 Return created chat object

### 4.9 Implement Get Chat Query
- [ ] 🔴 Add `get` procedure using `protectedProcedure`
- [ ] 🔴 Add input schema: `z.object({ chatId: z.string() })`
- [ ] 🔴 Query chat by ID with messages included
- [ ] 🔴 Verify user owns the chat (throw UNAUTHORIZED if not)
- [ ] 🔴 Return chat with messages

### 4.10 Implement Send Message Mutation (Basic)
- [ ] 🔴 Add `sendMessage` procedure using `protectedProcedure`
- [ ] 🔴 Add input schema: `z.object({ chatId: z.string(), content: z.string() })`
- [ ] 🔴 Save user message to database
- [ ] 🔴 Get chat details (provider, model)
- [ ] 🔴 Call appropriate AI provider
- [ ] 🔴 Get response text (non-streaming for now)
- [ ] 🔴 Save assistant message to database
- [ ] 🔴 Return message object

### 4.11 Register Chat Router
- [ ] 🔴 Open `packages/api/src/routers/index.ts`
- [ ] 🔴 Import `chatRouter`
- [ ] 🔴 Add to `appRouter`: `chat: chatRouter`
- [ ] 🔴 Export updated appRouter

### 4.12 Test Chat Creation from Frontend
- [ ] 🔴 Open chat page component
- [ ] 🔴 Import trpc from `@/utils/trpc`
- [ ] 🔴 Add `useMutation` for `chat.create`
- [ ] 🔴 Add button to trigger create chat
- [ ] 🔴 Test in browser, check database for new chat
- [ ] 🔴 Verify no errors in console

### 4.13 Test Sending Message
- [ ] 🔴 Add `useMutation` for `chat.sendMessage`
- [ ] 🔴 Wire up ChatInput onSend to mutation
- [ ] 🔴 Test sending a message
- [ ] 🔴 Verify message appears in UI
- [ ] 🔴 Verify AI response is received and displayed
- [ ] 🔴 Check database for messages

---

## Phase 5: Message Streaming

### 5.1 Update AI Endpoint for Streaming
- [ ] 🟡 Open `apps/server/src/index.ts`
- [ ] 🟡 Update `/ai` endpoint to accept `chatId` in body
- [ ] 🟡 Fetch chat context if `contextIds` provided
- [ ] 🟡 Format context into prompt
- [ ] 🟡 Verify streaming response works

### 5.2 Create useChat Hook
- [ ] 🟡 Create file `apps/web/src/hooks/use-chat.ts`
- [ ] 🟡 Import `useChat` from `@ai-sdk/react`
- [ ] 🟡 Create wrapper hook that accepts `chatId`
- [ ] 🟡 Configure API URL
- [ ] 🟡 Add custom headers (auth)
- [ ] 🟡 Return messages, input, handleSubmit, isLoading
- [ ] 🟡 Export hook

### 5.3 Integrate Streaming in Chat Page
- [ ] 🟡 Import `useChat` hook in chat page
- [ ] 🟡 Replace mock messages with real messages from hook
- [ ] 🟡 Wire up ChatInput to `handleSubmit` from hook
- [ ] 🟡 Pass `input` and `handleInputChange` to ChatInput
- [ ] 🟡 Test streaming in browser

### 5.4 Show Streaming Indicator
- [ ] 🔵 In ChatMessage, accept `isStreaming` prop
- [ ] 🔵 Show typing indicator when streaming
- [ ] 🔵 Add pulsing animation on AI avatar
- [ ] 🔵 Test by sending message

### 5.5 Handle Streaming Errors
- [ ] 🟡 Add error state to useChat hook
- [ ] 🟡 Display error message in UI (toast or inline)
- [ ] 🟡 Add retry button
- [ ] 🟡 Test by simulating error (disconnect network)

---

## Phase 6: Model Selector

### 6.1 Create Model Selector Component
- [ ] 🟡 Create file `apps/web/src/components/chat/model-selector.tsx`
- [ ] 🟡 Add `'use client'` directive
- [ ] 🟡 Accept props: `selectedProvider`, `selectedModel`, `onChange`
- [ ] 🟡 Use Shadcn DropdownMenu component
- [ ] 🟡 Create trigger button showing current model

### 6.2 Define Model List
- [ ] 🟡 Create constant array of models with: `provider`, `id`, `name`, `cost`
- [ ] 🟡 Add Claude models: Sonnet, Opus, Haiku
- [ ] 🟡 Add Gemini models: Pro, Flash
- [ ] 🟡 Add OpenAI models: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo

### 6.3 Render Dropdown Menu
- [ ] 🟡 Group models by provider in dropdown
- [ ] 🟡 Add provider logos/icons for each section
- [ ] 🟡 Show model name and cost per 1M tokens
- [ ] 🟡 Highlight selected model
- [ ] 🟡 Call onChange when model clicked

### 6.4 Integrate with Chat
- [ ] 🟡 Import ModelSelector in ChatHeader
- [ ] 🟡 Get selected provider/model from useChatStore
- [ ] 🟡 Pass to ModelSelector
- [ ] 🟡 Update store when selection changes
- [ ] 🟡 Test by switching models in UI

---

## Phase 7: Chat History & Persistence

### 7.1 Fetch Chats on Load
- [ ] 🔴 In Sidebar component, add `useQuery` for `chat.list`
- [ ] 🔴 Display loading skeleton while fetching
- [ ] 🔴 Render list of chats when loaded
- [ ] 🔴 Show chat icon, truncated title, and last updated time

### 7.2 Create Chat List Item Component
- [ ] 🔴 Create file `apps/web/src/components/chat/chat-list-item.tsx`
- [ ] 🔴 Accept props: `chat`, `isActive`, `onClick`
- [ ] 🔴 Render chat icon and title
- [ ] 🔴 Add timestamp (relative: "2 hours ago")
- [ ] 🔴 Highlight if active
- [ ] 🔴 Handle click to switch chat

### 7.3 Implement Chat Switching
- [ ] 🔴 In Sidebar, add click handler for chat items
- [ ] 🔴 Update `currentChatId` in useChatStore
- [ ] 🔴 Navigate to `/chat/[chatId]` route
- [ ] 🔴 Test by clicking different chats

### 7.4 Create Dynamic Chat Route
- [ ] 🔴 Create file `apps/web/src/app/(dashboard)/chat/[chatId]/page.tsx`
- [ ] 🔴 Get `chatId` from params
- [ ] �4 Use `useQuery` to fetch chat with messages
- [ ] 🔴 Pass messages to ChatMessages component
- [ ] 🔴 Show loading state
- [ ] 🔴 Handle chat not found (redirect or error)

### 7.5 New Chat Flow
- [ ] 🔴 Add onClick handler to "New Chat" button in Sidebar
- [ ] 🔴 Call `chat.create` mutation
- [ ] 🔴 Navigate to new chat ID on success
- [ ] 🔴 Clear selected context
- [ ] 🔴 Test creating new chat

### 7.6 Delete Chat
- [ ] 🟡 Add `delete` procedure in chatRouter
- [ ] 🟡 Input schema: `z.object({ chatId: z.string() })`
- [ ] 🟡 Verify user owns chat
- [ ] 🟡 Delete chat from database
- [ ] 🟡 Add delete button in chat header (more options menu)
- [ ] 🟡 Confirm deletion with dialog
- [ ] 🟡 Redirect to /chat after deletion
- [ ] 🟡 Invalidate chat list query

---

## Phase 8: Context Upload - Files

### 8.1 Setup S3 Storage
- [ ] 🟡 Choose S3 provider (AWS S3, Cloudflare R2, etc.)
- [ ] 🟡 Create bucket
- [ ] 🟡 Get access keys
- [ ] 🟡 Add keys to `.env` in `apps/server/`
- [ ] 🟡 Install AWS SDK: `bun add @aws-sdk/client-s3` (in `apps/server/`)

### 8.2 Create S3 Upload Helper
- [ ] 🟡 Create file `apps/server/src/lib/storage.ts`
- [ ] 🟡 Import S3 client
- [ ] 🟡 Create `uploadFile` function accepting `buffer`, `filename`, `mimeType`
- [ ] 🟡 Generate unique key (timestamp + random + filename)
- [ ] 🟡 Upload to S3 using PutObjectCommand
- [ ] 🟡 Return file URL and key
- [ ] 🟡 Export function

### 8.3 Create File Processor
- [ ] 🟡 Install dependencies: `bun add pdf-parse mammoth` (in `apps/server/`)
- [ ] 🟡 Create file `apps/server/src/lib/context/file-processor.ts`
- [ ] 🟡 Create `processFile` function accepting `buffer`, `mimeType`
- [ ] 🟡 Handle PDF: extract text with `pdf-parse`
- [ ] 🟡 Handle DOCX: extract text with `mammoth`
- [ ] 🟡 Handle TXT/MD/code: read directly as string
- [ ] 🟡 Clean up whitespace
- [ ] 🟡 Return extracted text
- [ ] 🟡 Export function

### 8.4 Create Token Counter
- [ ] 🟡 Install tiktoken: `bun add tiktoken` (in `apps/server/`)
- [ ] 🟡 Create file `apps/server/src/lib/context/token-counter.ts`
- [ ] 🟡 Import tiktoken
- [ ] 🟡 Create `countTokens` function accepting `text`
- [ ] 🟡 Use `cl100k_base` encoding
- [ ] 🟡 Return token count
- [ ] 🟡 Export function

### 8.5 Create Context Router (tRPC)
- [ ] 🟡 Create file `packages/api/src/routers/context.ts`
- [ ] 🟡 Import dependencies
- [ ] 🟡 Create `contextRouter`
- [ ] 🟡 Export router

### 8.6 Implement Upload File Procedure
- [ ] 🟡 Add `uploadFile` procedure using `protectedProcedure`
- [ ] 🟡 Accept file data as base64 string in input
- [ ] 🟡 Decode base64 to buffer
- [ ] 🟡 Upload to S3
- [ ] 🟡 Process file to extract text
- [ ] 🟡 Count tokens
- [ ] 🟡 Save ContextItem to database with type=FILE
- [ ] 🟡 Return context item

### 8.7 Create Context List Query
- [ ] 🟡 Add `list` procedure using `protectedProcedure`
- [ ] 🟡 Input schema: `z.object({ scope: z.enum(['LOCAL', 'GLOBAL', 'ALL']).optional() })`
- [ ] 🟡 Filter by userId for LOCAL
- [ ] 🟡 Filter by organizationId for GLOBAL
- [ ] 🟡 Both for ALL
- [ ] 🟡 Include tags in query
- [ ] 🟡 Return context items

### 8.8 Register Context Router
- [ ] 🟡 Open `packages/api/src/routers/index.ts`
- [ ] 🟡 Import `contextRouter`
- [ ] 🟡 Add to appRouter: `context: contextRouter`

### 8.9 Create Upload Context Dialog (Frontend)
- [ ] 🟡 Create file `apps/web/src/components/context/upload-context-dialog.tsx`
- [ ] 🟡 Add `'use client'` directive
- [ ] 🟡 Use Shadcn Dialog component
- [ ] 🟡 Add trigger button: "Add Context"
- [ ] 🟡 Create form with file input
- [ ] 🟡 Add fields: name, description, tags, scope (local/global)
- [ ] 🟡 Add drag-and-drop area for files
- [ ] 🟡 Show file preview after selection
- [ ] 🟡 Export component

### 8.10 Implement File Upload
- [ ] 🟡 Add state for selected file
- [ ] 🟡 Convert file to base64
- [ ] 🟡 Add `useMutation` for `context.uploadFile`
- [ ] 🟡 Show progress bar during upload
- [ ] 🟡 Show success message on completion
- [ ] 🟡 Close dialog
- [ ] 🟡 Invalidate context list query

### 8.11 Test File Upload
- [ ] 🟡 Open upload dialog
- [ ] 🟡 Select a PDF file
- [ ] 🟡 Fill form and submit
- [ ] 🟡 Verify upload progress shows
- [ ] 🟡 Check database for new context item
- [ ] 🟡 Verify file is in S3

---

## Phase 9: Context Upload - URL

### 9.1 Create URL Fetcher
- [ ] 🟡 Install dependencies: `bun add @mozilla/readability turndown jsdom` (in `apps/server/`)
- [ ] 🟡 Create file `apps/server/src/lib/context/url-fetcher.ts`
- [ ] 🟡 Create `fetchUrl` function accepting `url`
- [ ] 🟡 Fetch HTML with native fetch
- [ ] 🟡 Parse with jsdom
- [ ] 🟡 Extract content with @mozilla/readability
- [ ] 🟡 Convert HTML to markdown with turndown
- [ ] 🟡 Return clean text content
- [ ] 🟡 Export function

### 9.2 Implement Add URL Procedure
- [ ] 🟡 In contextRouter, add `addUrl` procedure
- [ ] 🟡 Input schema: `z.object({ url: z.string().url(), name: z.string().optional(), tags: z.array(), scope: z.enum() })`
- [ ] 🟡 Fetch and process URL content
- [ ] 🟡 Count tokens
- [ ] 🟡 Save ContextItem with type=URL
- [ ] 🟡 Return context item

### 9.3 Add URL Tab in Upload Dialog
- [ ] 🟡 Add Tabs component to upload dialog
- [ ] 🟡 Create "URL" tab
- [ ] 🟡 Add URL input field
- [ ] 🟡 Add same fields: name, tags, scope
- [ ] 🟡 Wire up to `context.addUrl` mutation
- [ ] 🟡 Test by adding a URL (e.g., Next.js docs)

---

## Phase 10: Context Upload - GitHub

### 10.1 Setup GitHub API
- [ ] 🟡 Install Octokit: `bun add @octokit/rest` (in `apps/server/`)
- [ ] 🟡 Create file `apps/server/src/lib/context/github-fetcher.ts`
- [ ] 🟡 Import Octokit
- [ ] 🟡 Create GitHub client (unauthenticated or with token)

### 10.2 Create Fetch Repo Tree Function
- [ ] 🟡 Create `fetchRepoTree` function accepting `repoUrl`
- [ ] 🟡 Parse owner and repo from URL
- [ ] 🟡 Fetch repository tree using GitHub API
- [ ] 🟡 Return tree structure (files and folders)
- [ ] 🟡 Export function

### 10.3 Create Fetch Files Function
- [ ] 🟡 Create `fetchRepoFiles` function accepting `owner`, `repo`, `paths[]`
- [ ] 🟡 For each path, fetch file content from GitHub API
- [ ] 🟡 Concatenate all file contents with separators
- [ ] 🟡 Return combined text
- [ ] 🟡 Export function

### 10.4 Implement Add GitHub Repo Procedure
- [ ] 🟡 In contextRouter, add `addGithubRepo` procedure
- [ ] 🟡 Input schema: `z.object({ repoUrl: z.string(), selectedPaths: z.array(z.string()), name: z.string().optional(), tags: z.array(), scope: z.enum() })`
- [ ] 🟡 Fetch selected files
- [ ] 🟡 Count tokens
- [ ] 🟡 Save ContextItem with type=GITHUB_REPO
- [ ] 🟡 Store metadata (repo, branch, paths)
- [ ] 🟡 Return context item

### 10.5 Create GitHub Selector Component
- [ ] 🟡 Create file `apps/web/src/components/context/github-selector.tsx`
- [ ] 🟡 Add `'use client'` directive
- [ ] 🟡 Accept props: `repoUrl`, `onPathsSelected`
- [ ] 🟡 Add input for repo URL
- [ ] 🟡 Add button to "Fetch Repository"
- [ ] 🟡 Display tree view with checkboxes
- [ ] 🟡 Allow selecting files/folders
- [ ] 🟡 Call onPathsSelected when done
- [ ] 🟡 Export component

### 10.6 Add GitHub Tab in Upload Dialog
- [ ] 🟡 Add "GitHub Repo" tab
- [ ] 🟡 Include GitHubSelector component
- [ ] 🟡 Wire up to `context.addGithubRepo` mutation
- [ ] 🟡 Test by adding a public repo

---

## Phase 11: Context Panel UI

### 11.1 Create Context Panel Component
- [ ] 🟡 Create file `apps/web/src/components/context/context-panel.tsx`
- [ ] 🟡 Add `'use client'` directive
- [ ] 🟡 Create container for right sidebar
- [ ] 🟡 Add header with title "Context Library"
- [ ] 🟡 Add search input
- [ ] 🟡 Add "Add Context" button
- [ ] 🟡 Add Tabs: "Vibe-Tools", "Context", "Usage"
- [ ] 🟡 Export component

### 11.2 Create Context Tab Content
- [ ] 🟡 Fetch context items using `useQuery(trpc.context.list.queryOptions())`
- [ ] 🟡 Separate items into `local` and `global` arrays
- [ ] 🟡 Create two collapsible sections: "Local" and "Global"
- [ ] 🟡 Render ContextItemCard for each item
- [ ] 🟡 Show empty state when no items

### 11.3 Create Context Item Card Component
- [ ] 🟡 Create file `apps/web/src/components/context/context-item-card.tsx`
- [ ] 🟡 Add `'use client'` directive
- [ ] 🟡 Accept props: `contextItem`, `isSelected`, `onToggle`
- [ ] 🟡 Add checkbox for selection
- [ ] 🟡 Add icon based on type (file, url, github, vibe-rule)
- [ ] 🟡 Show name (truncated if long)
- [ ] 🟡 Show tags as colored badges
- [ ] 🟡 Show token count
- [ ] 🟡 Add three-dot menu with actions: Edit, Fork, Delete
- [ ] 🟡 Highlight border when selected
- [ ] 🟡 Export component

### 11.4 Integrate Context Panel in Layout
- [ ] 🟡 Open MainLayout component
- [ ] 🟡 Import ContextPanel
- [ ] 🟡 Place in right sidebar column
- [ ] 🟡 Test by viewing in browser

### 11.5 Implement Context Selection
- [ ] 🟡 In ContextItemCard, handle checkbox toggle
- [ ] 🟡 Update useContextStore selectedIds
- [ ] 🟡 Show selected items in ChatInput area (chips)
- [ ] 🟡 Test by selecting/deselecting items

### 11.6 Create Context Chips Component
- [ ] 🟡 Create file `apps/web/src/components/context/context-chips.tsx`
- [ ] 🟡 Accept props: `selectedItems`
- [ ] 🟡 Render badge/chip for each selected item
- [ ] 🟡 Show name and token count
- [ ] 🟡 Add X button to remove
- [ ] 🟡 Place above ChatInput

---

## Phase 12: Context Injection into Chat

### 12.1 Update Send Message to Include Context
- [ ] 🟡 In chatRouter `sendMessage` procedure, add `contextIds` to input schema
- [ ] 🟡 Query context items by IDs
- [ ] 🟡 Format context into prompt: `<context>\n<document name="...">content</document>\n</context>`
- [ ] 🟡 Prepend context to user message
- [ ] 🟡 Send to AI provider
- [ ] 🟡 Save ChatContextItem join records

### 12.2 Update Frontend Send Message
- [ ] 🟡 Get selected context IDs from useContextStore
- [ ] 🟡 Pass as parameter to sendMessage mutation
- [ ] 🟡 Clear selected context after sending
- [ ] 🟡 Test by selecting context and sending message

### 12.3 Calculate Estimated Cost
- [ ] 🟡 Create helper function `calculateCost`
- [ ] 🟡 Input: message text, context text, model
- [ ] 🟡 Count tokens for message + context
- [ ] 🟡 Multiply by model cost per token
- [ ] 🟡 Return estimated cost

### 12.4 Show Cost Estimate in Input
- [ ] 🟡 In ChatInput, calculate cost in real-time
- [ ] 🟡 Use useMemo with dependencies: input, selectedContext, model
- [ ] 🟡 Display as "Est. $0.02" near send button
- [ ] 🟡 Test by typing and selecting context

---

## Phase 13: Organizations

### 13.1 Create Org Router (tRPC)
- [ ] 🟡 Create file `packages/api/src/routers/org.ts`
- [ ] 🟡 Create `orgRouter`
- [ ] 🟡 Add `create` procedure: input `name`, `slug`, create org with user as OWNER
- [ ] 🟡 Add `list` procedure: return orgs user is member of
- [ ] 🟡 Add `get` procedure: return org details with members
- [ ] 🟡 Add `update` procedure: update org settings (admin only)
- [ ] 🟡 Export router

### 13.2 Register Org Router
- [ ] 🟡 Import orgRouter in `packages/api/src/routers/index.ts`
- [ ] 🟡 Add to appRouter: `org: orgRouter`

### 13.3 Create Organization Switcher Component
- [ ] 🟡 Create file `apps/web/src/components/org/org-switcher.tsx`
- [ ] 🟡 Add `'use client'` directive
- [ ] 🟡 Use Shadcn DropdownMenu
- [ ] 🟡 Fetch orgs using `useQuery(trpc.org.list.queryOptions())`
- [ ] 🟡 Show current org in trigger button
- [ ] 🟡 List all orgs in dropdown
- [ ] 🟡 Add "Personal" option (null org)
- [ ] 🟡 Add divider
- [ ] 🟡 Add "Create Organization" option
- [ ] 🟡 Handle org switch: update useOrgStore
- [ ] 🟡 Export component

### 13.4 Add Org Switcher to Sidebar
- [ ] 🟡 Import OrgSwitcher in Sidebar component
- [ ] 🟡 Place at top of sidebar
- [ ] 🟡 Test switching orgs

### 13.5 Create Org Create Dialog
- [ ] 🟡 Create file `apps/web/src/components/org/create-org-dialog.tsx`
- [ ] 🟡 Add form with org name input
- [ ] 🟡 Auto-generate slug from name
- [ ] 🟡 Use `useMutation(trpc.org.create.mutationOptions())`
- [ ] 🟡 Create org on submit
- [ ] 🟡 Switch to new org after creation
- [ ] 🟡 Export component

### 13.6 Filter Context by Org
- [ ] 🟡 Update context list query to include `organizationId` based on current org
- [ ] 🟡 Show only LOCAL items for personal workspace
- [ ] 🟡 Show LOCAL + GLOBAL for organization workspace
- [ ] 🟡 Test by switching orgs and viewing context panel

---

## Phase 14: Team Invites

### 14.1 Setup Email Service
- [ ] 🟡 Sign up for Resend (or similar email service)
- [ ] 🟡 Get API key
- [ ] 🟡 Add `RESEND_API_KEY` to `.env` in `apps/server/`
- [ ] 🟡 Install Resend: `bun add resend` (in `apps/server/`)

### 14.2 Create Email Templates
- [ ] 🟡 Install React Email: `bun add react-email @react-email/components` (in `apps/server/`)
- [ ] 🟡 Create file `apps/server/src/lib/email/invite-template.tsx`
- [ ] 🟡 Create email component with org name, inviter name, join link
- [ ] 🟡 Export template

### 14.3 Create Invite Router (tRPC)
- [ ] 🟡 Create file `packages/api/src/routers/invite.ts`
- [ ] 🟡 Create `inviteRouter`
- [ ] 🟡 Add `create` procedure: send invite email, save to database
- [ ] 🟡 Add `list` procedure: return pending invites for org
- [ ] 🟡 Add `accept` procedure: create OrganizationMember, mark invite accepted
- [ ] 🟡 Add `revoke` procedure: delete invite
- [ ] 🟡 Export router

### 14.4 Register Invite Router
- [ ] 🟡 Import inviteRouter
- [ ] 🟡 Add to appRouter: `invite: inviteRouter`

### 14.5 Create Invite Modal Component
- [ ] 🟡 Create file `apps/web/src/components/org/invite-modal.tsx`
- [ ] 🟡 Add form with email input and role select
- [ ] 🟡 Use `useMutation(trpc.invite.create.mutationOptions())`
- [ ] 🟡 Send invite on submit
- [ ] 🟡 Show success message
- [ ] 🟡 List pending invites below form
- [ ] 🟡 Add revoke button for each invite
- [ ] 🟡 Export component

### 14.6 Create Invite Accept Page
- [ ] 🟡 Create file `apps/web/src/app/invite/[token]/page.tsx`
- [ ] 🟡 Get token from params
- [ ] 🟡 Query invite details (public procedure)
- [ ] 🟡 Show org name and inviter
- [ ] 🟡 Add "Join" button
- [ ] 🟡 Call `invite.accept` mutation
- [ ] 🟡 Redirect to org dashboard after joining
- [ ] 🟡 Handle expired/invalid tokens

### 14.7 Test Invite Flow
- [ ] 🟡 Open invite modal
- [ ] 🟡 Enter test email
- [ ] 🟡 Check email inbox for invite
- [ ] 🟡 Click link in email
- [ ] 🟡 Accept invite
- [ ] 🟡 Verify user is now member of org

---

## Phase 15: Chat Sharing

### 15.1 Create Share Router (tRPC)
- [ ] 🟡 Create file `packages/api/src/routers/share.ts`
- [ ] 🟡 Create `shareRouter`
- [ ] 🟡 Add `createShare` procedure (protected): generate token, create ChatShare
- [ ] 🟡 Add `getSharedChat` procedure (public): get chat by token
- [ ] 🟡 Export router

### 15.2 Register Share Router
- [ ] 🟡 Import shareRouter
- [ ] 🟡 Add to appRouter: `share: shareRouter`

### 15.3 Create Share Modal Component
- [ ] 🟡 Create file `apps/web/src/components/chat/share-modal.tsx`
- [ ] 🟡 Show chat preview (title, message count)
- [ ] 🟡 Add expiration dropdown (Never, 1 day, 7 days, 30 days)
- [ ] 🟡 Use `useMutation(trpc.share.createShare.mutationOptions())`
- [ ] 🟡 Generate link on submit
- [ ] 🟡 Show link with copy button
- [ ] 🟡 Show copied confirmation
- [ ] 🟡 Export component

### 15.4 Add Share Button in Chat Header
- [ ] 🟡 Import ShareModal
- [ ] 🟡 Add share button (icon)
- [ ] 🟡 Open modal on click
- [ ] 🟡 Pass current chatId

### 15.5 Create Shared Chat Page
- [ ] 🟡 Create file `apps/web/src/app/share/[token]/page.tsx`
- [ ] 🟡 Get token from params
- [ ] 🟡 Query shared chat using `trpc.share.getSharedChat`
- [ ] 🟡 Show chat with messages (read-only)
- [ ] 🟡 No input box
- [ ] 🟡 Add "Fork this chat" button
- [ ] 🟡 Handle expired/invalid tokens

### 15.6 Test Sharing
- [ ] 🟡 Open a chat
- [ ] 🟡 Click share button
- [ ] 🟡 Generate link
- [ ] 🟡 Copy link
- [ ] 🟡 Open in incognito window
- [ ] 🟡 Verify chat is visible

---

## Phase 16: Chat Forking

### 16.1 Implement Fork Procedure
- [ ] 🟡 In chatRouter, add `fork` procedure
- [ ] 🟡 Input: `chatId`, `fromMessageId` (optional)
- [ ] 🟡 Create new chat with parentId set
- [ ] 🟡 Copy messages up to fromMessageId
- [ ] 🟡 Set forkedFromMessageId
- [ ] 🟡 Return new chat

### 16.2 Add Fork Button to Messages
- [ ] 🟡 In ChatMessage, add fork button (visible on hover)
- [ ] 🟡 Use `useMutation(trpc.chat.fork.mutationOptions())`
- [ ] 🟡 Call mutation with chatId and messageId
- [ ] 🟡 Navigate to new chat on success

### 16.3 Fork from Shared Chat
- [ ] 🟡 In shared chat page, add "Fork this chat" button
- [ ] 🟡 Check if user is authenticated
- [ ] 🟡 If not, redirect to login with return URL
- [ ] 🟡 If yes, fork chat and navigate to new chat

### 16.4 Show Fork Indicator
- [ ] 🟡 In chat header, check if chat has parentId
- [ ] 🟡 If yes, show "Forked from [Parent Chat Title]" badge
- [ ] 🟡 Add link to parent chat (optional)

### 16.5 Test Forking
- [ ] 🟡 Hover over a message
- [ ] 🟡 Click fork button
- [ ] 🟡 Verify new chat is created
- [ ] 🟡 Verify messages are copied
- [ ] 🟡 Continue conversation in forked chat

---

## Phase 17: Token Usage Tracking

### 17.1 Create Token Tracker Helper
- [ ] 🟡 Create file `apps/server/src/lib/token-tracker.ts`
- [ ] 🟡 Create `trackTokenUsage` function accepting: userId, organizationId, provider, model, tokens
- [ ] 🟡 Calculate cost based on model pricing
- [ ] 🟡 Save TokenUsage record to database
- [ ] 🟡 Export function

### 17.2 Track Tokens in Send Message
- [ ] 🟡 In `sendMessage` procedure, after AI response
- [ ] 🟡 Get input tokens (count from user message + context)
- [ ] 🟡 Get output tokens (count from AI response)
- [ ] 🟡 Call `trackTokenUsage` for both input and output
- [ ] 🟡 Save token count to Message record

### 17.3 Create Token Usage Router
- [ ] 🟡 Create file `packages/api/src/routers/token-usage.ts`
- [ ] 🟡 Create `tokenUsageRouter`
- [ ] 🟡 Add `getStats` procedure: aggregate tokens by period, provider, user
- [ ] 🟡 Add `getLimit` procedure: return current usage vs limit
- [ ] 🟡 Add `setLimit` procedure (admin only): update org limits
- [ ] 🟡 Export router

### 17.4 Register Token Usage Router
- [ ] 🟡 Import tokenUsageRouter
- [ ] 🟡 Add to appRouter: `tokenUsage: tokenUsageRouter`

---

## Phase 18: Token Usage Dashboard

### 18.1 Create Usage Stats Cards Component
- [ ] 🟡 Create file `apps/web/src/components/usage/stats-cards.tsx`
- [ ] 🟡 Accept props: `stats` (totalTokens, totalCost, avgPerChat, limitPercent)
- [ ] 🟡 Create 4 cards using Shadcn Card
- [ ] 🟡 Show metric, value, and trend
- [ ] 🟡 Export component

### 18.2 Create Usage Chart Component
- [ ] 🟡 Install Recharts: `bun add recharts` (in `apps/web/`)
- [ ] 🟡 Create file `apps/web/src/components/usage/usage-chart.tsx`
- [ ] 🟡 Accept props: `data` (array of { date, claude, gemini, openai })
- [ ] 🟡 Use Recharts LineChart
- [ ] 🟡 Plot 3 lines for each provider
- [ ] 🟡 Add legend and tooltips
- [ ] 🟡 Export component

### 18.3 Create Usage Page
- [ ] 🟡 Create file `apps/web/src/app/(dashboard)/usage/page.tsx`
- [ ] 🟡 Add date range selector (Last 7 days, 30 days, 90 days)
- [ ] 🟡 Query token stats using `useQuery(trpc.tokenUsage.getStats.queryOptions())`
- [ ] 🟡 Render StatsCards at top
- [ ] 🟡 Render UsageChart below
- [ ] 🟡 Add pie chart for usage by provider
- [ ] 🟡 Add table for recent activity

### 18.4 Add Usage Tab in Context Panel
- [ ] 🟡 In ContextPanel, add "Usage" tab content
- [ ] 🟡 Show mini stats: tokens used this month, cost
- [ ] 🟡 Show progress bar for limit
- [ ] 🟡 Link to full usage dashboard

### 18.5 Test Usage Dashboard
- [ ] 🟡 Send several messages
- [ ] 🟡 Navigate to /usage
- [ ] 🟡 Verify stats are accurate
- [ ] 🟡 Verify chart displays data
- [ ] 🟡 Change date range and verify data updates

---

## Phase 19: Usage Limits & Alerts

### 19.1 Implement Limit Check
- [ ] 🟡 In `sendMessage` procedure, before calling AI
- [ ] 🟡 Query total token usage for current month
- [ ] 🟡 Get org token limit
- [ ] 🟡 If usage >= limit, throw FORBIDDEN error
- [ ] 🟡 Return error message to frontend

### 19.2 Show Limit Alert Banner
- [ ] 🔵 Create file `apps/web/src/components/usage/limit-alert.tsx`
- [ ] 🔵 Query limit status: `useQuery(trpc.tokenUsage.getLimit.queryOptions())`
- [ ] 🔵 Show warning banner when usage > 80%
- [ ] 🔵 Show error banner when usage >= 100%
- [ ] 🔵 Place in chat header or top of page
- [ ] 🔵 Export component

### 19.3 Create Limit Settings Page
- [ ] 🟡 Create file `apps/web/src/app/(dashboard)/settings/limits/page.tsx`
- [ ] 🟡 Add form to set token limit and spending limit
- [ ] 🟡 Use `useMutation(trpc.tokenUsage.setLimit.mutationOptions())`
- [ ] 🟡 Show current usage progress bars
- [ ] 🟡 Admin only (check user role)

### 19.4 Send Email Alerts
- [ ] 🟡 In `trackTokenUsage`, check if threshold crossed (80%, 100%)
- [ ] 🟡 If yes, send email to org owner/admins
- [ ] 🟡 Use Resend to send email
- [ ] 🟡 Prevent duplicate emails (track last alert sent)

---

## Phase 20: Loading States & Skeletons

### 20.1 Create Skeleton Components
- [ ] 🔵 Use Shadcn Skeleton component (already installed)
- [ ] 🔵 Create file `apps/web/src/components/chat/chat-skeleton.tsx`
- [ ] 🔵 Create skeleton for message list (3-4 message placeholders)
- [ ] 🔵 Export component

### 20.2 Create Context Skeleton
- [ ] 🔵 Create file `apps/web/src/components/context/context-skeleton.tsx`
- [ ] 🔵 Create skeleton for context items list
- [ ] 🔵 Export component

### 20.3 Add Loading States to Queries
- [ ] 🔵 In Sidebar, show skeleton while chats loading
- [ ] 🔵 In ChatMessages, show skeleton while messages loading
- [ ] 🔵 In ContextPanel, show skeleton while context loading
- [ ] 🔵 In UsageDashboard, show skeleton while stats loading

### 20.4 Add Streaming Indicators
- [ ] 🔵 In ChatMessage, show typing indicator when `isStreaming`
- [ ] 🔵 Add pulsing animation on AI avatar
- [ ] 🔵 Show cursor blinking at end of streaming text

### 20.5 Add Upload Progress
- [ ] 🔵 In upload dialog, show progress bar during file upload
- [ ] 🔵 Show processing spinner after upload
- [ ] 🔵 Show success checkmark when done

---

## Phase 21: Error Handling

### 21.1 Setup Toast Notifications
- [ ] 🔵 Shadcn Sonner is already installed
- [ ] 🔵 Verify Toaster component is in layout
- [ ] 🔵 Import `toast` from `sonner`

### 21.2 Add Error Toasts to Mutations
- [ ] 🔵 In all `useMutation` calls, add `onError` handler
- [ ] 🔵 Show toast with error message
- [ ] 🔵 Add retry button in toast (optional)

### 21.3 Handle API Errors
- [ ] 🔵 In tRPC client setup, add global error handler
- [ ] 🔵 Map error codes to user-friendly messages
- [ ] 🔵 Handle UNAUTHORIZED: redirect to login
- [ ] 🔵 Handle FORBIDDEN: show permission denied message
- [ ] 🔵 Handle network errors: show retry option

### 21.4 Create Error Boundary
- [ ] 🔵 Create file `apps/web/src/components/error-boundary.tsx`
- [ ] 🔵 Catch React errors
- [ ] 🔵 Show friendly error message
- [ ] 🔵 Add "Try again" button
- [ ] 🔵 Log error to console (or Sentry)
- [ ] 🔵 Wrap app in error boundary

### 21.5 Form Validation
- [ ] 🔵 Use Zod schemas for form validation
- [ ] 🔵 Show inline errors on form fields
- [ ] 🔵 Prevent submission until valid
- [ ] 🔵 Test with invalid inputs

---

## Phase 22: Responsive Design

### 22.1 Mobile Layout
- [ ] 🔵 Hide sidebars on mobile by default
- [ ] 🔵 Add hamburger menu button for left sidebar
- [ ] 🔵 Add button to toggle right context panel
- [ ] 🔵 Make sidebars slide in as drawers/sheets
- [ ] 🔵 Test on mobile viewport (Chrome DevTools)

### 22.2 Tablet Layout
- [ ] 🔵 Collapsible left sidebar
- [ ] 🔵 Context panel as overlay
- [ ] 🔵 Test on tablet viewport

### 22.3 Touch Interactions
- [ ] 🔵 Increase tap target sizes (min 44px)
- [ ] 🔵 Add swipe gestures for sidebars (optional)
- [ ] 🔵 Test on touch device

### 22.4 Responsive Components
- [ ] 🔵 Dialogs → Drawers on mobile (use Shadcn Drawer)
- [ ] 🔵 Dropdowns → Bottom sheets on mobile (use Vaul)
- [ ] 🔵 Tables → Cards on mobile
- [ ] 🔵 Test all components on mobile

---

## Phase 23: Dark/Light Theme Polish

### 23.1 Verify Theme Toggle
- [ ] 🔵 Ensure theme toggle button works
- [ ] 🔵 Test in header or settings
- [ ] 🔵 Verify system preference is respected

### 23.2 Check All Components
- [ ] 🔵 Test every page in dark mode
- [ ] 🔵 Verify text is readable (sufficient contrast)
- [ ] 🔵 Check borders are visible
- [ ] 🔵 Verify icons are visible

### 23.3 Chart Themes
- [ ] 🔵 Update Recharts colors for dark mode
- [ ] 🔵 Verify axis labels are visible
- [ ] 🔵 Adjust grid line opacity

### 23.4 Code Syntax Highlighting
- [ ] 🔵 Install syntax highlighter: `bun add react-syntax-highlighter` (already installed)
- [ ] 🔵 Use light theme for light mode
- [ ] 🔵 Use dark theme for dark mode
- [ ] 🔵 Test by sending code in chat

---

## Phase 24: Performance Optimization

### 24.1 Code Splitting
- [ ] 🟢 Use dynamic imports for heavy components
- [ ] 🟢 Example: `const ChartComponent = dynamic(() => import('./chart'))`
- [ ] 🟢 Split vendor bundles in Next.js config

### 24.2 Image Optimization
- [ ] 🟢 Use Next.js Image component for avatars
- [ ] 🟢 Set proper width/height
- [ ] 🟢 Use WebP format

### 24.3 Query Optimization
- [ ] 🟢 Add database indexes on frequently queried fields
- [ ] 🟢 Use pagination for long lists
- [ ] 🟢 Enable query caching in TanStack Query

### 24.4 Virtualization
- [ ] 🟢 For very long message lists, use virtualization
- [ ] 🟢 Install: `bun add @tanstack/react-virtual`
- [ ] 🟢 Implement in ChatMessages component

### 24.5 Memoization
- [ ] 🟢 Wrap expensive components in React.memo
- [ ] 🟢 Use useMemo for expensive computations
- [ ] 🟢 Use useCallback for event handlers

---

## Phase 25: Testing

### 25.1 Setup Testing Framework
- [ ] 🟢 Install Vitest: `bun add -D vitest @testing-library/react @testing-library/jest-dom`
- [ ] 🟢 Create `vitest.config.ts`
- [ ] 🟢 Add test script to package.json

### 25.2 Unit Tests
- [ ] 🟢 Test utility functions (token counting, cost calculation)
- [ ] 🟢 Test Zustand stores
- [ ] 🟢 Test components (ChatMessage, ContextItemCard)
- [ ] 🟢 Run tests: `bun test`

### 25.3 E2E Tests (Optional)
- [ ] 🟢 Install Playwright: `bun add -D @playwright/test`
- [ ] 🟢 Write test: user signup → create chat → send message
- [ ] 🟢 Write test: upload context → select → use in chat
- [ ] 🟢 Run E2E: `bun playwright test`

### 25.4 Test Coverage
- [ ] 🟢 Run with coverage: `bun test --coverage`
- [ ] 🟢 Aim for 70%+ coverage on critical paths

---

## Phase 26: Production Deployment

### 26.1 Database Migration to PostgreSQL
- [ ] 🔴 Provision PostgreSQL database (Vercel Postgres, Neon, Supabase)
- [ ] 🔴 Get connection string
- [ ] 🔴 Update `datasource` in schema.prisma to `postgresql`
- [ ] 🔴 Update `DATABASE_URL` in production `.env`
- [ ] 🔴 Run migrations: `bun run db:migrate`

### 26.2 Setup Vercel Project
- [ ] 🔴 Connect GitHub repo to Vercel
- [ ] 🔴 Set root directory (leave as root)
- [ ] 🔴 Set build command: `bun run build`
- [ ] 🔴 Set output directory: `.next`

### 26.3 Add Environment Variables in Vercel
- [ ] 🔴 Add DATABASE_URL
- [ ] 🔴 Add BETTER_AUTH_SECRET
- [ ] 🔴 Add CORS_ORIGIN (your Vercel URL)
- [ ] 🔴 Add all API keys (Claude, Gemini, OpenAI)
- [ ] 🔴 Add S3 credentials
- [ ] 🔴 Add RESEND_API_KEY
- [ ] 🔴 Add NEXT_PUBLIC_SERVER_URL
- [ ] 🔴 Add NEXT_PUBLIC_APP_URL

### 26.4 Deploy
- [ ] 🔴 Push to main branch → auto-deploy
- [ ] 🔴 Wait for build to complete
- [ ] 🔴 Check deployment logs for errors
- [ ] 🔴 Open deployment URL

### 26.5 Test Production
- [ ] 🔴 Sign up for new account
- [ ] 🔴 Create a chat
- [ ] 🔴 Send a message
- [ ] 🔴 Upload context
- [ ] 🔴 Create organization
- [ ] 🔴 Invite member (test email)
- [ ] 🔴 Share a chat
- [ ] 🔴 Check analytics

### 26.6 Setup Monitoring
- [ ] 🟡 Sign up for Sentry
- [ ] 🟡 Install Sentry SDK: `bun add @sentry/nextjs`
- [ ] 🟡 Initialize Sentry in app
- [ ] 🟡 Add SENTRY_DSN to env vars
- [ ] 🟡 Test by triggering an error

### 26.7 Setup Analytics
- [ ] 🟡 Enable Vercel Analytics (in Vercel dashboard)
- [ ] 🟡 Add Vercel Speed Insights
- [ ] 🟡 Monitor usage and performance

### 26.8 Custom Domain (Optional)
- [ ] 🟢 Purchase domain
- [ ] 🟢 Add domain in Vercel
- [ ] 🟢 Configure DNS
- [ ] 🟢 Enable automatic HTTPS

---

## Phase 27: Post-Launch Polish

### 27.1 User Onboarding
- [ ] 🔵 Create welcome modal for new users
- [ ] 🔵 Add quick tour of features
- [ ] 🔵 Add tooltips for first-time actions
- [ ] 🔵 Create sample chat with tips

### 27.2 Documentation
- [ ] 🟢 Write user guide (how to use Memora)
- [ ] 🟢 Document context management
- [ ] 🟢 Document organization features
- [ ] 🟢 Create FAQ page

### 27.3 Settings Pages
- [ ] 🟡 Create /settings/profile (edit name, avatar)
- [ ] 🟡 Create /settings/organization (org settings)
- [ ] 🟡 Create /settings/billing (if needed)
- [ ] 🟡 Create /settings/api-keys (manage AI keys if user-provided)

### 27.4 Notifications
- [ ] 🟢 Email notification for org invites
- [ ] 🟢 Email notification for usage alerts
- [ ] 🟢 Optional: In-app notifications

### 27.5 Search
- [ ] 🟢 Add search bar for chats
- [ ] 🟢 Search within messages (full-text)
- [ ] 🟢 Search within context items

---

## ✅ Final Launch Checklist

### Pre-Launch
- [ ] 🔴 All critical features working
- [ ] 🔴 No console errors
- [ ] 🔴 All forms validated
- [ ] 🔴 Error handling complete
- [ ] 🔴 Loading states everywhere
- [ ] 🔴 Responsive on mobile, tablet, desktop
- [ ] 🔴 Dark mode looks good
- [ ] 🔴 Performance: FCP < 3s, TTI < 5s
- [ ] 🔴 Tests passing
- [ ] 🔴 Deployed to production
- [ ] 🔴 Database backed up
- [ ] 🔴 Monitoring enabled

### Security
- [ ] 🔴 All env vars set correctly
- [ ] 🔴 No secrets in code
- [ ] 🔴 CORS configured properly
- [ ] 🔴 Rate limiting enabled
- [ ] 🔴 Input validation on all forms
- [ ] 🔴 Auth protected routes verified

### User Testing
- [ ] 🔴 Test with 3-5 beta users
- [ ] 🔴 Collect feedback
- [ ] 🔴 Fix critical bugs
- [ ] 🔴 Iterate based on feedback

### Marketing (Optional)
- [ ] 🟢 Create landing page
- [ ] 🟢 Write blog post
- [ ] 🟢 Share on social media
- [ ] 🟢 Post on Product Hunt

---

## 🎉 Congratulations!

You've built Memora from scratch! 

**Total Tasks**: 350+  
**Estimated Time**: 8 weeks  
**Stack**: Next.js 15, React 19, Tailwind v4, Bun, Prisma, tRPC, Vercel AI SDK

Now ship it and get feedback from real users! 🚀
