# MEMORA

> **Version 2.1** | AI Chat with Context Library, Rules Engine & Prompt Enhancement

![Memora](https://img.shields.io/badge/status-in%20development-yellow) ![License](https://img.shields.io/badge/license-MIT-blue) ![Phase](https://img.shields.io/badge/phase-2%20backend-blue)

## What is Memora?

Memora is an AI chat application that transforms how you interact with AI through three revolutionary features:

1. **Context Library** 📚 - Upload files, URLs, GitHub repos once → use everywhere
2. **Rules Engine** 📝 - Define AI behavior with custom rules and preferences
3. **Prompt Enhancement** ✨ - Auto-improve your messages for better AI responses

**Stop fighting with prompts.** Memora automatically enhances your questions, manages your context, and applies your rules - so you get better AI responses every time.

### The Problem We Solve

Traditional AI chats require you to:
- ❌ Copy-paste context for every conversation
- ❌ Manually structure every prompt
- ❌ Repeat the same instructions over and over
- ❌ Guess at token counts and costs

### Our Solution

With Memora, you:
- ✅ Upload context once, use in all chats
- ✅ Let AI enhance your prompts automatically
- ✅ Set rules that persist across conversations
- ✅ See real-time token usage and costs
- ✅ Organize everything with tags and search

## ✨ Key Features

### 🤖 Multi-Provider AI Chat
- Support for Claude (Anthropic), Gemini (Google), and OpenAI
- Real-time streaming responses
- Easy model switching
- Message history and threading

### 📚 Context Library (NEW)
- **Upload Files**: PDFs, Markdown, code files, documents - auto text extraction
- **Add URLs**: Automatic content fetching and parsing
- **GitHub Integration**: Clone repos, select specific files/folders
- **Manual Documents**: Write context directly with markdown support
- **Scope System**:
  - 🟢 **GLOBAL**: Available in all your chats
  - 🔵 **LOCAL**: Only in specific chat
  - 🟠 **ORGANIZATION**: Team-shared (coming soon)
- **Smart Selection**: Drag & drop to reorder, checkbox to select per message
- **Token Counting**: See exactly how much context you're using
- **Tag Organization**: Filter and search by tags

### 📝 Rules Engine (NEW)
- **Define AI Behavior**: Set coding standards, preferences, tone
- **Global Rules**: Applied to all your chats automatically
- **Local Rules**: Chat-specific rules for particular projects
- **Markdown Support**: Write rules with formatting and examples
- **Active/Inactive Toggle**: Quickly enable/disable rules
- **Priority Ordering**: Drag to reorder by importance
- **Example Rules**:
  - "Always use TypeScript strict mode"
  - "Be concise in responses"
  - "Follow Airbnb style guide"
  - "Use friendly, conversational tone"

### ✨ Prompt Enhancement (NEW)
- **Auto-Improve Messages**: Click "Enhance" to make prompts better
- **Adds Clarity**: Vague questions → specific, clear questions
- **Adds Structure**: Unstructured text → organized, numbered lists
- **Context-Aware**: References available context automatically
- **Compare & Edit**: See original vs enhanced, edit before sending
- **Auto-Enhance**: Optional setting to enhance all messages
- **Cost Effective**: Uses lightweight models (gpt-4o-mini)

### 👥 Organizations & Teams (Coming Soon)
- Create or join organizations
- Invite team members via email
- Share global context across your org
- Role-based permissions (Owner, Admin, Member)

### 🔄 Collaboration (Coming Soon)
- **Share Chats**: Generate public links for read-only access
- **Fork Conversations**: Branch off from any message
- **Version Control**: Track context changes over time
- **Real-time Updates**: See when team members add global context

### 📊 Analytics & Cost Control
- **Real-time Token Calculator**: See exact token count before sending
- **Cost Estimates**: Know the cost of each message
- **Usage Breakdown**: Context, rules, and message tokens separately
- **Token Tracking**: Per message, per chat, per user
- **Provider Comparison**: See costs across Claude, Gemini, OpenAI

## 🎨 Design

Clean, modern interface inspired by Linear and Vercel:
- Dual theme support (light and dark)
- Three-column layout for efficient workflow
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Accessible and keyboard-friendly

## 🛠️ Tech Stack

**Frontend**:
- Next.js 15.5+ with App Router (typed routes)
- React 19 with TypeScript 5.8
- Shadcn UI (New York) + Tailwind CSS v4
- Zustand for state management
- TanStack Query v5 for server state

**Backend**:
- Hono v4 (lightweight API framework)
- tRPC v11 for type-safe APIs
- Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- Better Auth v1.3+ for authentication
- Vercel AI SDK v5 for streaming

**Infrastructure**:
- Bun v1.3+ (runtime and package manager)
- S3-compatible storage for files
- Email service (Resend) for invites
- Vercel for deployment
- Sentry for error tracking

⚠️ **See `TECH_STACK_UPDATES.md`** for important differences from typical setups (Tailwind v4, OKLCH colors, React 19 patterns)

## 📖 Documentation

### Essential Docs
- **[MEMORA_SPEC.md](./MEMORA_SPEC.md)** - Complete technical specification (v2.1)
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Current status and next steps
- **[AI_ASSISTANT_GUIDE.md](./AI_ASSISTANT_GUIDE.md)** - Quick reference for AI assistants
- **[AGENTS.md](./AGENTS.md)** - Coding guidelines for AI agents

### For AI Coding Assistants
- **[CLAUDE_CODE_PROMPTS.md](./CLAUDE_CODE_PROMPTS.md)** - Step-by-step implementation prompts
- **[GOOGLE_STITCH_PROMPTS.md](./GOOGLE_STITCH_PROMPTS.md)** - UI generation prompts
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Original 8-week roadmap

### Tech Reference
- **[TECH_STACK_UPDATES.md](./TECH_STACK_UPDATES.md)** - Important tech stack differences

### Archived
- See `docs/archive/` for obsolete documentation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- API keys for Claude, Gemini, and/or OpenAI
- S3-compatible storage

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/memora.git
cd memora

# Install dependencies
bun install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
# Edit .env with your API keys and database URL

# Set up the database
cd apps/server
bun run db:generate
bun run db:push

# Start development servers
cd ../..
bun run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Studio: `bun run db:studio`

### Development

```bash
# Start all apps in development mode
bun run dev

# Start specific apps
bun run dev:web      # Frontend only
bun run dev:server   # Backend only

# Database operations
bun run db:push      # Push schema changes
bun run db:studio    # Open Prisma Studio
bun run db:generate  # Generate Prisma client

# Code quality
bun run check        # Lint and format
bun run typecheck    # TypeScript check
bun test             # Run tests
```

## 🗺️ Roadmap

### Phase 1: Core Foundation ✅ COMPLETE
- [x] Database schema (auth, chat, context, rules)
- [x] Authentication flow (Better Auth)
- [x] Backend routers (context, rules, chat)
- [x] Prisma migrations

### Phase 2: Backend APIs 🚧 IN PROGRESS
- [x] Context router with full CRUD
- [x] Rules router with full CRUD
- [x] Prompt enhancement infrastructure
- [ ] Connect routers to main app
- [ ] Chat service with context/rules injection
- [ ] File upload to S3
- [ ] Text extraction utilities
- [ ] Token counting utility

### Phase 3: Frontend UI 📋 NEXT
- [ ] `/context` page - Context Library management
- [ ] `/rules` page - Rules management
- [ ] Enhanced right sidebar (3-section layout)
- [ ] Prompt enhancement UI
- [ ] Token calculator widget
- [ ] Drag & drop for ordering

### Phase 4: Integration & Testing
- [ ] End-to-end message flow
- [ ] Context + Rules + Enhancement working together
- [ ] Token tracking and cost estimation
- [ ] Loading states and error handling
- [ ] Responsive design
- [ ] E2E testing

### Phase 5: Polish & Launch
- [ ] Performance optimization
- [ ] Documentation
- [ ] Production deployment
- [ ] Beta user onboarding

### Post-MVP Features 💡
- Collaborative real-time chats
- AI-powered context suggestions
- Prompt templates
- Integrations (Slack, Google Drive, Notion)
- Advanced search
- Voice input
- Mobile apps

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Conare](https://conare.ai/) for the context management concept
- Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Design inspiration from [Linear](https://linear.app/) and [Vercel](https://vercel.com/)

## 📬 Contact

Have questions or feedback? Open an issue or reach out!

---

**Built with ❤️ using Better-T-Stack**

[Website](#) | [Documentation](./MEMORA_SPEC.md) | [Report Bug](https://github.com/yourusername/memora/issues) | [Request Feature](https://github.com/yourusername/memora/issues)
