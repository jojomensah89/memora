# Memora API - Usage Examples

## 🚀 Quick Start

### Import tRPC Client
```typescript
import { trpc } from '@/utils/trpc';
```

---

## 📋 Rules API

### Get All Rules
```typescript
const { data, isLoading, error } = trpc.rules.getAll.useQuery();

// Response
{
  rules: [
    {
      id: "rule_123",
      name: "TypeScript Only",
      description: "Always use TypeScript, never JavaScript",
      content: "You must write all code in TypeScript...",
      scope: "GLOBAL",
      isActive: true,
      tags: [{ name: "coding" }],
      createdAt: "2025-01-22T...",
      updatedAt: "2025-01-22T...",
    }
  ],
  stats: {
    total: 5,
    global: 3,
    local: 2,
    active: 4,
    inactive: 1
  }
}
```

### Get Rules for Chat
```typescript
const { data } = trpc.rules.getForChat.useQuery({
  chatId: "chat_abc123"
});

// Returns: GLOBAL rules + LOCAL rules for this chat
```

### Get Single Rule
```typescript
const { data } = trpc.rules.getById.useQuery({
  id: "rule_123"
});
```

### Create Rule
```typescript
const createRule = trpc.rules.create.useMutation();

// Global rule (available everywhere)
await createRule.mutateAsync({
  name: "Clean Code Standards",
  description: "Follow clean code principles",
  content: `
    # Clean Code Rules
    
    - Use descriptive variable names
    - Functions should do one thing
    - Keep functions small (< 20 lines)
    - Write self-documenting code
  `,
  scope: "GLOBAL",
  isActive: true,
  tags: ["coding", "standards"]
});

// Local rule (specific to one chat)
await createRule.mutateAsync({
  name: "Project-Specific Rule",
  content: "For this project, use Tailwind CSS classes...",
  scope: "LOCAL",
  chatId: "chat_abc123", // Required for LOCAL
  isActive: true,
});
```

---

## 🗂️ Context Engine API

### Get All Context Items
```typescript
const { data } = trpc.contextEngine.getAll.useQuery();

// Response
{
  items: [
    {
      id: "ctx_123",
      name: "API Documentation.pdf",
      description: "Company API docs",
      type: "FILE",
      scope: "GLOBAL",
      content: "extracted text...",
      tokens: 5000,
      size: 102400, // bytes
      tags: [{ name: "docs" }],
      metadata: {
        mimeType: "application/pdf",
        uploadedAt: "2025-01-22T..."
      }
    }
  ],
  stats: {
    total: 10,
    global: 6,
    local: 4,
    byType: {
      FILE: 7,
      URL: 2,
      GITHUB_REPO: 1,
      DOCUMENT: 0
    },
    totalTokens: 50000,
    totalSize: 1048576 // bytes
  }
}
```

### Get Context for Chat
```typescript
const { data } = trpc.contextEngine.getForChat.useQuery({
  chatId: "chat_abc123"
});

// Returns: GLOBAL context + LOCAL context for this chat
```

### Get Single Context Item
```typescript
const { data } = trpc.contextEngine.getById.useQuery({
  id: "ctx_123"
});
```

### Upload File (Creates LOCAL Context)
```typescript
const uploadFile = trpc.contextEngine.uploadFile.useMutation();

// In a React component with file input
const handleFileUpload = async (file: File) => {
  // Read file content
  const content = await file.text();
  
  await uploadFile.mutateAsync({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    content: content, // or base64 for binary files
    chatId: currentChatId,
    tags: ["documentation", "reference"]
  });
};

// The uploaded file is automatically LOCAL scope
// It will only be available in the chat where it was uploaded
```

### Promote to Global
```typescript
const promote = trpc.contextEngine.promoteToGlobal.useMutation();

// Make a LOCAL context item available in all chats
await promote.mutateAsync({
  id: "ctx_123"
});

// After promotion, this context item is now GLOBAL
// It will appear in all chats for this user
```

---

## 💬 Chat API (Existing)

### Get All Chats
```typescript
const { data } = trpc.chat.getAllChats.useQuery({
  includeArchived: false,
  limit: 50,
  cursor: undefined, // For pagination
});

// Response
{
  chats: [...],
  nextCursor: "chat_xyz" // Use for next page
}
```

### Get Single Chat
```typescript
const { data } = trpc.chat.getChat.useQuery({
  id: "chat_abc123"
});
```

### Create Chat
```typescript
const createChat = trpc.chat.createChat.useMutation();

await createChat.mutateAsync({
  initialMessage: "Help me build a React app",
  modelId: "claude-3-5-sonnet-20241022",
  useWebSearch: false,
  attachments: []
});
```

---

## 🎯 Typical Workflows

### Workflow 1: Create Rule and Use in Chat

