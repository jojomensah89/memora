# AI Assistant Quick Reference for Memora

> 🤖 If you're an AI coding assistant helping build Memora, start here!

## What is Memora?

Memora is an AI chat app with intelligent context management. Think ChatGPT + Conare's context features + multi-user collaboration.

**Core value**: Users can upload files, URLs, GitHub repos once, organize them with tags, share with their team, and reuse across all conversations. No more copying context between chats.

---

## Tech Stack

```
Frontend:  Next.js 15.5+ (App Router with typed routes), React 19, TypeScript 5.8
UI:        Shadcn UI (New York style), Tailwind CSS v4, Radix UI, Lucide icons
State:     Zustand (client), TanStack Query v5 (server state)
Backend:   Hono v4 (API server)
Database:  SQLite (dev) / PostgreSQL (production) + Prisma ORM
Auth:      Better Auth v1.3+ with Prisma adapter
AI:        Vercel AI SDK v5 (@ai-sdk/react, @ai-sdk/google, Anthropic, OpenAI)
Storage:   S3-compatible (for file uploads)
Runtime:   Bun v1.3+ (package manager and runtime)
Deploy:    Vercel
```

⚠️ **IMPORTANT**: Read `TECH_STACK_UPDATES.md` for critical differences:
- Tailwind CSS v4 uses `@import "tailwindcss"` and OKLCH colors (not HSL)
- React 19 has new hooks: `use`, `useActionState`, `useOptimistic`
- Next.js 15 has typed routes enabled
- Use `'use client'` directive for interactive components
- Replace `npm`/`yarn` with `bun` commands

---

## Project Structure

```
memora/
├── apps/
│   ├── web/              # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/      # Routes (App Router)
│   │   │   ├── components/
│   │   │   ├── stores/   # Zustand stores
│   │   │   └── lib/
│   │   └── package.json
│   └── server/           # Hono backend
│       ├── src/
│       │   ├── routers/  # tRPC routers
│       │   └── lib/      # AI providers, processors
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
└── packages/
    ├── api/              # Shared tRPC types
    ├── db/               # Prisma client
    └── auth/             # Auth config
```

---

## Key Features to Build

### 1. **AI Chat** (Weeks 1-2)
- Multi-provider support (Claude, Gemini, OpenAI)
- Model selector dropdown
- Streaming responses
- Message history
- Token counting & cost tracking

### 2. **Context Management** (Weeks 3-4)
- Upload files (PDF, MD, TXT, code)
- Add URLs (fetch & extract text)
- Add GitHub repos (user selects files)
- Create vibe-rules (markdown editor)
- Organize with tags
- Select context per message

### 3. **Organizations** (Week 5)
- Create/join organizations
- Invite team members via email
- Local context (private to user)
- Global context (shared with org)
- Org switcher

### 4. **Collaboration** (Week 6)
- Share chats via public link
- Fork chat from any message
- View shared chats (read-only)
- Continue forked conversations

### 5. **Analytics** (Week 6)
- Token usage dashboard
- Cost tracking per user/org
- Usage limits & alerts
- Charts and visualizations

---

## Core Data Models

```typescript
User
- id, email, name, avatar

Organization
- id, name, slug, tokenLimit, spendingLimit

OrganizationMember
- userId, organizationId, role (OWNER/ADMIN/MEMBER)

Chat
- id, title, provider, model, userId
- parentId (for forks), forkedFromMessageId

Message
- id, content, role (USER/ASSISTANT/SYSTEM)
- tokens, cost, chatId, userId

ContextItem
- id, name, type (FILE/URL/GITHUB_REPO/VIBE_RULE)
- scope (LOCAL/GLOBAL), content, tokens
- userId, organizationId

ChatContextItem (join table)
- chatId, contextItemId

ChatShare
- id, token, chatId, expiresAt

TokenUsage
- provider, model, tokens, cost, userId, organizationId
```

Full schema in `MEMORA_SPEC.md`.

