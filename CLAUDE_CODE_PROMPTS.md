# Claude Code Implementation Prompts for Memora

> Step-by-step prompts for building Memora with an AI coding assistant like Claude Code.

## 📋 Prerequisites

Before starting, ensure:
- [ ] You've read `MEMORA_SPEC.md` completely
- [ ] You've generated UI mockups using `GOOGLE_STITCH_PROMPTS.md`
- [ ] Better-T-Stack is already set up (as per your project)
- [ ] You have accounts for Claude, Gemini, and OpenAI APIs

---

## Phase 1: Foundation Setup

### Prompt 1.1: Database Schema Setup

```
I'm building Memora, an AI chat app with context management. I need you to:

1. Update the Prisma schema at `apps/server/prisma/schema.prisma` with the following models:
   - User (id, email, name, avatar, createdAt, updatedAt)
   - Organization (id, name, slug, avatar, tokenLimit, spendingLimit, createdAt, updatedAt)
   - OrganizationMember (id, userId, organizationId, role: OWNER/ADMIN/MEMBER, joinedAt)
   - Chat (id, title, provider: CLAUDE/GEMINI/OPENAI, model, parentId, forkedFromMessageId, userId, createdAt, updatedAt)
   - Message (id, content, role: USER/ASSISTANT/SYSTEM, tokens, cost, latency, chatId, userId, createdAt)
   - ContextItem (id, name, description, type: FILE/URL/GITHUB_REPO/VIBE_RULE/DOCUMENT, scope: LOCAL/GLOBAL, content, rawContent, metadata, fileSize, tokens, userId, organizationId, parentId, createdAt, updatedAt)
   - Tag (id, name, color)
   - ChatContextItem (id, chatId, contextItemId, addedAt)
   - ChatShare (id, token, isPublic, expiresAt, chatId, sharedById, createdAt)
   - Invite (id, email, token, role, expiresAt, acceptedAt, organizationId, createdAt)
   - TokenUsage (id, provider, model, tokens, cost, userId, organizationId, createdAt)

2. Add proper relations between models
3. Add indexes for performance (userId, organizationId, chatId, createdAt)
4. Add enums for Role, AIProvider, ContextType, ContextScope, MessageRole

After creating the schema:
- Run `bun run db:push` to sync with database
- Generate Prisma client with `bun run db:generate`

Reference the full schema in MEMORA_SPEC.md if needed.
```

### Prompt 1.2: Environment Variables Setup

```
Set up environment variables for Memora:

1. Create `.env` file in `apps/server/` with:
   - DATABASE_URL (PostgreSQL connection string)
   - CLAUDE_API_KEY
   - GEMINI_API_KEY
   - OPENAI_API_KEY
   - S3_BUCKET_NAME (for file uploads)
   - S3_ACCESS_KEY_ID
   - S3_SECRET_ACCESS_KEY
   - S3_REGION
   - BETTER_AUTH_SECRET (for auth)
   - NEXT_PUBLIC_APP_URL (http://localhost:3000)

2. Create `.env.example` with placeholder values
3. Add `.env` to `.gitignore`
4. Update `apps/web/.env.local` with:
   - NEXT_PUBLIC_API_URL (http://localhost:3001)
   - NEXT_PUBLIC_APP_URL

Don't include actual API keys, just show the structure.
```

### Prompt 1.3: Shadcn UI Setup & Theme

```
Set up Shadcn UI with dual theme (light/dark) for Memora:

1. Initialize Shadcn in `apps/web/`:
   ```
   npx shadcn@latest init
   ```
   - Choose Next.js App Router
   - TypeScript: Yes
   - Tailwind: Yes
   - CSS variables for colors

2. Update `tailwind.config.ts` with Memora color palette:
   - Light mode: background #FFFFFF, foreground #0A0A0A, primary #2563EB
   - Dark mode: background #020817, foreground #F8FAFC, primary #3B82F6
   - Accent colors: orange #FF8C42, teal #2C9F8B, purple #8B5CF6

3. Install these Shadcn components:
   ```
   npx shadcn@latest add button input textarea dropdown-menu dialog avatar badge card tabs switch
   ```

4. Create theme provider in `apps/web/src/components/theme-provider.tsx`
5. Add theme toggle component in `apps/web/src/components/theme-toggle.tsx`

Use the exact color values from MEMORA_SPEC.md's "Visual Design System" section.
```

---

## Phase 2: Core Chat Implementation

### Prompt 2.1: Chat Store (Zustand)

```
Create a Zustand store for chat state management in `apps/web/src/stores/chat-store.ts`:

Features needed:
1. State:
   - currentChatId: string | null
   - chats: Chat[]
   - messages: Map<chatId, Message[]>
   - selectedProvider: AIProvider
   - selectedModel: string
   - isStreaming: boolean
   - selectedContextItems: ContextItem[]

2. Actions:
   - setCurrentChat(chatId: string)
   - createNewChat(provider: AIProvider, model: string)
   - addMessage(chatId: string, message: Message)
   - updateMessage(chatId: string, messageId: string, content: string)
   - setStreaming(isStreaming: boolean)
   - selectContext(item: ContextItem)
   - deselectContext(itemId: string)
   - clearSelectedContext()
   - forkChat(chatId: string, fromMessageId: string)

3. Use Immer for immutable updates
4. Persist currentChatId to localStorage
5. Type everything with TypeScript

Reference Chat and Message types from Prisma schema.
```

