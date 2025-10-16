# Google Stitch UI Generation Prompts for Memora

> Use these prompts with [Google Stitch](https://stitch.withgoogle.com/) to generate UI mockups for Memora.

## 🎨 Design Guidelines for All Prompts

Before using any prompt below, include these global guidelines:

```
Design Style Guidelines:
- Modern, minimal, clean aesthetic inspired by Linear and Vercel
- Use Inter font family throughout
- Dual theme support (light and dark mode)
- Generous whitespace and clear visual hierarchy
- Subtle shadows and borders
- Smooth transitions and micro-interactions
- Glass morphism effects for modals and popovers
- 8px grid system for consistent spacing

Color Palette (Light Mode):
- Background: #FFFFFF
- Foreground: #0A0A0A
- Primary: #2563EB (Blue)
- Secondary: #F1F5F9 (Light gray)
- Muted: #64748B (Gray text)
- Border: #E2E8F0 (Light gray border)
- Accent colors: #FF8C42 (orange), #2C9F8B (teal), #8B5CF6 (purple)

Color Palette (Dark Mode):
- Background: #020817 (Very dark blue)
- Foreground: #F8FAFC (Off-white)
- Primary: #3B82F6 (Lighter blue)
- Secondary: #1E293B (Dark slate)
- Muted: #94A3B8 (Light gray text)
- Border: #1E293B (Dark border)
- Accent colors: Same as light mode

UI Components:
- Buttons: Rounded corners (8px), medium padding, hover states
- Inputs: Subtle borders, focus rings (blue), rounded corners
- Cards: Subtle shadows, rounded corners (12px), hover lift effect
- Icons: Lucide icon style, 20px size, consistent stroke width
- Avatars: Circular, 32px default size
- Tags/Badges: Pill shaped, colored backgrounds with opacity
```

---

## 1. Main Dashboard Layout

```
Create a modern AI chat application dashboard with a three-column layout:

LEFT SIDEBAR (240px, fixed):
- App logo "Memora" at top with organization dropdown
- Navigation menu with icons: Home, History, Settings
- Section titled "Recent Chats" with list of 5-6 chat items
- Each chat item shows: chat icon, truncated title, timestamp
- "New Chat" button at bottom (primary blue, full width)
- Active chat highlighted with blue accent
- Dark background (#020817 for dark mode, #FAFAFA for light mode)

CENTER PANEL (flexible width):
- Header bar with:
  - Current chat title (editable)
  - AI model selector dropdown (shows "Claude 3.5 Sonnet")
  - Share button
  - More options menu (three dots)
- Main chat area with scrollable message history:
  - User messages aligned right, blue background
  - AI messages aligned left, gray background
  - Each message shows: avatar, content, timestamp, token count
  - Hover shows "Fork from here" button
- Bottom fixed input area:
  - Large text input with placeholder "Message..."
  - Context items chips shown above input (removable)
  - Send button (blue, icon only)
  - Cost estimate shown: "~$0.02" in small text

RIGHT SIDEBAR (320px, collapsible):
- Toggle button at top to show/hide
- Tabs: "Vibe-Tools", "Context", "Usage"
- Context tab selected shows:
  - Section "Local" (5 items)
  - Section "Global" (3 items)
  - Each context item card shows:
    - Icon based on type (file, url, github, etc.)
    - Name
    - Tags (colored pills)
    - Token count
    - Checkbox to select
    - Actions menu (edit, delete, fork)
  - "Add Context" button at bottom

Overall: Clean, spacious, modern aesthetic. Dark mode by default.
```

## 2. Chat Message Components

### User Message
```
Design a user chat message component for an AI chat app:
- Aligned to the right side
- Background: subtle blue gradient (#2563EB to #1E40AF)
- Text color: white
- Max width: 70% of container
- Rounded corners: 12px
- Padding: 16px
- Message content in markdown format
- Bottom right shows: small clock icon + "2 min ago" in light text
- Hover state: slightly elevated with shadow
- Small "fork" icon button appears on hover (top right corner)
```

### AI Message
```
Design an AI assistant message component:
- Aligned to the left side
- Background: #F1F5F9 (light mode) or #1E293B (dark mode)
- Text color: default foreground
- Max width: 70% of container
- Rounded corners: 12px
- Padding: 16px
- AI avatar (32px circle) to the left
- Message content in markdown with code syntax highlighting
- Bottom shows metadata:
  - Small token icon + "1.2k tokens"
  - Small dollar icon + "$0.02"
  - Clock icon + "850ms"
- Bottom right shows: "2 min ago"
- Hover state: "Fork from here" button appears at top right
- Slight elevation on hover
```

## 3. Context Panel

```
Design a context management sidebar panel (320px wide):

HEADER:
- Title "Context Library"
- Search input (small, icon left)
- "Add Context" button (primary, icon + text)

TABS (horizontal):
- Vibe-Tools
- Context (active)
- Usage

CONTEXT TAB CONTENT:
Two collapsible sections:

SECTION: "Local" (expanded):
- Header with title, count badge "(5)", and collapse arrow
- List of context items:
  1. File item:
     - Orange file icon
     - Name: "architecture.md"
     - Tags: [@landa-ml] (orange pill), [unload] (red text button)
     - Token count: "2.1k tokens" (small, muted)
     - Checkbox (selected)
     - Three-dot menu
  
  2. URL item:
     - Teal globe icon
     - Name: "Next.js Docs"
     - Tags: [@docs] (teal pill)
     - Token count: "5.3k tokens"
     - Checkbox (unselected)
     - Three-dot menu
  
  3. GitHub repo item:
     - Purple github icon
     - Name: "shadcn/ui"
     - Tags: [@ui] (purple pill), [@components] (blue pill)
     - Token count: "12k tokens"
     - Checkbox (selected)
     - Three-dot menu

SECTION: "Global" (collapsed):
- Header with title, count badge "(3)", and expand arrow
- Description: "Shared across organization"

FOOTER:
- "Add Context" button (secondary, full width)
- Dropdown on click: "Upload File", "Add URL", "GitHub Repo", "Vibe-Rule"

Design: Clean, scannable, good information hierarchy. Dark mode.
```

## 4. Context Item Card (Detailed)

```
Design a context item card component for a context library:

Card layout (full width, 80px height):
- Subtle border (#E2E8F0 light, #1E293B dark)
- Rounded corners (8px)
- Padding: 12px
- Hover: subtle blue border glow, slight elevation

Left side:
- Icon (24px) based on type:
  - Document: Orange file icon
  - URL: Teal globe icon
  - GitHub: Purple github icon
  - Vibe-Rule: Blue sparkle icon
- Checkbox (16px) next to icon

Center (flexible width):
- Top row: Name (medium font, semibold)
- Bottom row: Tags as pills:
  - Small rounded pills (16px height)
  - Colored backgrounds (orange, purple, teal, etc.)
  - White/light text
  - Small X to remove tag
  - "+ Add tag" button (ghost)

Right side:
- Token count with icon: "2.1k tokens" (muted text, small)
- Three-dot menu button (ghost, only visible on hover)
- Dropdown menu: Edit, Fork, Delete

Selected state:
- Blue accent border on left edge (3px)
- Slightly elevated background
- Checkbox checked (blue)

Design: Compact but readable, clear visual hierarchy, smooth hover states.
```

## 5. Model Selector Dropdown

```
Design an AI model selector dropdown component:

TRIGGER BUTTON:
- Width: 200px
- Height: 40px
- Rounded corners (8px)
- Border: subtle (#E2E8F0)
- Padding: 8px 12px
- Left: AI provider icon (Claude/Gemini/OpenAI, 20px)
- Center: Model name "Claude 3.5 Sonnet" (medium font)
- Right: Chevron down icon
- Hover: subtle blue border

DROPDOWN MENU (280px wide):
- Glass morphism effect (blurred background)
- Rounded corners (12px)
- Shadow: large, soft
- Padding: 8px

Three sections separated by dividers:

SECTION 1: "Claude" (with logo)
- "Claude 3.5 Sonnet" (selected, blue accent)
  - Small text: "$3/1M tokens"
- "Claude 3 Opus"
  - Small text: "$15/1M tokens"
- "Claude 3 Haiku"
  - Small text: "$0.25/1M tokens"

SECTION 2: "Gemini" (with logo)
- "Gemini 1.5 Pro"
  - Small text: "$7/1M tokens"
- "Gemini 1.5 Flash"
  - Small text: "$0.35/1M tokens"

SECTION 3: "OpenAI" (with logo)
- "GPT-4 Turbo"
  - Small text: "$10/1M tokens"
- "GPT-4"
  - Small text: "$30/1M tokens"
- "GPT-3.5 Turbo"
  - Small text: "$0.50/1M tokens"

Each item:
- Hover: light background
- Selected: blue accent border (left), blue text
- Provider logo on left, model name center, price right (muted)

Design: Modern, clear pricing, easy to scan.
```

## 6. Chat Input Area

```
Design a chat input component for the bottom of a chat interface:

CONTAINER (full width, auto height):
- Background: slightly elevated from main background
- Top border: subtle (#E2E8F0 light, #1E293B dark)
- Padding: 16px

SELECTED CONTEXT CHIPS (if any):
- Row of small chips above input:
  - Each chip: name + token count + X button
  - Blue/purple/teal backgrounds (matching context type)
  - Pill shaped (20px height)
  - Example: "architecture.md · 2.1k" [X]
- "+ Add context" button (ghost, small)

TEXT INPUT:
- Large multi-line textarea
- Placeholder: "Message... (/ for commands)"
- Min height: 60px, max height: 200px (auto-grow)
- Rounded corners (12px)
- Subtle border, focus ring (blue glow)
- Padding: 12px

BOTTOM ROW (flex, space between):
- Left side:
  - Attach button (icon only, ghost)
  - Context button (icon only, ghost)
  - Format buttons: B, I, Code (ghost, small)
- Right side:
  - Cost estimate: "Est. $0.02" (small, muted, with dollar icon)
  - Send button (primary blue, 40px height, rounded, paper plane icon)

STATES:
- Empty: Send button disabled (gray)
- Typing: Send button enabled (blue)
- Sending: Loading spinner in send button
- Context selected: Blue border highlight

Design: Clean, spacious, clear affordances, smooth animations.
```

## 7. Share Chat Modal

```
Design a modal for sharing a chat conversation:

MODAL:
- Width: 500px
- Centered on screen
- Background: white (light) or #020817 (dark)
- Rounded corners (16px)
- Large shadow
- Padding: 24px

HEADER:
- Title: "Share Chat" (large, semibold)
- Close button (top right, X icon)

CONTENT:
Preview card (full width):
- Chat title: "Building a landing page"
- Message count: "42 messages"
- Created: "2 days ago"
- Small thumbnail showing first few messages (blurred)
- Rounded corners, subtle border

Options (form):
1. Share Link (section):
   - Label: "Anyone with the link can view"
   - Input field with generated link (read-only)
   - Copy button (right side, icon + "Copy")
   - Copied state: Green checkmark + "Copied!"

2. Expiration (section):
   - Label: "Link expires"
   - Dropdown: "Never", "1 day", "7 days", "30 days"
   - Default: "Never"

3. Permissions (section):
   - Label: "Viewers can"
   - Checkbox: "Fork this conversation" (checked)
   - Helper text: "Allow others to create a copy and continue"

FOOTER (buttons right-aligned):
- "Cancel" (secondary, ghost)
- "Create Link" (primary, blue)

Design: Clean, trustworthy, clear privacy controls.
```

## 8. Organization Switcher

```
Design an organization switcher dropdown for top of sidebar:

TRIGGER (full width of sidebar):
- Height: 56px
- Padding: 12px
- Background: slightly elevated from sidebar
- Rounded corners (8px)
- Hover: subtle highlight

Content:
- Left: Organization avatar (32px circle, with letter or logo)
- Center: 
  - Top: Org name "Acme Inc" (medium font, semibold)
  - Bottom: Current plan "Pro Plan" (small, muted)
- Right: Chevron down icon

DROPDOWN (240px wide):
- Glass morphism effect
- Rounded corners (12px)
- Padding: 8px

SECTION 1: "Personal"
- User avatar + "Personal" + checkmark (if selected)

SECTION 2: "Organizations"
- List of orgs (3 items):
  1. Org avatar + "Acme Inc" + checkmark (selected)
  2. Org avatar + "Startup XYZ"
  3. Org avatar + "Side Project"

DIVIDER

SECTION 3: Actions
- "+ Create Organization" (with plus icon)
- "Organization Settings" (with gear icon)

Each item:
- Hover: light background
- Selected: blue accent + checkmark
- Icon left, text center, checkmark right

Design: Clean, fast switching, clear visual feedback.
```

## 9. Upload Context Modal

```
Design a modal for uploading context (files, URLs, etc.):

MODAL:
- Width: 600px
- Centered
- Background: white (light) or #020817 (dark)
- Rounded corners (16px)
- Padding: 24px

HEADER:
- Title: "Add Context" (large, semibold)
- Close button (top right)

TABS (horizontal):
- "Upload File" (active)
- "URL"
- "GitHub Repo"
- "Vibe-Rule"

UPLOAD FILE TAB:
- Drag & drop area (full width, 200px height):
  - Dashed border (blue when dragging)
  - Center: Cloud upload icon (large)
  - Text: "Drag files here or click to browse"
  - Subtext: "PDF, Markdown, Text, Code files up to 10MB"
  - Button: "Choose Files" (secondary)

- File list (if files selected):
  - Each file: icon + name + size + remove button
  - Progress bar during upload

FORM FIELDS (below):
1. Name:
   - Label: "Name"
   - Input: Auto-filled from filename
   - Helper: "Give this context a memorable name"

2. Description (optional):
   - Label: "Description"
   - Textarea: 3 rows
   - Helper: "Help others understand what this context is for"

3. Tags:
   - Label: "Tags"
   - Tag input with autocomplete
   - Show existing tags as suggestions
   - Helper: "Add tags to organize your context"

4. Scope:
   - Label: "Visibility"
   - Radio buttons:
     - "Local" (selected): "Only visible to you"
     - "Global": "Shared with your organization"

5. Info panel:
   - Estimated tokens: "~2,400 tokens"
   - File size: "24 KB"
   - Processing time: "~2 seconds"

FOOTER:
- "Cancel" (secondary)
- "Add Context" (primary, blue, disabled until file selected)

Design: Clear upload states, helpful guidance, smooth interactions.
```

## 10. Token Usage Dashboard

```
Design a token usage analytics page:

LAYOUT:
- Full width page
- Header: "Token Usage" (large)
- Date range selector (top right): "Last 30 days"

TOP CARDS (row of 4):
1. Total Tokens:
   - Large number: "2.4M"
   - Subtitle: "tokens used"
   - Trend: "+12% from last month" (green)

2. Total Cost:
   - Large number: "$48.32"
   - Subtitle: "total cost"
   - Trend: "+8% from last month" (green)

3. Average per Chat:
   - Large number: "32k"
   - Subtitle: "tokens per chat"
   - Trend: "-5% from last month" (green)

4. This Month's Limit:
   - Progress bar: 68% full
   - Text: "6.8M / 10M tokens"
   - Subtitle: "32% remaining"

CHART SECTION:
- Title: "Usage Over Time"
- Line chart (full width, 300px height):
  - X-axis: Dates (last 30 days)
  - Y-axis: Tokens (thousands)
  - Multiple lines:
    - Claude (blue)
    - Gemini (purple)
    - OpenAI (green)
  - Legend top right
  - Smooth curves
  - Hover tooltips showing exact values

BREAKDOWN SECTION (two columns):

LEFT: "By Provider"
- Pie chart (200px):
  - Claude: 60% (blue)
  - Gemini: 30% (purple)
  - OpenAI: 10% (green)
- List below with provider, tokens, cost, percentage

RIGHT: "By User" (if org admin)
- Horizontal bar chart:
  - Each bar: user avatar + name + bar + token count
  - Sorted by usage (descending)
  - Top 10 users
  - Colors: gradient blue

TABLE: "Recent Activity"
- Columns: Date, User, Chat, Provider, Model, Tokens, Cost
- Sortable columns
- Pagination (10 per page)
- Row hover: slight highlight
- Clickable rows → go to chat

Design: Clear data visualization, professional charts, easy to scan.
```

---

## Usage Instructions

1. Copy the relevant prompt(s) above
2. Paste into [Google Stitch](https://stitch.withgoogle.com/)
3. Generate multiple variations
4. Select the best design
5. Export as PNG or Figma for development reference

## Tips for Best Results

- **Be specific**: Add more details if the output isn't quite right
- **Iterate**: Generate multiple versions and mix the best parts
- **Context matters**: Include the global design guidelines with each prompt
- **Reference images**: Upload the Conare screenshots as reference style
- **Combine prompts**: Mix prompts for complex layouts

---

**Next**: Use these designs with the Claude Code prompts in `CLAUDE_CODE_PROMPTS.md` to implement the UI.