---

## Design System

### Colors

**Light Mode**:
- Background: `#FFFFFF`
- Primary: `#2563EB` (blue)
- Text: `#0A0A0A`

**Dark Mode**:
- Background: `#020817` (very dark blue)
- Primary: `#3B82F6` (lighter blue)
- Text: `#F8FAFC`

**Accents**:
- Orange: `#FF8C42`
- Teal: `#2C9F8B`
- Purple: `#8B5CF6`

### Typography
- Font: Inter
- Sizes: 12px, 14px, 16px (base), 18px, 20px, 24px

### Spacing
- Use 8px grid system
- Border radius: 8px (buttons), 12px (cards)

Full design system in `MEMORA_SPEC.md`.

---

## UI Layout

### Main Dashboard (3-column)

```
┌──────────────────────────────────────────────────────────┐
│  LEFT SIDEBAR  │    CENTER CHAT AREA   │  RIGHT PANEL   │
│    (240px)     │      (flexible)       │    (320px)     │
├────────────────┼───────────────────────┼────────────────┤
│ • Org Switcher │ • Header (title,      │ • Context Panel│
│ • New Chat btn │   model selector)     │ • Tabs:        │
│ • Recent Chats │ • Messages (scroll)   │   - Vibe-Tools │
│ • Settings     │ • Chat Input (fixed)  │   - Context    │
│                │                       │   - Usage      │
│                │                       │ • Local items  │
│                │                       │ • Global items │
└────────────────┴───────────────────────┴────────────────┘
```

Responsive: Stack on mobile, collapsible on tablet.

---

## Implementation Order

Use `CLAUDE_CODE_PROMPTS.md` for detailed steps. High-level order:

1. **Database Schema** → Prisma models, migrations
2. **Shadcn UI Setup** → Theme, components
3. **Chat Store** → Zustand state management
4. **Chat UI** → Layout, messages, input
5. **AI Integration** → Claude, Gemini, OpenAI providers
6. **Streaming** → Real-time responses
7. **Context Upload** → Files, URLs
8. **Context UI** → Panel, selection
9. **GitHub Integration** → Repo file selection
10. **Organizations** → CRUD, members
11. **Invites** → Email invites, acceptance
12. **Global Context** → Org-wide sharing
13. **Chat Sharing** → Public links
14. **Chat Forking** → Branch conversations
15. **Token Tracking** → Usage analytics
16. **Polish** → Loading, errors, responsive
17. **Deploy** → Vercel

---

## Key Flows

### Send Message with Context

1. User selects context items (checkboxes in right panel)
2. User types message in chat input
3. Selected context chips shown above input
4. Cost estimate calculated and displayed
5. User clicks send
6. Frontend calls `chat.sendMessage` tRPC mutation with `contextIds[]`
7. Backend fetches context content
8. Backend formats prompt:
   ```
   <context>
   [context items here]
   </context>
   
   <user_message>
   [user message]
   </user_message>
   ```
9. Backend streams response from AI provider
10. Frontend updates UI in real-time
11. Backend saves message and tracks tokens

### Upload File as Context

1. User clicks "Add Context" → "Upload File"
2. User selects file (drag & drop or picker)
3. File uploads to S3
4. Backend extracts text (PDF → text, code → raw)
5. Backend counts tokens
6. User fills form: name, tags, scope (local/global)
7. Backend saves as ContextItem
8. Item appears in context panel immediately

### Share & Fork Chat

1. User clicks "Share" in chat header
2. Backend generates unique token
3. Frontend shows link: `/share/[token]`
4. Recipient opens link (no auth required)
5. Shared chat page shows messages (read-only)
6. Recipient clicks "Fork this chat"
7. Redirects to login if not authenticated
8. Backend creates new chat with `parentId`
9. Copies messages up to fork point
10. User can continue conversation

---

## AI Provider Integration

### Abstract Interface