### Prompt 2.2: Chat Layout Component

```
Create the main chat layout in `apps/web/src/components/layout/main-layout.tsx`:

Structure:
- Three-column layout using flexbox
- Left sidebar (240px, fixed)
- Center chat area (flexible)
- Right context panel (320px, collapsible)

Left Sidebar:
- Organization switcher at top
- "New Chat" button
- Recent chats list (scrollable)
- Settings button at bottom

Center Chat Area:
- Header with chat title and model selector
- Scrollable messages area
- Fixed chat input at bottom

Right Context Panel:
- Toggle button to show/hide
- Tabs: Vibe-Tools, Context, Usage
- Context items list with checkboxes
- "Add Context" button

Make it responsive:
- On mobile: hide sidebars, show hamburger menu
- On tablet: collapsible sidebars
- Use Tailwind classes for responsive design

Reference design from GOOGLE_STITCH_PROMPTS.md "Main Dashboard Layout".
```

### Prompt 2.3: Chat Message Component

```
Create chat message components:

1. `apps/web/src/components/chat/chat-message.tsx`:
   - Props: role, content, timestamp, tokens?, cost?, onFork?
   - User messages: align right, blue background
   - AI messages: align left, gray background with avatar
   - Markdown rendering for content (use react-markdown)
   - Code syntax highlighting (use highlight.js)
   - Show metadata (tokens, cost, latency) on hover
   - "Fork from here" button on hover
   - Timestamp formatting (use date-fns)

2. `apps/web/src/components/chat/chat-list.tsx`:
   - Renders list of messages
   - Auto-scroll to bottom on new messages
   - Virtualization for performance (use @tanstack/react-virtual if many messages)
   - Loading skeleton while fetching

Use the design from GOOGLE_STITCH_PROMPTS.md "Chat Message Components".
Follow Shadcn UI patterns for consistency.
```

### Prompt 2.4: Chat Input Component

```
Create chat input in `apps/web/src/components/chat/chat-input.tsx`:

Features:
1. Auto-growing textarea (max 200px height)
2. Show selected context chips above input
3. Context chip: name + token count + remove button
4. Format toolbar: Bold, Italic, Code (markdown shortcuts)
5. Cost estimate shown in real-time
6. Send button (disabled when empty, loading during send)
7. Keyboard shortcuts:
   - Enter: send message
   - Shift+Enter: new line
   - "/" : show command palette (future feature)

State management:
- Track input value locally
- Calculate estimated cost based on:
  - Input tokens
  - Selected context tokens
  - Current model pricing
- Show cost as "Est. $0.02" next to send button

Use Zustand chat store to get selectedContextItems and send message.
Reference design from GOOGLE_STITCH_PROMPTS.md "Chat Input Area".
```

### Prompt 2.5: Model Selector Component

```
Create AI model selector dropdown in `apps/web/src/components/chat/model-selector.tsx`:

Features:
1. Dropdown showing current provider + model
2. List all available models grouped by provider:
   - Claude: 3.5 Sonnet, 3 Opus, 3 Haiku
   - Gemini: 1.5 Pro, 1.5 Flash
   - OpenAI: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
3. Show pricing for each model (per 1M tokens)
4. Provider logos/icons for each section
5. Selected model highlighted
6. Update Zustand store on selection

Model pricing (reference):
- Claude 3.5 Sonnet: $3/1M tokens
- GPT-4 Turbo: $10/1M tokens
- Gemini 1.5 Pro: $7/1M tokens
(Add others as needed)

Use Shadcn DropdownMenu component.
Reference design from GOOGLE_STITCH_PROMPTS.md "Model Selector Dropdown".
```

---

## Phase 3: AI Provider Integration

### Prompt 3.1: AI Provider Abstraction

```
Create AI provider abstraction layer in `apps/server/src/lib/ai/provider.ts`:

1. Define interface `AIProvider`:
   ```typescript
   interface AIProvider {
     sendMessage(params: {
       messages: { role: string; content: string }[];
       model: string;
       stream: boolean;
     }): AsyncGenerator<string> | Promise<string>;
     
     estimateCost(tokens: number, model: string): number;
     countTokens(text: string, model: string): number;
   }
   ```

2. Create implementations:
   - `apps/server/src/lib/ai/claude.ts` (Claude AI provider using Anthropic SDK)
   - `apps/server/src/lib/ai/gemini.ts` (Gemini provider using Google AI SDK)
   - `apps/server/src/lib/ai/openai.ts` (OpenAI provider using OpenAI SDK)

3. Create factory function:
   ```typescript
   export function getProvider(provider: 'claude' | 'gemini' | 'openai'): AIProvider
   ```

4. Use Vercel AI SDK for streaming responses
5. Handle errors gracefully with proper error messages
6. Add retry logic (exponential backoff) for failed requests

Install needed packages:
- @anthropic-ai/sdk
- @google/generative-ai
- openai
- ai (Vercel AI SDK)
```

