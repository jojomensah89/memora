# Memora - Implementation Plan & Quick Start Guide

> Your roadmap to building Memora from spec to production .

## 📋 What You Have

You now have a complete specification kit for building Memora:

1. **MEMORA_SPEC.md** - Complete architecture, database schema, features, and flows
2. **GOOGLE_STITCH_PROMPTS.md** - UI generation prompts for visual designs
3. **CLAUDE_CODE_PROMPTS.md** - Step-by-step implementation prompts for AI assistant
4. **This file** - Your implementation roadmap

## 🎯 Project Overview

**Memora** is an AI chat application with intelligent context management that:
- Supports multiple AI providers (Claude, Gemini, OpenAI)
- Allows users to upload and organize context (files, URLs, GitHub repos, vibe-rules)
- Enables context sharing across organizations
- Tracks token usage and costs
- Supports chat sharing and forking

**Target Timeline**: 8 weeks to MVP  
**Tech Stack**: Next.js, Hono, Prisma, PostgreSQL, Shadcn UI, Zustand, TanStack Query, Vercel AI SDK

---

## 🚀 Quick Start

### Prerequisites

⚠️ **READ FIRST**: Check `TECH_STACK_UPDATES.md` for critical updates about your actual tech stack!

1. **System Requirements**:
   - Bun 1.3+ (already installed)
   - SQLite (dev) or PostgreSQL (production) database
   - Code editor (VS Code recommended)

2. **API Keys** (get these ready):
   - Claude API key from Anthropic
   - Gemini API key from Google AI Studio
   - OpenAI API key
   - S3-compatible storage (AWS S3, Cloudflare R2, or similar)

3. **Tools**:
   - GitHub account (for version control)
   - Vercel account (for deployment)
   - AI coding assistant (Claude Code, Cursor, or similar)

### Initial Setup

