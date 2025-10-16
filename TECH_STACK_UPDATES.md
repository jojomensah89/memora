# Tech Stack Updates for Memora

> **Important**: This document contains critical updates to match your actual codebase (Next.js 15, React 19, Tailwind CSS v4, Bun runtime).

## 🎯 Current Setup

Your project is using:
- **Next.js 15.5.4** with typed routes
- **React 19.1.0**
- **Tailwind CSS v4.1.10** (new version)
- **Bun 1.3.0** (runtime and package manager)
- **Shadcn UI** (New York style)
- **OKLCH color space** (not HSL)
- **Better Auth v1.3** with Prisma adapter
- **SQLite** for development database

## 📝 Key Differences from Original Spec

### 1. Tailwind CSS v4 Changes

#### Old Way (v3):
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
      }
    }
  }
}
```

#### New Way (v4):
```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... */
}
```

**What changed:**
- No `tailwind.config.js` file needed
- Use `@import "tailwindcss"` in CSS
- Use `@theme` directive for customization
- OKLCH color space instead of HSL
- CSS variables map directly: `bg-background` uses `--color-background`

### 2. Color System: HSL → OKLCH

#### Old (HSL):
```css
--primary: 221.2 83.2% 53.3%;  /* hsl format */
```

#### New (OKLCH):
```css
--primary: oklch(0.55 0.22 264);  /* oklch(lightness chroma hue) */
```

**Your current colors:**
```css
/* Light mode */
--background: oklch(1 0 0);              /* Pure white */
--foreground: oklch(0.145 0 0);          /* Almost black */
--primary: oklch(0.205 0 0);             /* Dark gray - change to blue if needed */
--muted-foreground: oklch(0.556 0 0);    /* Medium gray */

/* Dark mode */
--background: oklch(0.145 0 0);          /* Almost black */
--foreground: oklch(0.985 0 0);          /* Almost white */
--primary: oklch(0.922 0 0);             /* Light gray - change to blue if needed */
--border: oklch(1 0 0 / 10%);            /* Translucent white */
```

**For blue primary (recommended for Memora):**
```css
/* Light mode */
--primary: oklch(0.55 0.22 264);         /* Vibrant blue */

/* Dark mode */
--primary: oklch(0.488 0.243 264);       /* Blue for dark mode */
```

### 3. Next.js 15 Patterns

#### Typed Routes (Enabled)
Your `next.config.ts` has `typedRoutes: true`, so:

```tsx
// ✅ Good - TypeScript will check routes
import { Link } from 'next/link';

<Link href="/chat/[chatId]">Chat</Link>  // Type-safe!
```

#### Server vs Client Components

**Server Components (default):**
```tsx
// No directive needed - server by default
export default async function ChatPage({ params }: { params: { chatId: string } }) {
  const chat = await db.chat.findUnique({ where: { id: params.chatId } });
  return <ChatView chat={chat} />;
}
```

**Client Components:**
```tsx
'use client';  // Must be first line

import { useState } from 'react';

export function ChatInput() {
  const [message, setMessage] = useState('');
  return <input value={message} onChange={(e) => setMessage(e.target.value)} />;
}
```

**When to use 'use client':**
- useState, useEffect, useContext
- Event handlers (onClick, onChange)
- Browser APIs (window, localStorage)
- Zustand stores
- TanStack Query hooks

### 4. React 19 Updates

#### Use Hook (new in React 19)
```tsx
'use client';

import { use } from 'react';

// Can unwrap promises directly
export function ChatView({ chatPromise }: { chatPromise: Promise<Chat> }) {
  const chat = use(chatPromise);  // No need for Suspense wrapper!
  return <div>{chat.title}</div>;
}
```

#### useActionState (replaces useFormState)
```tsx
'use client';

import { useActionState } from 'react';

export function AddContextForm() {
  const [state, formAction] = useActionState(addContextAction, null);
  
  return (
    <form action={formAction}>
      <input name="name" />
      <button type="submit">Add</button>
    </form>
  );
}
```

#### useOptimistic (for optimistic updates)
```tsx
'use client';

import { useOptimistic } from 'react';

export function ChatMessages({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, newMessage]
  );
  
  return (
    <div>
      {optimisticMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
    </div>
  );
}
```

### 5. tRPC Client Pattern (Your Setup)

#### Your current setup:
```tsx
// apps/web/src/utils/trpc.ts
import { createTRPCClient } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
```

#### Using in components:
```tsx
'use client';

import { trpc, queryClient } from '@/utils/trpc';
import { useQuery, useMutation } from '@tanstack/react-query';

export function ChatList() {
  // Query
  const { data: chats, isLoading } = useQuery({
    ...trpc.chat.list.queryOptions(),
  });
  
  // Mutation
  const { mutate: sendMessage } = useMutation({
    ...trpc.chat.sendMessage.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.chat.list.queryOptions());
    },
  });
  
  return <div>{/* render chats */}</div>;
}
```

### 6. Vercel AI SDK Usage (Your Setup)

#### Your current AI endpoint:
```ts
// apps/server/src/index.ts
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

app.post("/ai", async (c) => {
  const body = await c.req.json();
  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(body.messages),
  });
  return result.toUIMessageStreamResponse();
});
```

#### Frontend usage with @ai-sdk/react:
```tsx
'use client';

import { useChat } from '@ai-sdk/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `${process.env.NEXT_PUBLIC_SERVER_URL}/ai`,
    body: {
      // Add context here
      contextIds: selectedContextIds,
    },
  });
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