### Prompt 3.2: Chat API Route (tRPC)

```
Create tRPC router for chat in `apps/server/src/routers/chat.ts`:

Procedures:
1. `create`:
   - Input: { title?, provider, model }
   - Creates new chat in database
   - Returns chat object

2. `list`:
   - Input: { limit?, cursor? }
   - Lists user's chats (paginated)
   - Returns chats array + nextCursor

3. `get`:
   - Input: { chatId }
   - Returns chat with messages
   - Check user owns the chat

4. `sendMessage`:
   - Input: { chatId, content, contextIds[] }
   - Saves user message
   - Gets selected context content
   - Calls AI provider with context + message
   - Streams response back to client
   - Saves AI response to database
   - Tracks token usage
   - Returns message object

5. `delete`:
   - Input: { chatId }
   - Soft delete or hard delete chat
   - Check user owns the chat

6. `fork`:
   - Input: { chatId, fromMessageId }
   - Creates new chat
   - Copies messages up to fromMessageId
   - Sets parentId and forkedFromMessageId
   - Returns new chat object

Use tRPC middleware to check authentication.
Reference Prisma schema for model structure.
```

### Prompt 3.3: Streaming Implementation

```
Implement real-time message streaming in the chat:

1. Update `sendMessage` tRPC procedure to support streaming:
   - Use tRPC subscription or Vercel AI SDK streaming
   - Stream tokens as they arrive from AI provider
   - Update frontend in real-time

2. On the frontend (`apps/web/src/hooks/use-chat.ts`):
   - Create custom hook `useChat`:
     ```typescript
     export function useChat(chatId: string) {
       const sendMessage = (content: string) => {
         // Call tRPC mutation
         // Handle streaming response
         // Update Zustand store in real-time
       }
       return { messages, sendMessage, isStreaming }
     }
     ```

3. In chat message list:
   - Show streaming message with typing indicator
   - Update content as tokens arrive
   - Show final message when complete

4. Handle errors during streaming:
   - Show error message
   - Allow retry
   - Don't lose partial content

Use Vercel AI SDK's `useChat` hook as reference, but integrate with tRPC and Zustand.
```

---

## Phase 4: Context Management

### Prompt 4.1: Context Store (Zustand)

```
Create Zustand store for context in `apps/web/src/stores/context-store.ts`:

State:
- localItems: ContextItem[]
- globalItems: ContextItem[]
- selectedIds: Set<string>
- isLoading: boolean
- uploadProgress: Map<fileId, number>

Actions:
- fetchContextItems(scope: 'local' | 'global' | 'all')
- addContextItem(item: Partial<ContextItem>)
- updateContextItem(id: string, updates: Partial<ContextItem>)
- deleteContextItem(id: string)
- selectItem(id: string)
- deselectItem(id: string)
- clearSelection()
- setUploadProgress(fileId: string, progress: number)
- forkContextItem(id: string)

Computed values:
- selectedItems: ContextItem[]
- totalSelectedTokens: number
- estimatedCost: number (based on selected tokens + current model)

Integrate with TanStack Query for server state synchronization.
```

### Prompt 4.2: File Upload & Processing

```
Implement file upload and processing:

1. Frontend upload component (`apps/web/src/components/context/context-upload.tsx`):
   - Drag & drop area
   - File picker button
   - Show upload progress
   - Support multiple files
   - File type validation (PDF, MD, TXT, code files)
   - Size limit validation (10MB per file)
   - Preview uploaded files before processing

2. Backend upload endpoint (`apps/server/src/routers/context.ts`):
   - `uploadFile` procedure:
     - Upload file to S3
     - Extract text content based on file type:
       - PDF: use pdf-parse
       - Markdown/Text: read directly
       - Code: read with syntax detection
       - Docx: use mammoth
     - Count tokens (use tiktoken for OpenAI tokenizer)
     - Save to database as ContextItem
     - Return item with metadata

3. Install packages:
   ```
   bun add pdf-parse mammoth tiktoken @aws-sdk/client-s3
   ```

4. Create helper (`apps/server/src/lib/context/file-processor.ts`):
   - `processFile(buffer: Buffer, mimeType: string): Promise<{ content: string, tokens: number }>`
   - Handle different file types
   - Extract clean text
   - Remove excessive whitespace

Reference the upload modal design from GOOGLE_STITCH_PROMPTS.md.
```

### Prompt 4.3: URL Fetcher & GitHub Integration

