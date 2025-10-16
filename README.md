# Memora

> An AI chat application with intelligent context management for individuals and teams.

![Memora](https://img.shields.io/badge/status-in%20development-yellow) ![License](https://img.shields.io/badge/license-MIT-blue)

## What is Memora?

Memora is an AI-powered chat application that solves the context problem. Instead of repeatedly copying files, docs, and code snippets into every conversation, users can:

- **Upload once, use everywhere**: Files, URLs, GitHub repos, and custom rules
- **Organize intelligently**: Tag and categorize context for easy discovery
- **Collaborate seamlessly**: Share context across your organization
- **Control costs**: Track token usage and manage spending limits
- **Work flexibly**: Fork conversations at any point, share chats via links

Inspired by [Conare](https://conare.ai/), but designed for web-based chat applications like Claude.ai and Gemini.

## ✨ Key Features

### 🤖 Multi-Provider AI Chat
- Support for Claude (Anthropic), Gemini (Google), and OpenAI
- Real-time streaming responses
- Easy model switching
- Message history and threading

### 📚 Context Management
- **Upload Files**: PDFs, Markdown, code files, documents
- **Add URLs**: Automatic content extraction and cleaning
- **GitHub Integration**: Select specific files/folders from repos
- **Vibe-Rules**: Custom instructions and coding patterns
- **Smart Selection**: Choose which context to include per message
- **Token Counting**: See exactly how much context you're using

### 👥 Organizations & Teams
- Create or join organizations
- Invite team members via email
- **Local Context**: Private to you
- **Global Context**: Shared across your org
- Role-based permissions (Owner, Admin, Member)

### 🔄 Collaboration
- **Share Chats**: Generate public links for read-only access
- **Fork Conversations**: Branch off from any message
- **Version Control**: Track context changes over time
- **Real-time Updates**: See when team members add global context

### 📊 Analytics & Cost Control
- Token usage tracking per user and organization
- Cost breakdown by provider and model
- Visual dashboards with charts
- Set spending limits and get alerts
- Cost estimates before sending messages

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

This project includes comprehensive specifications:

- **[MEMORA_SPEC.md](./MEMORA_SPEC.md)** - Complete technical specification, architecture, and database schema
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - 8-week development roadmap with progress tracker
- **[CLAUDE_CODE_PROMPTS.md](./CLAUDE_CODE_PROMPTS.md)** - Step-by-step implementation prompts for AI coding assistants
- **[GOOGLE_STITCH_PROMPTS.md](./GOOGLE_STITCH_PROMPTS.md)** - UI generation prompts for visual design
- **[AI_ASSISTANT_GUIDE.md](./AI_ASSISTANT_GUIDE.md)** - Quick reference for AI assistants

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

### Phase 1: Foundation (Weeks 1-2) ✅
- [x] Database schema
- [x] Authentication flow
- [x] Basic chat UI
- [x] AI provider integration
- [x] Message streaming

### Phase 2: Context Management (Weeks 3-4) 🚧
- [ ] File upload and processing
- [ ] URL fetching
- [ ] GitHub repo integration
- [ ] Context panel UI
- [ ] Context selection and injection

### Phase 3: Organizations (Week 5) ⬜
- [ ] Org creation and management
- [ ] Team member invites
- [ ] Local vs Global context
- [ ] Permissions and roles

### Phase 4: Collaboration (Week 6) ⬜
- [ ] Chat sharing
- [ ] Conversation forking
- [ ] Token usage tracking
- [ ] Analytics dashboard

### Phase 5: Polish (Week 7) ⬜
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization
- [ ] Responsive design

### Phase 6: Launch (Week 8) ⬜
- [ ] Testing (unit + E2E)
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