```bash
# 1. Your project is already initialized with Better-T-Stack
cd memora

# 2. Install dependencies
bun install

# 3. Set up environment variables (see CLAUDE_CODE_PROMPTS.md Prompt 1.2)
cp apps/server/.env.example apps/server/.env
# Edit .env with your actual values

# 4. Set up database (PostgreSQL)
# Create a new database called 'memora'
# Update DATABASE_URL in .env

# 5. Generate Prisma schema (after updating schema.prisma)
cd apps/server
bun run db:generate
bun run db:push

# 6. Start development servers
cd ../..
bun run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 📅 8-Week Implementation Timeline

### Week 1: Foundation & Core Chat

**Goals**: Database setup, basic chat UI, AI integration

**Tasks**:
1. Set up Prisma schema (CLAUDE_CODE_PROMPTS.md: Prompt 1.1)
2. Configure environment variables (Prompt 1.2)
3. Set up Shadcn UI and theme (Prompt 1.3)
4. Create chat store (Prompt 2.1)
5. Build chat layout (Prompt 2.2)
6. Build chat message components (Prompt 2.3)
7. Build chat input (Prompt 2.4)
8. Build model selector (Prompt 2.5)

**Deliverable**: Basic chat interface that displays messages and has input

**Test**: Can create a chat, see the UI, switch themes

---

### Week 2: AI Provider Integration

**Goals**: Connect to AI APIs, streaming responses, message history

**Tasks**:
1. Create AI provider abstraction (Prompt 3.1)
2. Build chat API router (Prompt 3.2)
3. Implement streaming (Prompt 3.3)
4. Test all 3 providers (Claude, Gemini, OpenAI)
5. Save messages to database
6. Load chat history from database
7. Display token counts and costs

**Deliverable**: Fully functional chat with streaming responses from multiple AI providers

**Test**: Send messages, get responses, see costs, reload page and see history

---

### Week 3: Context Management - Upload & Processing

**Goals**: File upload, URL fetching, context storage

**Tasks**:
1. Create context store (Prompt 4.1)
2. Implement file upload & processing (Prompt 4.2)
   - S3 integration
   - PDF/text/code extraction
   - Token counting
3. Implement URL fetcher (Prompt 4.3)
4. Test uploading various file types
5. Save context items to database

**Deliverable**: Users can upload files and add URLs as context

**Test**: Upload PDF, markdown, code file; add URL; see processed content and token counts

---

### Week 4: Context Management - UI & Selection

**Goals**: Context panel, GitHub integration, context injection

**Tasks**:
1. Build context panel UI (Prompt 4.4)
2. Build context item cards
3. Implement GitHub repo integration (Prompt 4.3)
4. Implement context selection (Prompt 4.5)
5. Inject selected context into chat
6. Create vibe-rules editor
7. Add tags to context items

**Deliverable**: Full context management system with selection and injection

**Test**: Select context items, send message, verify context is included in AI prompt

---

### Week 5: Organizations & Teams

**Goals**: Org management, invites, global context

**Tasks**:
1. Build org CRUD operations (Prompt 5.1)
2. Build invite system (Prompt 5.2)
   - Send email invites
   - Accept invite flow
3. Build org switcher (Prompt 5.3)
4. Implement global context visibility (Prompt 5.4)
5. Test multi-user scenarios
6. Test context sharing within org

**Deliverable**: Multi-user organizations with context sharing

**Test**: Create org, invite member, share global context, verify member sees it

---

### Week 6: Sharing, Forking & Analytics

**Goals**: Chat sharing, forking, token tracking dashboard

**Tasks**:
1. Implement chat sharing (Prompt 6.1)
2. Implement chat forking (Prompt 6.2)
3. Implement token usage tracking (Prompt 7.1)
4. Build token usage dashboard (Prompt 7.2)
5. Implement usage limits & alerts (Prompt 7.3)
6. Test sharing and forking flows

**Deliverable**: Full collaboration features and analytics

**Test**: Share chat, view as non-owner, fork chat, check usage dashboard

---

### Week 7: Polish & Optimization

**Goals**: Loading states, error handling, performance, responsive design

**Tasks**:
1. Add loading skeletons (Prompt 8.1)
2. Implement error handling (Prompt 8.2)
3. Optimize performance (Prompt 8.3)
   - Code splitting
   - Caching
   - Virtualization
4. Make responsive (Prompt 8.4)
5. Polish dark/light theme (Prompt 8.5)
6. Fix bugs and rough edges

**Deliverable**: Production-ready, polished application

**Test**: Test on mobile, tablet, desktop; both themes; slow network; error scenarios

---

### Week 8: Testing, Documentation & Deployment

**Goals**: Tests, deploy to production

**Tasks**:
1. Write unit tests (Prompt 9.1)
2. Write E2E tests (Prompt 9.2)
3. Prepare production build (Prompt 9.3)
4. Deploy to Vercel (Prompt 9.4)
5. Set up monitoring (Sentry)
6. Set up analytics (Vercel Analytics)
7. Write user documentation
8. Create demo video

**Deliverable**: Live production application

**Test**: Full QA on production; invite beta users; collect feedback

---

## 🎨 Design Workflow

### Step 1: Generate UI Mockups

Before coding each feature, generate UI mockups:

1. Open [Google Stitch](https://stitch.withgoogle.com/)
2. Copy relevant prompt from `GOOGLE_STITCH_PROMPTS.md`
3. Generate multiple variations
4. Select best design
5. Export as PNG or Figma

**Recommended order**:
1. Main Dashboard Layout
2. Chat Message Components
3. Context Panel
4. Model Selector
5. Chat Input Area
6. All others as needed

### Step 2: Reference During Implementation

- Keep mockups open while coding
- Match colors, spacing, borders to design
- Use Shadcn components for consistency
- Test in both light and dark themes

---

## 💻 Development Workflow

### Daily Routine

1. **Morning**:
   - Review previous day's work
   - Pick next prompt from CLAUDE_CODE_PROMPTS.md
   - Generate UI mockup if needed
   - Read prompt carefully

2. **Development**:
   - Give full prompt to AI assistant (Claude Code, Cursor, etc.)
   - Review generated code
   - Test thoroughly
   - Fix issues
   - Commit changes

3. **Testing**:
   - Test in browser (both themes)
   - Test on mobile viewport
   - Check database changes
   - Verify no console errors

4. **End of Day**:
   - Commit all changes
   - Push to GitHub
   - Update progress tracker
   - Plan tomorrow's tasks

### Git Workflow

```bash
# Feature branches
git checkout -b feature/chat-streaming
# Make changes
git add .
git commit -m "Add chat streaming with Vercel AI SDK"
git push origin feature/chat-streaming