```
Implement URL and GitHub repo context:

1. URL Fetcher (`apps/server/src/lib/context/url-fetcher.ts`):
   - Fetch URL content with fetch API
   - Extract article content (use @mozilla/readability)
   - Remove ads, navigation, footers
   - Convert HTML to markdown (use turndown)
   - Count tokens
   - Return clean content

2. GitHub Cloner (`apps/server/src/lib/context/github-cloner.ts`):
   - Accept GitHub repo URL
   - Use GitHub API to fetch repo tree
   - Show file/folder tree to user (frontend)
   - User selects specific files/folders
   - Fetch selected files via GitHub API (not full clone)
   - Concatenate selected files
   - Count tokens
   - Save metadata (repo name, branch, selected paths)

3. tRPC procedures in `apps/server/src/routers/context.ts`:
   - `addUrl`: Input { url, name?, tags[], scope }
   - `addGithubRepo`: Input { repoUrl, selectedPaths[], name?, tags[], scope }
   - Both return ContextItem

4. Frontend components:
   - `apps/web/src/components/context/url-input.tsx`
   - `apps/web/src/components/context/github-selector.tsx` (tree view with checkboxes)

Install packages:
```
bun add @mozilla/readability turndown jsdom @octokit/rest
```
```

### Prompt 4.4: Context Panel UI

```
Create context panel in `apps/web/src/components/context/context-panel.tsx`:

Structure:
1. Header:
   - Title "Context Library"
   - Search input
   - "Add Context" button (opens dropdown)

2. Tabs:
   - Vibe-Tools (empty for now, say "Coming soon")
   - Context (active)
   - Usage (token usage, implement later)

3. Context Tab:
   - Two collapsible sections: "Local" and "Global"
   - Each section shows filtered context items
   - Empty state when no items

4. Context Item component (`apps/web/src/components/context/context-item.tsx`):
   - Icon based on type (File, URL, GitHub, Vibe-Rule)
   - Name (truncated)
   - Tags (colored pills, removable)
   - Token count
   - Checkbox for selection
   - Three-dot menu: Edit, Fork, Delete
   - Hover state shows full details

5. Context Upload Modal (`apps/web/src/components/context/context-modal.tsx`):
   - Tabs: Upload File, URL, GitHub Repo, Vibe-Rule
   - Each tab has specific form
   - Common fields: name, description, tags, scope
   - Shows estimated tokens and processing time

Use Shadcn components: Tabs, Checkbox, Badge, DropdownMenu, Dialog.
Reference designs from GOOGLE_STITCH_PROMPTS.md "Context Panel" and "Context Item Card".
```

### Prompt 4.5: Context Selection & Injection

```
Implement context selection and injection into chat:

1. When user selects context items (checkboxes in context panel):
   - Update Zustand context store
   - Show selected items as chips above chat input
   - Update token count and cost estimate

2. When user sends message:
   - Gather selected context content
   - Format context for AI:
     ```
     <context>
     <document name="architecture.md" tokens="2100">
     [content here]
     </document>
     
     <url name="Next.js Docs" url="https://..." tokens="5300">
     [content here]
     </url>
     
     <github repo="shadcn/ui" paths="src/components/*" tokens="12000">
     [content here]
     </github>
     </context>
     
     <user_message>
     [actual user message]
     </user_message>
     ```

3. Send formatted message to AI provider
4. Track which context was used (ChatContextItem join table)
5. Show context chips in message history (optional)

Update the `sendMessage` procedure in chat router to accept `contextIds[]` and inject context.
```

---

## Phase 5: Organizations & Collaboration

### Prompt 5.1: Organization CRUD

```
Create organization management:

1. tRPC router (`apps/server/src/routers/org.ts`):
   - `create`: Input { name, slug? }, creates org with user as OWNER
   - `list`: Returns orgs user is member of
   - `get`: Input { orgId }, returns org details + members
   - `update`: Input { orgId, name?, avatar?, tokenLimit?, spendingLimit? }
   - `delete`: Input { orgId }, soft delete org (owner only)
   - `leave`: Input { orgId }, removes user from org

2. Frontend pages:
   - `apps/web/src/app/(dashboard)/settings/organization/page.tsx`
     - Org settings form
     - Member list
     - Invite button
     - Danger zone (delete org)
   
   - `apps/web/src/components/org/org-create-modal.tsx`
     - Form: org name → generates slug
     - Create button

3. Middleware:
   - Check user is member of org before any org operations
   - Check user has OWNER/ADMIN role for admin operations

Reference Organization and OrganizationMember models from Prisma schema.
```

### Prompt 5.2: Invite System

```
Create team member invite system:

1. Backend (`apps/server/src/routers/invite.ts`):
   - `create`: Input { organizationId, email, role }
     - Generate unique token
     - Set expiration (7 days)
     - Send email (use Resend or similar)
     - Return invite object
   
   - `list`: Input { organizationId }, returns pending invites
   
   - `accept`: Input { token }
     - Validate token and expiration
     - Create OrganizationMember
     - Mark invite as accepted
     - Return organization
   
   - `revoke`: Input { inviteId }, deletes invite

2. Frontend:
   - `apps/web/src/components/org/invite-modal.tsx`
     - Input: email
     - Select: role (MEMBER, ADMIN)
     - Send button
     - Show pending invites list
   
   - `apps/web/src/app/invite/[token]/page.tsx`
     - Public page for accepting invite
     - Shows org name and inviter
     - "Join" button (requires login)
     - Validates token
     - On accept → redirects to org dashboard

3. Email template:
   - Subject: "You're invited to join [Org Name] on Memora"
   - Body: Personalized message, join link, expires in 7 days
   - Use React Email for templates

Install: `bun add resend react-email`
```

