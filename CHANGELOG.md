# Changelog

All notable changes to the Memora project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - v2.1 (2025-01-20)

#### Context Library System
- Complete database schema for context items
- ContextItem model with type support (FILE, URL, GITHUB_REPO, DOCUMENT)
- Scope system (GLOBAL, LOCAL, ORGANIZATION)
- ContextTag model for organization
- ChatContext relationship table for many-to-many chat ↔ context
- Full CRUD tRPC router for context management
- Tag-based filtering and search
- Token counting per context item
- Selection/deselection per chat

#### Rules Engine
- Complete database schema for rules
- Rule model with markdown content support
- RuleScope (GLOBAL, LOCAL, ORGANIZATION)
- RuleTag model for organization
- ChatRule relationship table for many-to-many chat ↔ rules
- Full CRUD tRPC router for rules management
- Active/inactive toggle functionality
- Priority ordering support
- Tag-based filtering and search

#### Prompt Enhancement
- Enhanced chat router with `enhancePrompt` endpoint
- Context-aware prompt improvement
- Integration with lightweight AI models (gpt-4o-mini)
- Original vs enhanced comparison support
- Metadata tracking for enhanced messages

#### Database Updates
- Updated User model with context/rules relations
- Updated Chat model with contextLinks and ruleLinks
- Updated Message model with contextUsed and rulesUsed tracking
- Many-to-many relationship tracking for usage analytics

#### Documentation
- Created IMPLEMENTATION_STATUS.md with current progress
- Updated README.md with v2.1 features
- Updated AI_ASSISTANT_GUIDE.md for AI assistants
- Created CHANGELOG.md (this file)
- Moved obsolete docs to docs/archive/
- Reorganized documentation structure

### Changed

#### Project Structure
- Moved 11 obsolete documentation files to `docs/archive/`
- Reorganized README with Essential/Reference sections
- Updated roadmap to phase-based structure

#### Features
- Enhanced chat system to support context and rules injection
- Improved documentation organization
- Updated feature descriptions with scope indicators

### Removed from Root
- CI_CD_SETUP.md → docs/archive/
- CI_CD_STATUS.md → docs/archive/
- CI_FIXES_COMPLETE.md → docs/archive/
- FIXING_LINT_ERRORS.md → docs/archive/
- Lint-errors.md → docs/archive/
- GITHUB_SETUP_COMPLETE.md → docs/archive/
- DEBUG_SIGNUP.md → docs/archive/
- TASKS.md → docs/archive/
- WARP.md → docs/archive/
- GEMINI.md → docs/archive/
- MEMORA_SPEC_backup.md → docs/archive/

---

## [2.0.0] - 2025-01-19

### Added
- Chat and Message models
- Better Auth integration
- Basic chat interface
- Message streaming with Vercel AI SDK
- Multi-provider support (Claude, Gemini, OpenAI)

### Removed
- Todo model from schema

---

## [1.0.0] - Initial Setup

### Added
- Project scaffolding with Better-T-Stack
- Database setup with Prisma
- Authentication system with Better Auth
- Basic Next.js app structure
- Turborepo monorepo setup
- TypeScript configuration
- Biome for linting

---

## Documentation Status

### Active Documentation
- **README.md** - Project overview and getting started
- **MEMORA_SPEC.md** - Complete technical specification (v2.1)
- **IMPLEMENTATION_STATUS.md** - Current status and next steps
- **AI_ASSISTANT_GUIDE.md** - Quick reference for AI assistants
- **AGENTS.md** - Coding guidelines for AI agents
- **CLAUDE_CODE_PROMPTS.md** - Step-by-step implementation prompts
- **GOOGLE_STITCH_PROMPTS.md** - UI generation prompts
- **IMPLEMENTATION_PLAN.md** - Original 8-week roadmap
- **TECH_STACK_UPDATES.md** - Tech stack differences
- **CHANGELOG.md** - This file

### Archived Documentation
- See `docs/archive/` for historical and obsolete documentation

---

## Current Status: Phase 2 - Backend Development

### Completed ✅
- Database schema (auth, chat, context, rules)
- Backend routers (context, rules)
- Prisma migrations
- Documentation restructuring

### In Progress 🚧
- Connecting routers to main app
- Chat service with context/rules injection
- File upload utilities
- Text extraction utilities
- Token counting

### Next Up 📋
- `/context` page UI
- `/rules` page UI
- Enhanced right sidebar
- Prompt enhancement UI
- Drag & drop functionality

---

**Last Updated**: January 20, 2025
**Version**: 2.1.0-dev
**Phase**: 2 of 5