# Merge to main when complete and tested
git checkout main
git merge feature/chat-streaming
git push origin main
```

### Testing Strategy

**After each prompt**:
- [ ] Visual test: Does it look right?
- [ ] Functional test: Does it work as expected?
- [ ] Edge cases: What if empty? What if error?
- [ ] Data test: Is data saved correctly to DB?
- [ ] Console: No errors or warnings?

**Before moving to next phase**:
- [ ] All features in phase working
- [ ] No known bugs
- [ ] Code committed to Git
- [ ] Tested in both themes

---

## 📊 Progress Tracker

Use this to track your progress:

### Phase 1: Foundation ⬜
- [ ] Database schema created
- [ ] Environment variables configured
- [ ] Shadcn UI set up
- [ ] Chat store created
- [ ] Chat layout built
- [ ] Chat messages rendering
- [ ] Chat input working
- [ ] Model selector working

### Phase 2: AI Integration ⬜
- [ ] AI provider abstraction created
- [ ] Claude integration working
- [ ] Gemini integration working
- [ ] OpenAI integration working
- [ ] Streaming responses working
- [ ] Messages saving to DB
- [ ] Chat history loading
- [ ] Costs calculated and displayed

### Phase 3: Context Upload ⬜
- [ ] Context store created
- [ ] S3 upload working
- [ ] File processing working (PDF, MD, TXT, code)
- [ ] URL fetching working
- [ ] Token counting accurate
- [ ] Context items saving to DB

### Phase 4: Context UI ⬜
- [ ] Context panel built
- [ ] Context items displaying
- [ ] GitHub repo integration working
- [ ] Context selection working
- [ ] Context injection working
- [ ] Vibe-rules editor working
- [ ] Tags working

### Phase 5: Organizations ⬜
- [ ] Org CRUD working
- [ ] Invite system working
- [ ] Email invites sending
- [ ] Invite acceptance working
- [ ] Org switcher working
- [ ] Global context visible to org members
- [ ] Permissions enforced

### Phase 6: Collaboration ⬜
- [ ] Chat sharing working
- [ ] Share links generating
- [ ] Shared chat view working
- [ ] Chat forking working
- [ ] Fork from any message working
- [ ] Token tracking working
- [ ] Usage dashboard built
- [ ] Usage limits enforced

### Phase 7: Polish ⬜
- [ ] Loading skeletons everywhere
- [ ] Error handling comprehensive
- [ ] Toasts working
- [ ] Performance optimized
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Dark theme polished
- [ ] Light theme polished

### Phase 8: Launch ⬜
- [ ] Unit tests written
- [ ] E2E tests written
- [ ] All tests passing
- [ ] Production build working
- [ ] Deployed to Vercel
- [ ] Monitoring set up
- [ ] Analytics set up
- [ ] Beta users invited

---

## 🐛 Common Issues & Solutions

### Issue: Prisma schema not updating

**Solution**:
```bash
cd apps/server
bun run db:generate
bun run db:push
# Restart Next.js dev server
```

### Issue: tRPC not finding procedures

**Solution**:
- Check import paths
- Ensure router is exported and imported in root router
- Restart dev server
- Check for TypeScript errors

### Issue: AI provider rate limits

**Solution**:
- Implement exponential backoff retry
- Cache responses when appropriate
- Add rate limit warnings to users
- Consider using multiple API keys

### Issue: File upload failing

**Solution**:
- Check S3 credentials
- Verify bucket permissions
- Check file size limits
- Check CORS settings on S3 bucket

### Issue: Slow database queries

**Solution**:
- Add indexes (userId, chatId, createdAt)
- Use pagination for large lists
- Consider connection pooling
- Profile queries with `EXPLAIN ANALYZE`

### Issue: Memory leaks in dev

**Solution**:
- Clear Zustand stores properly
- Unsubscribe from TanStack Query
- Clean up event listeners
- Use React DevTools Profiler

---

## 🎯 Success Criteria

Before considering MVP complete:

### Functionality
- [ ] User can sign up and log in
- [ ] User can create chats
- [ ] User can send messages and get AI responses
- [ ] User can switch between AI providers
- [ ] User can upload files as context
- [ ] User can add URLs as context
- [ ] User can add GitHub repos as context
- [ ] User can select context and use in chat
- [ ] User can create organizations
- [ ] User can invite team members
- [ ] User can share context with org (global)
- [ ] User can share chats via link
- [ ] User can fork chats
- [ ] User can view token usage analytics
- [ ] Usage limits are enforced

### Quality
- [ ] No console errors in production
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on mobile (iOS and Android)
- [ ] Fast page loads (< 3s FCP)
- [ ] Smooth interactions (no jank)
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Both themes look good
- [ ] Error messages are helpful
- [ ] Loading states are clear

### Technical
- [ ] Code is typed (TypeScript)
- [ ] Database has proper indexes
- [ ] API has authentication
- [ ] Secrets are not exposed
- [ ] Tests are passing
- [ ] Production build succeeds
- [ ] Deployed and accessible
- [ ] Monitoring is set up

---

## 📚 Reference Documents

Keep these open while building:

1. **MEMORA_SPEC.md** - Architecture and database schema
2. **GOOGLE_STITCH_PROMPTS.md** - UI designs
3. **CLAUDE_CODE_PROMPTS.md** - Implementation steps
4. **Better-T-Stack docs** (CLAUDE.md) - Project structure
5. [Vercel AI SDK docs](https://sdk.vercel.ai/docs)
6. [Shadcn UI](https://ui.shadcn.com/)

---

## 🎓 Learning Resources

If you get stuck or want to learn more:

### Official Docs
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [tRPC](https://trpc.io/docs)
- [Zustand](https://docs.pmnd.rs/zustand)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Video Tutorials
- Next.js App Router crash course
- Prisma & PostgreSQL tutorial
- tRPC full-stack tutorial
- Vercel AI SDK streaming tutorial

### Communities
- Next.js Discord
- Prisma Discord
- tRPC Discord
- r/nextjs on Reddit

---

## 🚢 Post-MVP Features

After launching MVP, consider adding:

1. **Collaborative Chats** - Multiple users in one chat, real-time
2. **Context Suggestions** - AI suggests relevant context
3. **Prompt Templates** - Save and reuse prompts
4. **Advanced Search** - Search across all chats and context
5. **Integrations** - Slack, GitHub, Google Drive
6. **Export/Import** - Backup and migrate data
7. **Voice Input** - Speech-to-text for messages
8. **Mobile Apps** - React Native iOS/Android
9. **API Access** - Let users access via API
10. **Custom Models** - Fine-tune on org data

Prioritize based on user feedback!

---

## 💡 Tips for Success

### Working with AI Assistant

1. **Be specific**: Give full context, reference designs
2. **Review code**: Don't blindly accept, understand what it does
3. **Test thoroughly**: AI code often needs tweaks
4. **Iterate**: If output isn't right, ask for refinements
5. **Break down**: If prompt is too complex, split into smaller tasks

### Staying Motivated

1. **Celebrate wins**: Each completed feature is progress
2. **Visual progress**: See the UI come to life
3. **Share updates**: Tweet progress, share with friends
4. **Take breaks**: Don't burn out, pace yourself
5. **Ship early**: Get feedback from real users ASAP

### Debugging

1. **Use React DevTools**: Inspect component state
2. **Use Prisma Studio**: View/edit database visually
3. **Use Network tab**: Debug API calls
4. **Add console.logs**: When in doubt, log it out
5. **Ask for help**: Discord communities are friendly

---

## 🎉 Ready to Build!

You have everything you need:
- ✅ Complete technical specification
- ✅ Detailed database schema
- ✅ Visual design system
- ✅ UI generation prompts
- ✅ Step-by-step implementation prompts
- ✅ Week-by-week plan
- ✅ Testing and deployment guide

**Next Steps**:
1. Set up your development environment
2. Get your API keys ready
3. Start with Week 1, Prompt 1.1
4. Code, test, commit, repeat
5. Ship in 8 weeks! 🚀

---

**Questions or stuck?** Review this document, check the spec, and don't hesitate to ask your AI assistant for help. You've got this! 💪

**Good luck building Memora!** 🎊