### Prompt 5.3: Organization Switcher

```
Create organization switcher component:

1. Component (`apps/web/src/components/org/org-switcher.tsx`):
   - Shows current org (name, avatar, plan)
   - Dropdown with:
     - "Personal" workspace
     - List of organizations
     - Divider
     - "Create Organization"
     - "Organization Settings"
   - Checkmark on selected org
   - Smooth switching animation

2. Zustand store (`apps/web/src/stores/org-store.ts`):
   - State:
     - currentOrgId: string | null
     - organizations: Organization[]
     - currentOrg: Organization | null (computed)
   - Actions:
     - setCurrentOrg(orgId: string | null)
     - fetchOrganizations()
     - createOrganization(name: string)
   - Persist currentOrgId to localStorage

3. When org is switched:
   - Update context (show global context for that org)
   - Update chats (filter by org if needed)
   - Update URL query param (?org=xyz)

4. Place switcher at top of left sidebar

Reference design from GOOGLE_STITCH_PROMPTS.md "Organization Switcher".
```

### Prompt 5.4: Global Context Visibility

```
Implement global context sharing across organization:

1. When creating/editing context:
   - If scope is "GLOBAL":
     - Save with organizationId
     - All members of org can see it
   - If scope is "LOCAL":
     - Save with only userId
     - Only creator can see it

2. Context fetch query:
   - Filter by scope:
     - Local: WHERE userId = currentUser AND scope = 'LOCAL'
     - Global: WHERE organizationId = currentOrg AND scope = 'GLOBAL'
   - Both: Union of above

3. Context panel shows:
   - "Local" section: user's private context
   - "Global" section: org's shared context
   - "Global" items have org badge/icon

4. Permissions:
   - Anyone can view global context
   - Only ADMIN/OWNER can edit/delete global context
   - Anyone can fork global context to local

5. Real-time updates:
   - When someone adds global context, others see it immediately
   - Use WebSockets or polling (TanStack Query refetch)

Update context tRPC router with proper filtering and permissions.
```

---

## Phase 6: Chat Sharing & Forking

### Prompt 6.1: Share Chat Feature

```
Implement chat sharing:

1. Backend (`apps/server/src/routers/share.ts`):
   - `createShare`: Input { chatId, expiresAt? }
     - Generate unique token
     - Create ChatShare record
     - Return share link: `${APP_URL}/share/${token}`
   
   - `getSharedChat`: Input { token }
     - Public endpoint (no auth required)
     - Validate token and expiration
     - Return chat with messages (read-only)
     - Increment view count (optional)

2. Frontend:
   - `apps/web/src/components/chat/share-modal.tsx`
     - Preview of chat
     - Generated link (copy button)
     - Expiration dropdown
     - "Create Link" button
   
   - `apps/web/src/app/share/[token]/page.tsx`
     - Public page showing read-only chat
     - Nice header: "Shared by [User Name]"
     - All messages visible
     - No input field (read-only)
     - "Fork this chat" button (requires login)

3. Share button in chat header:
   - Icon button
   - Opens share modal
   - Shows existing share links

Reference design from GOOGLE_STITCH_PROMPTS.md "Share Chat Modal".
```

### Prompt 6.2: Fork Chat Feature

```
Implement chat forking:

1. Backend (update `apps/server/src/routers/chat.ts`):
   - `fork`: Input { chatId, fromMessageId? }
     - Create new chat with:
       - parentId = chatId
       - forkedFromMessageId = fromMessageId (if specified)
       - userId = currentUser
       - Same provider and model
     - Copy messages:
       - If fromMessageId: copy up to and including that message
       - If not specified: copy all messages
     - Return new chat object

2. Frontend:
   - Add "Fork from here" button on message hover:
     - Shows on all messages (user and assistant)
     - Icon button with fork icon
     - Click → calls fork mutation → redirects to new chat
   
   - In shared chat view:
     - "Fork this chat" button in header
     - Forks entire chat
     - Requires login (redirect to login if not authenticated)

3. Fork indicator:
   - Show "Forked from [Chat Title]" in chat header
   - Link to parent chat
   - Show which message it was forked from (optional)

4. Update chat list:
   - Show fork indicator icon on forked chats
   - Show tree structure (optional, advanced)

This allows users to branch conversations at any point.
```

---

## Phase 7: Token Tracking & Analytics

### Prompt 7.1: Token Usage Tracking