```typescript
interface AIProvider {
  sendMessage(params: {
    messages: Array<{ role: string; content: string }>;
    model: string;
    stream: boolean;
  }): AsyncGenerator<string>;
  
  estimateCost(tokens: number, model: string): number;
  countTokens(text: string, model: string): number;
}
```

### Implementations

- **Claude**: `@anthropic-ai/sdk`
- **Gemini**: `@google/generative-ai`
- **OpenAI**: `openai` package

Use **Vercel AI SDK** for unified streaming interface.

---

## Important Patterns

### State Management

```typescript
// Chat Store (Zustand)
export const useChatStore = create<ChatStore>((set) => ({
  currentChatId: null,
  messages: new Map(),
  selectedContextItems: [],
  
  setCurrentChat: (id) => set({ currentChatId: id }),
  selectContext: (item) => set((state) => ({
    selectedContextItems: [...state.selectedContextItems, item]
  })),
}));
```

### Data Fetching (TanStack Query + tRPC)

```typescript
// Get chat with messages
const { data: chat } = trpc.chat.get.useQuery({ chatId });

// Send message (mutation)
const sendMessage = trpc.chat.sendMessage.useMutation({
  onSuccess: () => {
    // Refetch messages
    queryClient.invalidateQueries(['chat', chatId]);
  }
});
```

### Authentication Middleware

```typescript
// In tRPC context
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

---

## Testing Checklist

After implementing each feature:

- [ ] Visual: Does it match the design?
- [ ] Functional: Does it work as expected?
- [ ] Database: Is data saved correctly?
- [ ] Errors: How does it handle failures?
- [ ] Both themes: Looks good in light and dark?
- [ ] Responsive: Works on mobile/tablet?

---

## Common Gotchas

1. **Prisma client out of sync**: Run `bun run db:generate` after schema changes
2. **tRPC types not updating**: Restart dev server
3. **Streaming not working**: Check Vercel AI SDK setup, ensure proper async generator
4. **Context not injecting**: Verify `contextIds` are passed and content is fetched
5. **Token count inaccurate**: Use proper tokenizer (tiktoken for GPT models)
6. **S3 upload fails**: Check CORS settings on bucket
7. **Invite emails not sending**: Verify email service API key and from address

---

## Helpful Commands

```bash
# Database
bun run db:push          # Push schema changes
bun run db:studio        # Open Prisma Studio
bun run db:generate      # Generate Prisma client

# Development
bun run dev              # Start all apps
bun run dev:web          # Web only
bun run dev:server       # Server only

# Build
bun run build            # Production build
bun run typecheck        # TypeScript check
bun run lint             # Lint code

# Testing
bun test                 # Run tests
bun test --coverage      # With coverage
```

---

## Resources

- **Full Spec**: `MEMORA_SPEC.md`
- **UI Prompts**: `GOOGLE_STITCH_PROMPTS.md`
- **Implementation Steps**: `CLAUDE_CODE_PROMPTS.md`
- **Timeline**: `IMPLEMENTATION_PLAN.md`

---

## When Helping the User

1. **Read the context**: Check which phase they're in
2. **Reference the spec**: Refer to schema, flows, designs
3. **Follow the prompts**: Use CLAUDE_CODE_PROMPTS.md as guide
4. **Test thoroughly**: Ensure code works before moving on
5. **Ask clarifying questions**: If requirements are unclear
6. **Suggest improvements**: But don't over-engineer
7. **Keep it simple**: MVP first, polish later

---

## Quick Start for New Features

1. Check if UI design exists in `GOOGLE_STITCH_PROMPTS.md`
2. Find relevant prompt in `CLAUDE_CODE_PROMPTS.md`
3. Check database schema in `MEMORA_SPEC.md`
4. Implement following the prompt
5. Test in both themes
6. Test on mobile
7. Commit to Git

---

**Ready to code!** 🚀

Start with `CLAUDE_CODE_PROMPTS.md` Prompt 1.1 (Database Schema Setup) and work through sequentially.