### 7. Database: SQLite → PostgreSQL

#### Current (SQLite - development):
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### For Production (PostgreSQL):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Migration steps:**
1. Set up PostgreSQL (Vercel Postgres, Neon, or Supabase)
2. Update `DATABASE_URL` in `.env`
3. Change provider in `schema.prisma`
4. Run `bun run db:push` or `bun run db:migrate`

**Note:** Some features differ between SQLite and PostgreSQL:
- SQLite doesn't support `@db.Text` - just use `String`
- SQLite auto-converts `DateTime` - PostgreSQL uses `timestamp`
- JSON columns work differently

### 8. Bun-Specific Commands

Replace `npm`/`yarn` with `bun`:

```bash
# Install dependencies
bun install

# Add package
bun add package-name
bun add -D package-name  # dev dependency

# Run scripts
bun run dev
bun run build

# Run files directly
bun run src/index.ts

# Database commands (already configured)
bun run db:push
bun run db:studio
bun run db:generate
```

### 9. Shadcn UI (New York Style)

Your `components.json`:
```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  }
}
```

#### Adding components:
```bash
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add dropdown-menu
```

#### Your installed components:
- accordion, alert, alert-dialog, avatar, badge
- button, card, calendar, checkbox, collapsible
- dialog, dropdown-menu, form, input, label
- popover, scroll-area, select, separator, sidebar
- skeleton, switch, tabs, textarea, tooltip
- And many more...

### 10. Updated Implementation Patterns

#### Zustand Store (Client State):
```tsx
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatStore {
  currentChatId: string | null;
  selectedContextIds: string[];
  setCurrentChat: (id: string) => void;
  toggleContext: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      currentChatId: null,
      selectedContextIds: [],
      setCurrentChat: (id) => set({ currentChatId: id }),
      toggleContext: (id) =>
        set((state) => ({
          selectedContextIds: state.selectedContextIds.includes(id)
            ? state.selectedContextIds.filter((i) => i !== id)
            : [...state.selectedContextIds, id],
        })),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ currentChatId: state.currentChatId }),
    }
  )
);
```

#### Theme Provider (next-themes):
```tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

#### Layout with Providers:
```tsx
// app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/utils/trpc';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## 🚀 Updated Implementation Steps

### 1. Database Schema Setup

```bash
# Navigate to packages/db
cd packages/db/prisma/schema

# Create schema.prisma with Memora models (see MEMORA_SPEC.md)

# Generate Prisma client
cd ../../../../
bun run db:generate

# Push to database
bun run db:push

# Open Prisma Studio to verify
bun run db:studio
```

### 2. tRPC Router Setup

```typescript
// packages/api/src/routers/chat.ts
import { router, publicProcedure, protectedProcedure } from '../index';
import { z } from 'zod';

export const chatRouter = router({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.session is available (from protectedProcedure)
      return await ctx.db.chat.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { updatedAt: 'desc' },
      });
    }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      provider: z.enum(['CLAUDE', 'GEMINI', 'OPENAI']),
      model: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.chat.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),
});
```

### 3. Shadcn Component Usage

```tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddContextDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Context</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Context</DialogTitle>
          <DialogDescription>
            Add files, URLs, or GitHub repos to use in your chats.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Context name" />
          </div>
          <Button type="submit">Add Context</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 📚 Updated Resources

### Official Docs (Latest Versions):
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/blog/2024/04/25/react-19)
- [Tailwind CSS v4 Beta](https://tailwindcss.com/blog/tailwindcss-v4-beta)
- [Vercel AI SDK v5](https://sdk.vercel.ai/docs)
- [TanStack Query v5](https://tanstack.com/query/v5)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Better Auth](https://www.better-auth.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Bun Docs](https://bun.sh/docs)

### Tailwind CSS v4 Migration:
- [Migration Guide](https://tailwindcss.com/docs/v4-beta#migrating-from-v3)
- Key changes: `@import "tailwindcss"`, `@theme` directive, OKLCH colors

### React 19 New Features:
- `use` hook for promises
- `useActionState` for forms
- `useOptimistic` for optimistic UI
- Server Components improvements
- Actions (server and client)

## ⚠️ Important Notes

1. **Always use `'use client'` directive** for:
   - Components with hooks (useState, useEffect, etc.)
   - Event handlers
   - Zustand stores
   - Browser APIs

2. **Database for production**: Switch from SQLite to PostgreSQL before deploying

3. **Color system**: When updating colors in Google Stitch prompts, convert to OKLCH format

4. **Type safety**: Next.js 15 typed routes will catch routing errors at compile time

5. **Bun-specific**: Some npm packages may not work perfectly with Bun - test thoroughly

## 🔄 Migration Checklist

When following the implementation prompts:

- [ ] Replace `npm`/`yarn` commands with `bun`
- [ ] Use OKLCH colors instead of HSL/hex
- [ ] Add `'use client'` to interactive components
- [ ] Use Tailwind v4 syntax (`@theme` instead of config file)
- [ ] Use your existing tRPC pattern (createTRPCOptionsProxy)
- [ ] Follow React 19 patterns (use, useActionState)
- [ ] Plan SQLite → PostgreSQL migration for production
- [ ] Test with Bun runtime (some packages may behave differently)

---

**Refer to this document** when implementing features from CLAUDE_CODE_PROMPTS.md to ensure compatibility with your actual stack!