```
Implement token usage tracking:

1. Backend helper (`apps/server/src/lib/token-tracker.ts`):
   ```typescript
   export async function trackTokenUsage(params: {
     userId: string;
     organizationId?: string;
     provider: AIProvider;
     model: string;
     tokens: number;
   }) {
     const cost = calculateCost(params.provider, params.model, params.tokens);
     await prisma.tokenUsage.create({
       data: { ...params, cost }
     });
   }
   
   function calculateCost(provider: AIProvider, model: string, tokens: number): number {
     // Pricing per 1M tokens
     const pricing = {
       'claude-3-5-sonnet': 3,
       'gpt-4-turbo': 10,
       'gemini-1.5-pro': 7,
       // ... add all models
     };
     return (tokens / 1_000_000) * pricing[model];
   }
   ```

2. Call `trackTokenUsage` in:
   - After every AI message (in `sendMessage` procedure)
   - Track both input tokens and output tokens separately

3. Create tRPC router (`apps/server/src/routers/token-usage.ts`):
   - `getStats`: Input { period: '7d' | '30d' | '90d', organizationId? }
     - Returns: totalTokens, totalCost, byProvider, byUser, byDay
   - `getLimit`: Input { organizationId? }
     - Returns: current usage vs limit
   - `setLimit`: Input { organizationId, tokenLimit, spendingLimit }
     - Admin only

4. Frontend hook (`apps/web/src/hooks/use-token-stats.ts`):
   ```typescript
   export function useTokenStats(period: string) {
     const { data, isLoading } = trpc.tokenUsage.getStats.useQuery({ period });
     return { stats: data, isLoading };
   }
   ```

This enables analytics and cost control.
```

### Prompt 7.2: Token Usage Dashboard

```
Create token usage dashboard page:

1. Page (`apps/web/src/app/(dashboard)/usage/page.tsx`):
   - Header with date range selector
   - Four summary cards:
     - Total tokens used
     - Total cost
     - Avg per chat
     - Current month progress (% of limit)
   - Line chart: usage over time (by provider)
   - Two-column section:
     - Left: Pie chart (usage by provider)
     - Right: Bar chart (usage by user, if org admin)
   - Table: Recent activity (date, user, chat, provider, model, tokens, cost)

2. Components:
   - `apps/web/src/components/usage/stats-card.tsx`
     - Shows metric, value, trend
   - `apps/web/src/components/usage/usage-chart.tsx`
     - Line chart using recharts or tremor
   - `apps/web/src/components/usage/usage-table.tsx`
     - Data table with sorting and pagination

3. Install charting library:
   ```
   bun add recharts
   ```
   Or use Tremor for pre-built dashboard components:
   ```
   bun add @tremor/react
   ```

4. Real-time cost estimate:
   - In chat input, show estimated cost before sending
   - Calculate based on:
     - Input message tokens
     - Selected context tokens
     - Current model pricing
     - Show as "Est. $0.02"

Reference design from GOOGLE_STITCH_PROMPTS.md "Token Usage Dashboard".
```

### Prompt 7.3: Usage Limits & Alerts

```
Implement usage limits and alerts:

1. Backend checks:
   - Before sending message, check if user/org has exceeded limit:
     ```typescript
     async function checkLimit(userId: string, organizationId?: string) {
       const usage = await getMonthlyUsage(userId, organizationId);
       const limit = await getLimit(organizationId);
       if (usage.tokens >= limit.tokenLimit) {
         throw new TRPCError({
           code: 'FORBIDDEN',
           message: 'Token limit exceeded'
         });
       }
       if (usage.cost >= limit.spendingLimit) {
         throw new TRPCError({
           code: 'FORBIDDEN',
           message: 'Spending limit exceeded'
         });
       }
     }
     ```
   - Call before every AI request

2. Frontend alerts:
   - Show banner when approaching limit (80%, 90%, 100%)
   - Color-coded: yellow at 80%, red at 100%
   - Banner in chat header or top of page
   - Link to upgrade plan or contact admin

3. Email notifications:
   - Send email when:
     - 80% limit reached
     - 100% limit reached
   - Use Resend to send emails

4. Settings page:
   - Allow org admins to set/update limits
   - Input fields: token limit, spending limit
   - Show current usage progress bars

This prevents unexpected bills and gives users control.
```

---

## Phase 8: Polish & Optimization

### Prompt 8.1: Loading States & Skeletons

```
Add proper loading states throughout the app:

1. Create skeleton components:
   - `apps/web/src/components/ui/skeleton.tsx` (if not in Shadcn)
   - `apps/web/src/components/chat/chat-skeleton.tsx`
     - Shows 3-4 message placeholders
   - `apps/web/src/components/context/context-skeleton.tsx`
     - Shows list of context item placeholders

2. Use skeletons in:
   - Chat list while loading
   - Message list while fetching history
   - Context panel while loading items
   - Settings pages while loading data

3. Streaming states:
   - Show typing indicator while AI is responding
   - Pulse animation on AI avatar
   - Streaming text with cursor

4. Upload states:
   - Show progress bar during file upload
   - Processing spinner after upload
   - Success checkmark when done
   - Error state with retry button

5. Use React Suspense for code splitting:
   - Wrap lazy-loaded routes in Suspense with fallback

Improves perceived performance and user experience.
```

### Prompt 8.2: Error Handling