```typescript
// 1. Create a coding standard rule
const rule = await trpc.rules.create.mutateAsync({
  name: "React Best Practices",
  content: `
    # React Rules
    - Use functional components
    - Use hooks, not class components
    - Keep components small and focused
  `,
  scope: "GLOBAL",
  isActive: true,
});

// 2. Create a chat (rule automatically applies because it's GLOBAL)
const chat = await trpc.chat.createChat.mutateAsync({
  initialMessage: "Create a React component for me",
  modelId: "claude-3-5-sonnet-20241022",
});

// 3. The AI will follow the rules when generating responses
// (Implementation in progress)
```

### Workflow 2: Upload File and Reference in Chat

```typescript
// 1. Upload API documentation as LOCAL context
const context = await trpc.contextEngine.uploadFile.mutateAsync({
  filename: "api-docs.md",
  mimeType: "text/markdown",
  size: file.size,
  content: await file.text(),
  chatId: currentChatId,
  tags: ["api", "documentation"],
});

// 2. Context is now available in this chat
const chatContext = await trpc.contextEngine.getForChat.useQuery({
  chatId: currentChatId,
});
// Returns: [..., { name: "api-docs.md", ... }]

// 3. Send message referencing the context
// (AI will have access to the uploaded documentation)
```

### Workflow 3: Promote Useful Context to Global

```typescript
// 1. Upload file in one chat
const context = await trpc.contextEngine.uploadFile.mutateAsync({
  filename: "company-guidelines.pdf",
  // ... (LOCAL by default)
  chatId: "chat_1",
});

// 2. Realize it's useful for all chats - promote it
await trpc.contextEngine.promoteToGlobal.mutateAsync({
  id: context.id,
});

// 3. Now it's available in ALL chats
const chat2Context = await trpc.contextEngine.getForChat.useQuery({
  chatId: "chat_2", // Different chat
});
// Returns: [..., { name: "company-guidelines.pdf", scope: "GLOBAL" }]
```

---

## 🛡️ Error Handling

All errors are properly handled and returned in consistent format:

```typescript
const createRule = trpc.rules.create.useMutation({
  onError: (error) => {
    // error.message - User-friendly message
    // error.data.code - Error code (VALIDATION_ERROR, etc.)
    
    console.error("Failed to create rule:", error.message);
    
    // Show toast notification
    toast.error(error.message);
  },
  onSuccess: (data) => {
    toast.success("Rule created!");
  }
});

// Example errors:
// - "Name is required"
// - "Content too long (max 10000 characters)"
// - "Maximum 50 global rules allowed"
// - "Rule not found"
```

---

## 🔍 Loading States

```typescript
const { data, isLoading, error, refetch } = trpc.rules.getAll.useQuery();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage message={error.message} />;

return (
  <div>
    <h2>Rules ({data.stats.total})</h2>
    {data.rules.map(rule => (
      <RuleCard key={rule.id} rule={rule} />
    ))}
  </div>
);
```

---

## 📱 React Components Example

### Rules Manager Component

```tsx
'use client';

import { trpc } from '@/utils/trpc';

export function RulesManager() {
  const { data, isLoading } = trpc.rules.getAll.useQuery();
  const createRule = trpc.rules.create.useMutation();
  
  const handleCreate = async (formData: FormData) => {
    await createRule.mutateAsync({
      name: formData.get('name') as string,
      content: formData.get('content') as string,
      scope: 'GLOBAL',
      isActive: true,
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Rules ({data?.stats.total})</h1>
      
      {/* Stats */}
      <div className="stats">
        <span>Global: {data?.stats.global}</span>
        <span>Local: {data?.stats.local}</span>
        <span>Active: {data?.stats.active}</span>
      </div>
      
      {/* Rule List */}
      {data?.rules.map(rule => (
        <div key={rule.id} className="rule-card">
          <h3>{rule.name}</h3>
          <p>{rule.description}</p>
          <span>{rule.scope}</span>
        </div>
      ))}
      
      {/* Create Form */}
      <form action={handleCreate}>
        <input name="name" placeholder="Rule name" />
        <textarea name="content" placeholder="Rule content" />
        <button type="submit">Create Rule</button>
      </form>
    </div>
  );
}
```

---

## 🎨 Next.js App Router Integration

```typescript
// app/dashboard/rules/page.tsx
import { RulesManager } from '@/components/rules-manager';

export default function RulesPage() {
  return (
    <div className="container">
      <RulesManager />
    </div>
  );
}
```

---

## ✅ Available Now

- ✅ Rules CRUD (get, create)
- ✅ Context CRUD (get, upload, promote)
- ✅ Chat operations (existing)
- ✅ Full error handling
- ✅ Type safety
- ✅ Loading states

## 🔜 Coming Soon

- 🔲 Streaming chat with AI
- 🔲 Context injection in chat
- 🔲 Rules application in chat
- 🔲 Message token tracking
- 🔲 Chat sharing
- 🔲 Token usage analytics

---

**Ready to integrate with your frontend! 🎉**
