# MEMORA - Complete Application Specification

> **Version**: 2.1  
> **Last Updated**: 2025-01-20  
> **Status**: Phase 2 - Backend Development

An AI chat application with intelligent context management, rules engine, prompt enhancement, and multi-provider support.

---

## 📋 Table of Contents

1. [Vision & Overview](#vision)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication)
6. [Chat System](#chat-system)
7. [Prompt Enhancement](#prompt-enhancement)
8. [Context Library](#context-library)
9. [Rules Engine](#rules-engine)
10. [How Everything Connects](#how-it-works)
11. [User Interface](#user-interface)
12. [User Workflows](#user-workflows)
13. [Backend APIs](#backend-apis)
14. [Implementation Roadmap](#roadmap)

---

## 🎯 Vision & Overview {#vision}

### What is Memora?

Memora is an AI chat application that solves the context problem through three core features:

1. **Context Library**: Upload files, docs, URLs once - reuse everywhere
2. **Rules Engine**: Define AI behavior (coding standards, tone, preferences)
3. **Prompt Enhancement**: Auto-improve your messages for better AI responses

### Core Value Proposition

**Stop fighting with prompts.** Memora automatically enhances your questions, manages your context, and applies your rules - so you get better AI responses every time.

### Key Features

- ✅ **Multi-provider AI** (Claude, Gemini, OpenAI)
- ✅ **Context Library** with scope system (Global/Local)
- ✅ **Rules Engine** for AI behavior control
- ⭐ **Prompt Enhancement** for better responses
- ✅ **Token tracking** with real-time cost estimation
- ✅ **Beautiful UI** with drag & drop
- ✅ **Complete authentication** via Better Auth

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.5+ (App Router with typed routes), React 19, TypeScript 5.8
- **UI**: Shadcn UI (New York style), Tailwind CSS v4, Radix UI, Lucide icons
- **State**: Zustand (client state), TanStack Query v5 (server state)
- **Backend**: Hono v4 (API server)
- **Database**: SQLite (dev) / PostgreSQL (production) + Prisma ORM
- **Auth**: Better Auth v1.3+ with Prisma adapter
- **AI**: Vercel AI SDK v5 (@ai-sdk/react, @ai-sdk/google, Anthropic, OpenAI)
- **Storage**: S3-compatible for file uploads
- **Runtime**: Bun v1.3+ (package manager and runtime)
- **Deployment**: Vercel

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Chat    │  │ Context  │  │  Org     │  │  Admin   │   │
│  │  UI      │  │ Manager  │  │  Settings│  │  Panel   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ tRPC
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Hono)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   AI     │  │ Context  │  │   Auth   │  │  Token   │   │
│  │ Provider │  │ Processor│  │  Guard   │  │  Tracker │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Claude   │  │  Gemini  │  │  OpenAI  │  │    S3    │   │
│  │   API    │  │   API    │  │   API    │  │  Storage │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  Users | Organizations | Chats | Messages | Context Items   │
│  Chat Shares | Context Versions | Token Usage | Invites     │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema

### Core Entities

#### Users
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  avatar        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  memberships   OrganizationMember[]
  chats         Chat[]
  messages      Message[]
  contextItems  ContextItem[]
  sharedChats   ChatShare[]
  tokenUsage    TokenUsage[]
}
```

#### Organizations
```prisma
model Organization {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  avatar        String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Settings
  tokenLimit    Int?     // Monthly token limit
  spendingLimit Float?   // Monthly $ limit
  
  // Relations
  members       OrganizationMember[]
  contextItems  ContextItem[]
  invites       Invite[]
  tokenUsage    TokenUsage[]
}

model OrganizationMember {
  id             String   @id @default(cuid())
  role           Role     @default(MEMBER) // OWNER, ADMIN, MEMBER
  joinedAt       DateTime @default(now())
  
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([userId, organizationId])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}
```

#### Chats
```prisma
model Chat {
  id            String   @id @default(cuid())
  title         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Settings
  provider      AIProvider @default(CLAUDE) // CLAUDE, GEMINI, OPENAI
  model         String   // gpt-4, claude-3-5-sonnet, etc.
  
  // Parent chat (for forked chats)
  parentId      String?
  parent        Chat?    @relation("ChatForks", fields: [parentId], references: [id])
  forks         Chat[]   @relation("ChatForks")
  
  // Fork metadata
  forkedFromMessageId String? // Which message was this forked from
  
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Relations
  messages      Message[]
  shares        ChatShare[]
  contextUsage  ChatContextItem[]
}

enum AIProvider {
  CLAUDE
  GEMINI
  OPENAI
}
```

#### Messages
```prisma
model Message {
  id            String   @id @default(cuid())
  content       String   @db.Text
  role          MessageRole // USER, ASSISTANT, SYSTEM
  createdAt     DateTime @default(now())
  
  // Metadata
  tokens        Int?
  cost          Float?
  latency       Int?     // ms
  
  chatId        String
  chat          Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  // Relations
  forkedChats   Chat[]   // Chats forked from this message
  
  @@index([chatId, createdAt])
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

#### Context Items
```prisma
model ContextItem {
  id            String   @id @default(cuid())
  name          String
  description   String?
  type          ContextType // FILE, URL, GITHUB_REPO, VIBE_RULE, DOCUMENT
  
  // Scope
  scope         ContextScope @default(LOCAL) // LOCAL, GLOBAL
  
  // Content
  content       String   @db.Text // Processed content
  rawContent    String?  @db.Text // Original content
  metadata      Json?    // Type-specific metadata
  
  // Size & tokens
  fileSize      Int?     // bytes
  tokens        Int?     // estimated token count
  
  // Tags
  tags          Tag[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Ownership
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  organizationId String?
  organization  Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Versioning
  parentId      String?
  parent        ContextItem? @relation("ContextVersions", fields: [parentId], references: [id])
  versions      ContextItem[] @relation("ContextVersions")
  
  // Relations
  chats         ChatContextItem[]
  
  @@index([userId, scope])
  @@index([organizationId, scope])
}

enum ContextType {
  FILE
  URL
  GITHUB_REPO
  RULE
  DOCUMENT
}

enum ContextScope {
  LOCAL   // Accessible only within the chat where it was created
  GLOBAL  // Available across all chats for the owning user
}

model Tag {
  id            String   @id @default(cuid())
  name          String
  color         String?  // hex color
  
  contextItems  ContextItem[]
  
  @@unique([name])
}
```

#### Chat Context Usage
```prisma
model ChatContextItem {
  id            String   @id @default(cuid())
  
  chatId        String
  chat          Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  
  contextItemId String
  contextItem   ContextItem @relation(fields: [contextItemId], references: [id], onDelete: Cascade)
  
  addedAt       DateTime @default(now())
  
  @@unique([chatId, contextItemId])
}
```

#### Chat Sharing
```prisma
model ChatShare {
  id            String   @id @default(cuid())
  token         String   @unique @default(cuid()) // Share link token
  
  isPublic      Boolean  @default(true)
  expiresAt     DateTime?
  
  createdAt     DateTime @default(now())
  
  chatId        String
  chat          Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)
  
  sharedById    String
  sharedBy      User     @relation(fields: [sharedById], references: [id])
  
  @@index([token])
}
```

#### Invites
```prisma
model Invite {
  id             String   @id @default(cuid())
  email          String
  token          String   @unique @default(cuid())
  role           Role     @default(MEMBER)
  
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime @default(now())
  
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([organizationId, email])
  @@index([token])
}
```

#### Token Usage Tracking
```prisma
model TokenUsage {
  id             String   @id @default(cuid())
  
  provider       AIProvider
  model          String
  tokens         Int
  cost           Float
  
  createdAt      DateTime @default(now())
  
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  
  organizationId String?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  
  @@index([userId, createdAt])
  @@index([organizationId, createdAt])
}
```

## 🎨 Visual Design System

### Color Palette

#### Light Mode
```css
--background: 0 0% 100%        /* #FFFFFF */
--foreground: 0 0% 3.9%        /* #0A0A0A */

--card: 0 0% 100%              /* #FFFFFF */
--card-foreground: 0 0% 3.9%   /* #0A0A0A */

--popover: 0 0% 100%           /* #FFFFFF */
--popover-foreground: 0 0% 3.9% /* #0A0A0A */

--primary: 221.2 83.2% 53.3%   /* #2563EB - Blue */
--primary-foreground: 210 40% 98% /* #F8FAFC */

--secondary: 210 40% 96.1%     /* #F1F5F9 */
--secondary-foreground: 222.2 47.4% 11.2% /* #1E293B */

--muted: 210 40% 96.1%         /* #F1F5F9 */
--muted-foreground: 215.4 16.3% 46.9% /* #64748B */

--accent: 210 40% 96.1%        /* #F1F5F9 */
--accent-foreground: 222.2 47.4% 11.2% /* #1E293B */

--destructive: 0 84.2% 60.2%   /* #EF4444 */
--destructive-foreground: 210 40% 98% /* #F8FAFC */

--border: 214.3 31.8% 91.4%    /* #E2E8F0 */
--input: 214.3 31.8% 91.4%     /* #E2E8F0 */
--ring: 221.2 83.2% 53.3%      /* #2563EB */
```

#### Dark Mode
```css
--background: 222.2 84% 4.9%   /* #020817 */
--foreground: 210 40% 98%      /* #F8FAFC */

--card: 222.2 84% 4.9%         /* #020817 */
--card-foreground: 210 40% 98% /* #F8FAFC */

--popover: 222.2 84% 4.9%      /* #020817 */
--popover-foreground: 210 40% 98% /* #F8FAFC */

--primary: 217.2 91.2% 59.8%   /* #3B82F6 - Blue */
--primary-foreground: 222.2 47.4% 11.2% /* #1E293B */

--secondary: 217.2 32.6% 17.5% /* #1E293B */
--secondary-foreground: 210 40% 98% /* #F8FAFC */

--muted: 217.2 32.6% 17.5%     /* #1E293B */
--muted-foreground: 215 20.2% 65.1% /* #94A3B8 */

--accent: 217.2 32.6% 17.5%    /* #1E293B */
--accent-foreground: 210 40% 98% /* #F8FAFC */

--destructive: 0 62.8% 30.6%   /* #7F1D1D */
--destructive-foreground: 210 40% 98% /* #F8FAFC */

--border: 217.2 32.6% 17.5%    /* #1E293B */
--input: 217.2 32.6% 17.5%     /* #1E293B */
--ring: 224.3 76.3% 48%        /* #1D4ED8 */
```

#### Accent Colors (for tags, badges, etc.)
```css
--orange: 24 100% 58%          /* #FF8C42 */
--teal: 173 58% 39%            /* #2C9F8B */
--purple: 262 83% 58%          /* #8B5CF6 */
--green: 142 71% 45%           /* #22C55E */
--yellow: 48 96% 53%           /* #FCD34D */
--pink: 330 81% 60%            /* #EC4899 */
```

### Typography

```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing Scale
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;
```

### Shadows
```css
/* Light Mode */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Dark Mode */
--shadow-sm-dark: 0 1px 2px 0 rgb(0 0 0 / 0.5);
--shadow-md-dark: 0 4px 6px -1px rgb(0 0 0 / 0.5);
--shadow-lg-dark: 0 10px 15px -3px rgb(0 0 0 / 0.5);
--shadow-xl-dark: 0 20px 25px -5px rgb(0 0 0 / 0.5);
```

## 🎭 Component Library

### Layout Components

#### 1. Sidebar Navigation
- Fixed left sidebar (240px wide)
- Collapsible on mobile
- Sections: Home, History, Recent Chats, Settings
- Chat list with icons and truncated titles
- Organization switcher at top

#### 2. Chat Container
- Full height, scrollable message area
- Fixed input at bottom
- Context panel toggle on right
- Model selector in header

#### 3. Context Panel (Right Sidebar)
- 320px wide, collapsible
- Tabs: Vibe-Tools, Context, Token Usage
- Sections: Local, Global
- Context items with tags, token count, actions
- Drag to reorder

### Core Components

#### Chat Message
```tsx
interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  cost?: number;
  onFork?: () => void;
}
```

#### Context Item Card
```tsx
interface ContextItemCardProps {
  name: string;
  type: 'file' | 'url' | 'github' | 'rule' | 'document';
  tokens: number;
  tags: { name: string; color: string }[];
  scope: 'local' | 'global';
  selected?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFork?: () => void;
}
```

#### Chat Input
```tsx
interface ChatInputProps {
  onSend: (message: string) => void;
  selectedContext: ContextItem[];
  provider: AIProvider;
  model: string;
  estimatedCost?: number;
}
```

#### Model Selector
```tsx
interface ModelSelectorProps {
  provider: AIProvider;
  model: string;
  onChange: (provider: AIProvider, model: string) => void;
  availableModels: {
    provider: AIProvider;
    models: Array<{ id: string; name: string; cost: number }>;
  }[];
}
```

## 🔄 Key User Flows

### 1. User Onboarding
1. User signs up (email/password or OAuth)
2. Prompted to create or join organization
3. If create: enter org name → generates slug → creates org with user as OWNER
4. If join: enter invite code → validates → joins org as MEMBER
5. Quick tour of interface (chat, context, sidebar)

### 2. Starting a Chat
1. Click "New Chat" button
2. Select AI provider & model (dropdown)
3. (Optional) Select context items from panel
4. Type message and send
5. Estimated cost shown before sending
6. Message streams in real-time (Vercel AI SDK)
7. Tokens and cost tracked per message

### 3. Adding Context
#### Upload File
1. Click "Add Context" → "Upload File"
2. Select file (drag & drop or file picker)
3. File uploads to S3
4. Backend processes: extract text, count tokens, generate metadata
5. User prompted: name, tags, scope (local/global)
6. Context item created and available in panel

#### Add URL
1. Click "Add Context" → "Add URL"
2. Paste URL
3. Backend fetches, extracts text (Readability/Mozilla)
4. User prompted: name, tags, scope
5. Context item created

#### Add GitHub Repo
1. Click "Add Context" → "GitHub Repo"
2. Enter repo URL
3. Backend clones (shallow)
4. User selects specific files/folders (tree view)
5. Selected files processed
6. Context item created with metadata (repo, branch, selected paths)

#### Create Rule
1. Click "Add Context" → "Rule"
2. Text editor with markdown support
3. User writes rules (coding style, patterns, preferences)
4. Save with name, tags, scope
5. Global rules are selectable in any chat while local rules stay tied to the originating chat

### 4. Using Context in Chat
1. User sees context panel on right
2. Checkboxes next to each context item
3. Selected items highlighted
4. Local items are available only inside their originating chat; global items appear in every chat for that user
5. When sending a message, selected context is prepended
6. Token count updates in real-time
7. Cost estimate shown before sending

### 5. Forking a Chat
1. User views shared chat (read-only)
2. Hovers over any message
3. "Fork from here" button appears
4. Clicks → creates new chat
5. Chat history copied up to that message
6. User can now continue conversation
7. Fork tracked in database (parentId, forkedFromMessageId)

### 6. Sharing a Chat
1. Click "Share" button in chat header
2. Modal opens with options:
   - Public link (anyone with link)
   - Expiration date (optional)
3. Generate link → copy to clipboard
4. Share link: `/share/[token]`
5. Recipient views read-only chat
6. Can fork at any point

### 7. Managing Context Versions
1. User edits global context item
2. System creates new version (parent-child relationship)
3. Version history shown in context detail view
4. Can restore previous version
5. All users in org see latest version automatically

### 8. Inviting Team Members
1. Admin goes to Org Settings
2. Click "Invite Member"
3. Enter email, select role (MEMBER, ADMIN)
4. Invite sent via email
5. Recipient clicks link → signs up/logs in → joins org
6. Invite expires after 7 days

### 9. Token Usage & Limits
1. User/Admin sees token dashboard
2. Charts: usage over time, by user, by provider
3. Current month totals
4. Progress bars for limits
5. Alerts when approaching limit
6. Can set per-user or org-wide limits

## 🚀 Implementation Phases

### Phase 1: Core Chat (Week 1-2)
- [ ] Auth flow (Better Auth integration)
- [ ] Chat UI (sidebar, message list, input)
- [ ] AI provider integration (Claude, Gemini, OpenAI)
- [ ] Message streaming (Vercel AI SDK)
- [ ] Persistent chats (save to DB)
- [ ] Basic chat history

### Phase 2: Context Management (Week 3-4)
- [ ] Context panel UI
- [ ] File upload (S3)
- [ ] URL fetching & processing
- [ ] GitHub repo integration
- [ ] Rules editor
- [ ] Tag system
- [ ] Context selection in chat
- [ ] Local vs Global context

### Phase 3: Organizations (Week 5)
- [ ] Org creation & settings
- [ ] Invite system
- [ ] Member management
- [ ] Role-based permissions
- [ ] Multi-org support
- [ ] Org switcher

### Phase 4: Advanced Features (Week 6-7)
- [ ] Chat sharing & forking
- [ ] Context versioning (preserve scope semantics when restoring)
- [ ] Token tracking & analytics
- [ ] Spending limits
- [ ] Cost estimation
- [ ] Search chats & context

### Phase 5: Polish & Deploy (Week 8)
- [ ] Dark/light theme
- [ ] Responsive design
- [ ] Loading states & errors
- [ ] Onboarding tour
- [ ] Settings pages
- [ ] Performance optimization
- [ ] Deploy to Vercel

## 📁 Project Structure

```
memora/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── chat/
│   │   │   │   │   │   └── [chatId]/
│   │   │   │   │   ├── context/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── share/
│   │   │   │   │   └── [token]/
│   │   │   │   ├── invite/
│   │   │   │   │   └── [token]/
│   │   │   │   └── layout.tsx
│   │   │   ├── components/
│   │   │   │   ├── chat/
│   │   │   │   │   ├── chat-message.tsx
│   │   │   │   │   ├── chat-input.tsx
│   │   │   │   │   ├── chat-list.tsx
│   │   │   │   │   └── model-selector.tsx
│   │   │   │   ├── context/
│   │   │   │   │   ├── context-panel.tsx
│   │   │   │   │   ├── context-item.tsx
│   │   │   │   │   ├── context-upload.tsx
│   │   │   │   │   └── context-selector.tsx
│   │   │   │   ├── org/
│   │   │   │   │   ├── org-switcher.tsx
│   │   │   │   │   ├── invite-modal.tsx
│   │   │   │   │   └── member-list.tsx
│   │   │   │   ├── layout/
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   └── main-layout.tsx
│   │   │   │   └── ui/          # Shadcn components
│   │   │   ├── lib/
│   │   │   │   ├── auth-client.ts
│   │   │   │   ├── trpc.ts
│   │   │   │   └── utils.ts
│   │   │   └── stores/
│   │   │       ├── chat-store.ts
│   │   │       ├── context-store.ts
│   │   │       └── org-store.ts
│   │   └── package.json
│   │
│   └── server/                   # Hono backend
│       ├── src/
│       │   ├── routers/
│       │   │   ├── chat.ts
│       │   │   ├── message.ts
│       │   │   ├── context.ts
│       │   │   ├── org.ts
│       │   │   ├── invite.ts
│       │   │   └── token-usage.ts
│       │   ├── lib/
│       │   │   ├── ai/
│       │   │   │   ├── claude.ts
│       │   │   │   ├── gemini.ts
│       │   │   │   ├── openai.ts
│       │   │   │   └── provider.ts
│       │   │   ├── context/
│       │   │   │   ├── file-processor.ts
│       │   │   │   ├── url-fetcher.ts
│       │   │   │   ├── github-cloner.ts
│       │   │   │   └── token-counter.ts
│       │   │   ├── auth.ts
│       │   │   └── storage.ts
│       │   └── index.ts
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
└── packages/
    ├── api/                      # Shared tRPC API
    │   └── src/
    │       └── router.ts
    ├── db/                       # Prisma client
    │   └── src/
    │       └── index.ts
    └── auth/                     # Auth config
        └── src/
            └── index.ts
```

## 🔐 Security Considerations

1. **API Keys**: Store in environment variables, never expose to frontend
2. **Rate Limiting**: Implement per-user/org rate limits
3. **Input Sanitization**: Sanitize all user inputs (chat messages, context content)
4. **File Upload**: Validate file types, scan for malware, size limits
5. **Context Injection**: Escape special chars to prevent prompt injection
6. **Sharing**: Use random tokens, not sequential IDs
7. **Permissions**: Enforce org membership checks on all queries
8. **Cost Protection**: Hard limits on token usage to prevent abuse

## 📊 Analytics & Monitoring

1. **Token Usage**: Track per message, aggregate per user/org/provider
2. **Cost Tracking**: Real-time cost calculation based on provider pricing
3. **Performance**: Message latency, streaming speed
4. **Errors**: Track AI provider errors, retry logic
5. **User Behavior**: Most used models, context types, forking patterns

## 🎯 Success Metrics

1. **Engagement**: Daily/Monthly active users
2. **Retention**: 7-day, 30-day return rate
3. **Context Usage**: Avg context items per chat, reuse rate
4. **Collaboration**: Team invites, shared chats, forked conversations
5. **Cost Efficiency**: Avg tokens per chat, cost per user
6. **Performance**: Message response time < 2s, UI responsiveness

---

**Next Steps**: See `GOOGLE_STITCH_PROMPTS.md` for UI generation and `CLAUDE_CODE_PROMPTS.md` for implementation guidance.