```
Implement comprehensive error handling:

1. Create error boundary (`apps/web/src/components/error-boundary.tsx`):
   - Catches React errors
   - Shows friendly error message
   - "Try again" button
   - Logs error to console / monitoring service

2. API error handling:
   - tRPC errors: show toast notifications
   - Network errors: show retry button
   - Auth errors: redirect to login
   - Rate limit errors: show helpful message
   - AI provider errors: explain and suggest alternatives

3. Toast notifications:
   - Use Shadcn toast component
   - Success: green
   - Error: red
   - Warning: yellow
   - Info: blue

4. Validation errors:
   - Form validation with zod
   - Show inline errors on form fields
   - Prevent submission until valid

5. Create error toast helper:
   ```typescript
   export function showError(error: unknown) {
     const message = error instanceof Error ? error.message : 'Something went wrong';
     toast.error(message);
   }
   ```

Use in all tRPC mutations and queries.
```

### Prompt 8.3: Performance Optimization

```
Optimize app performance:

1. Code splitting:
   - Lazy load routes with React.lazy()
   - Dynamic imports for heavy components
   - Split vendor bundles in Next.js config

2. Image optimization:
   - Use Next.js <Image> component for avatars
   - Lazy load images
   - WebP format with fallbacks

3. Data fetching:
   - Prefetch chat list on mount
   - Infinite scroll for chat history (TanStack Query)
   - Debounce search inputs
   - Cache context items (TanStack Query)

4. Virtualization:
   - Use @tanstack/react-virtual for long message lists
   - Virtual scrolling for context items list

5. Bundle analysis:
   - Run `npm run build` and check bundle sizes
   - Remove unused dependencies
   - Tree-shake libraries

6. Database:
   - Add indexes on frequently queried fields
   - Use pagination for large datasets
   - Consider connection pooling for Prisma

7. Memoization:
   - Use React.memo for expensive components
   - useMemo for expensive computations
   - useCallback for event handlers passed to children

Target: < 3s First Contentful Paint, < 5s Time to Interactive.
```

### Prompt 8.4: Responsive Design

```
Make the app fully responsive:

1. Layout breakpoints:
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: > 1024px

2. Mobile layout:
   - Hide sidebars by default
   - Hamburger menu for navigation
   - Full-width chat area
   - Drawer for context panel (bottom sheet)
   - Collapsible sections

3. Tablet layout:
   - Collapsible left sidebar
   - Full chat area
   - Optional right sidebar (overlay)

4. Touch interactions:
   - Larger tap targets (min 44px)
   - Swipe gestures:
     - Swipe left: open context panel
     - Swipe right: open navigation
   - Pull to refresh

5. Responsive components:
   - Use Tailwind responsive classes (md:, lg:)
   - Modal → Drawer on mobile
   - Dropdown → Bottom sheet on mobile
   - Table → Cards on mobile

6. Test on:
   - iPhone (Safari)
   - Android (Chrome)
   - iPad
   - Small desktop (1366x768)

Use Chrome DevTools device emulation for testing.
```

### Prompt 8.5: Dark/Light Theme Polish

```
Polish theme implementation:

1. Ensure all components support both themes:
   - Check colors in dark mode
   - Adjust border colors for visibility
   - Ensure sufficient contrast (WCAG AA)

2. Theme toggle:
   - Accessible button (keyboard navigation)
   - Smooth transition animation
   - Persist preference to localStorage
   - Respect system preference on first load

3. Chart themes:
   - Update chart colors for dark mode
   - Ensure axis labels are visible
   - Adjust grid lines

4. Syntax highlighting:
   - Light theme: use light code theme
   - Dark theme: use dark code theme
   - Configure highlight.js themes

5. Image handling:
   - Use appropriate images for each theme
   - Add dark mode variants where needed

6. Test every page in both themes:
   - Chat interface
   - Context panel
   - Settings pages
   - Dashboard/analytics
   - Shared chat view

Goal: Seamless experience in both themes, no jarring contrasts.
```

---

## Phase 9: Testing & Deployment

### Prompt 9.1: Unit Tests

```
Add unit tests for critical functions:

1. Install testing libraries:
   ```
   bun add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
   ```

2. Test utils (`apps/web/src/lib/utils.test.ts`):
   - Token counting functions
   - Cost calculation
   - Date formatting
   - Markdown parsing

3. Test stores (`apps/web/src/stores/*.test.ts`):
   - Chat store actions
   - Context store actions
   - Org store actions
   - Mock Zustand stores

4. Test components (`apps/web/src/components/**/*.test.tsx`):
   - ChatMessage rendering
   - ContextItem selection
   - ModelSelector interaction
   - Form validation

5. Test API logic (`apps/server/src/lib/**/*.test.ts`):
   - File processor
   - URL fetcher
   - Token tracker
   - AI provider abstraction

6. Run tests:
   ```
   bun test
   bun test --coverage
   ```

Aim for 70%+ coverage on critical paths.
```

### Prompt 9.2: E2E Tests (Optional)

```
Add end-to-end tests with Playwright:

1. Install Playwright:
   ```
   bun add -D @playwright/test
   npx playwright install
   ```

2. Test flows (`apps/web/e2e/*.spec.ts`):
   - User signup and login
   - Create new chat
   - Send message and receive response
   - Upload context file
   - Select context and use in chat
   - Share chat and view shared link
   - Fork chat
   - Create organization and invite member

3. Run E2E tests:
   ```
   bun playwright test
   ```

4. CI integration:
   - Run tests on every PR
   - Use GitHub Actions or similar

E2E tests catch integration issues before production.
```

### Prompt 9.3: Production Build

```
Prepare for production:

1. Environment variables:
   - Create `.env.production` for production values
   - Use Vercel environment variables UI
   - Never commit secrets

2. Build optimizations:
   - Enable Next.js production mode
   - Minify and compress assets
   - Generate static pages where possible
   - Optimize images

3. Database:
   - Run migrations on production DB:
     ```
     bun run db:migrate
     ```
   - Set up connection pooling (PgBouncer)
   - Enable query logging (temporarily for debugging)

4. Monitoring:
   - Set up Sentry for error tracking
   - Add logging (winston or pino)
   - Set up Vercel Analytics
   - Monitor API response times

5. Security:
   - Enable CORS with whitelist
   - Rate limiting (upstash-ratelimit)
   - Add CSP headers
   - Enable HTTPS only
   - Validate all inputs

6. Build command:
   ```
   bun run build
   ```

Test production build locally before deploying.
```

### Prompt 9.4: Deploy to Vercel

```
Deploy Memora to Vercel:

1. Set up Vercel project:
   - Connect GitHub repo
   - Import project
   - Select root directory
   - Framework: Next.js
   - Build command: `bun run build`
   - Output directory: `.next`

2. Environment variables:
   - Add all required env vars in Vercel dashboard
   - DATABASE_URL (use Vercel Postgres or Neon)
   - API keys (Claude, Gemini, OpenAI)
   - S3 credentials
   - BETTER_AUTH_SECRET

3. Database:
   - Provision Vercel Postgres or use Neon
   - Run migrations after DB is set up
   - Test connection

4. Domains:
   - Add custom domain (optional)
   - Configure DNS
   - Enable automatic HTTPS

5. Deploy:
   - Push to main branch → auto-deploy
   - Or manually trigger deployment in Vercel

6. Post-deployment:
   - Test all features in production
   - Monitor error tracking
   - Check performance metrics
   - Set up alerts for downtime

7. Continuous deployment:
   - Main branch → production
   - Feature branches → preview deployments

Vercel handles scaling, CDN, and edge functions automatically.
```

---

## Phase 10: Advanced Features (Future)

### Ideas for Later

```
Advanced features to add after MVP:

1. **Collaborative Chats**:
   - Multiple users in one chat
   - Real-time collaboration (WebSockets)
   - See who's typing

2. **Context Suggestions**:
   - AI suggests relevant context based on message
   - "Add suggested context" button
   - Smart context search

3. **Prompt Templates**:
   - Save frequently used prompts
   - Variables in templates
   - Share templates with team

4. **Integrations**:
   - Slack notifications
   - GitHub issues/PRs context
   - Google Drive files
   - Notion pages

5. **Advanced Search**:
   - Full-text search across chats
   - Search within context
   - Filters: date, provider, tags

6. **Export & Backup**:
   - Export chats as Markdown
   - Backup all context
   - Import from other tools

7. **Voice Input**:
   - Speech-to-text for messages
   - Audio file context

8. **Custom AI Training**:
   - Fine-tune models on org context
   - Personalized responses

9. **Analytics**:
   - Most effective context
   - Best-performing prompts
   - User productivity metrics

10. **Mobile Apps**:
    - React Native for iOS/Android
    - Native notifications

Implement these based on user feedback and demand.
```

---

## 🎉 Completion Checklist

Before launching:

- [ ] All database migrations applied
- [ ] Authentication working (signup, login, logout)
- [ ] Chat creation and messaging functional
- [ ] All 3 AI providers (Claude, Gemini, OpenAI) working
- [ ] Message streaming smooth
- [ ] File upload and processing working
- [ ] URL fetching working
- [ ] GitHub repo integration working
- [ ] Context selection and injection working
- [ ] Local vs Global context properly separated
- [ ] Organization creation and management working
- [ ] Invite system functional (send and accept)
- [ ] Org switcher working
- [ ] Chat sharing with public links working
- [ ] Chat forking at any message working
- [ ] Token usage tracking accurate
- [ ] Token usage dashboard showing correct data
- [ ] Usage limits and alerts working
- [ ] Dark and light themes polished
- [ ] Responsive on mobile, tablet, desktop
- [ ] Loading states and skeletons everywhere
- [ ] Error handling and toasts working
- [ ] No console errors or warnings
- [ ] Performance: fast page loads, smooth interactions
- [ ] Tests passing (unit and E2E)
- [ ] Production build successful
- [ ] Deployed to Vercel
- [ ] All environment variables set
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (Sentry)
- [ ] Analytics set up (Vercel Analytics)

---

## 📚 Additional Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Prisma](https://www.prisma.io/docs)
- [tRPC](https://trpc.io/docs)
- [Next.js](https://nextjs.org/docs)
- [Hono](https://hono.dev/)

---

**You're ready to build!** Use these prompts with Claude Code or any AI coding assistant. Work through them in order, test each feature before moving to the next, and adjust based on feedback. Good luck! 🚀
