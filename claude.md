# Coding Agent Guidelines

> Comprehensive guide for AI coding agents working with the Naqsh Next.js codebase.

## Purpose

Use this document whenever generating or updating code in this repository. Mirror existing project conventions; do not invent new patterns without a strong reason.

---

## Technology Stack

You are an expert in:

- **TypeScript** – Strict typing, interfaces over type aliases
- **Node.js** – Server-side runtime (>=20)
- **Next.js App Router** – React Server Components, layouts, route handlers
- **React** – Functional components, hooks
- **Shadcn UI & Base UI** – Accessible, composable primitives (`@base-ui-components/react`)
- **Hugeicons** – Icon library (`@hugeicons/react` + `@hugeicons/core-free-icons`)
- **Tailwind CSS** – Utility-first styling
- **oRPC** – Type-safe RPC layer
- **Better Auth** – Authentication with passkeys, magic links, organizations
- **Prisma** – Database ORM
- **React Hook Form + Zod** – Forms and validation
- **TanStack Query** – Client-side data fetching and caching

---

## Architecture Overview

### Monorepo Structure

```
/
├── apps/web/                    # Next.js application
│   ├── app/                     # App Router routes
│   │   ├── (marketing)/         # Public marketing pages
│   │   ├── (saas)/              # Protected SaaS application
│   │   ├── auth/                # Authentication pages
│   │   └── api/                 # API route handlers
│   ├── modules/                 # Shared UI & feature modules
│   │   ├── marketing/           # Marketing feature components
│   │   ├── saas/                # SaaS feature components
│   │   └── shared/              # Cross-cutting components
│   └── tests/                   # Playwright E2E tests
├── packages/                    # Shared backend packages
│   ├── api/                     # oRPC procedures and HTTP handlers
│   ├── auth/                    # Better Auth configuration
│   ├── database/                # Prisma schema and queries
│   ├── i18n/                    # Translations and locale utilities
│   ├── logs/                    # Logging configuration
│   ├── mail/                    # Email providers and templates
│   ├── payments/                # Payment processing (Stripe, etc.)
│   ├── storage/                 # File storage (S3, etc.)
│   ├── ui/                      # Shadcn UI components (Base UI primitives)
│   └── utils/                   # Shared utility functions
├── config/                      # Application configuration
└── tooling/                     # Build tooling and shared configs
```

### Import Conventions

Use package exports instead of deep relative imports:

```typescript
// Good
import { auth } from "@repo/auth";
import { db } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui";
import { orpcClient } from "@shared/lib/orpc-client";
import { config } from "@/config";

// Bad
import { auth } from "../../../packages/auth/auth";
```

### Path Aliases

The following path aliases are configured:

| Alias | Path |
|-------|------|
| `@repo/*` | `packages/*` |
| `@shared/*` | `apps/web/modules/shared/*` |
| `@saas/*` | `apps/web/modules/saas/*` |
| `@marketing/*` | `apps/web/modules/marketing/*` |
| `@repo/ui/*` | `packages/ui/*` |

---

## Core Coding Principles

### TypeScript

- Write TypeScript everywhere; prefer interfaces over type aliases for object shapes
- Avoid enums; use maps/records or union literals instead
- Use functional components with TypeScript interfaces
- Export types alongside implementations when needed

```typescript
// Good
interface UserProps {
  name: string;
  email: string;
  isActive: boolean;
}

const USER_ROLES = {
  admin: "admin",
  user: "user",
} as const;

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Bad
type UserProps = { name: string; email: string };
enum UserRole { Admin, User }
```

### Functions & Components

- Export React components as named functions; avoid default exports and classes
- Prefer pure functions declared with the `function` keyword
- Use descriptive camelCase identifiers (`isLoading`, `canSubmit`, `hasError`)
- Structure files: exported component, subcomponents, helpers, static content, types

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Directories | lowercase with dashes | `components/auth-wizard` |
| Components | PascalCase | `LoginForm.tsx` |
| Variables/Functions | camelCase | `isLoading`, `handleSubmit` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `UserProps`, `AuthConfig` |

---

## React & Next.js Patterns

### Server vs Client Components

- **Default to React Server Components** – Only add `"use client"` when interactivity or browser APIs are required
- Keep client components small and focused
- Wrap client components in `Suspense` with tailored fallbacks

### Minimize Client-Side State

- Minimize `useEffect` and `useState`; favor React Server Components
- Use `nuqs` for URL search parameter state management
- Avoid client components for data fetching or state management

### Data Fetching

- Use Next.js data-fetching primitives (Route Handlers, Server Actions, `fetch` with caching tags)
- Colocate route-specific helpers under the route directory
- Share cross-route logic via `apps/web/modules`
- Honor caching and revalidation patterns already in the repo

### Error Handling

- Use `notFound()`, `redirect()`, or custom error boundaries
- Don't throw raw errors; handle them gracefully

---

## API & Data Layer

### oRPC Procedures

API logic lives in `packages/api/modules`. Structure procedures with:

1. Route metadata (method, path, tags)
2. Input validation with Zod
3. Middleware (auth, locale)
4. Handler implementation

```typescript
// packages/api/modules/[feature]/procedures/[action].ts
import { publicProcedure, protectedProcedure } from "../../../orpc/procedures";
import { z } from "zod";

export const createItem = protectedProcedure
  .route({
    method: "POST",
    path: "/items",
    tags: ["Items"],
    summary: "Create a new item",
  })
  .input(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  }))
  .handler(async ({ input, context }) => {
    // Implementation
  });
```

### Procedure Types

- `publicProcedure` – No authentication required
- `protectedProcedure` – Requires authenticated session
- `adminProcedure` – Requires admin role

### Database Queries

- Use Prisma via `@repo/database`
- Never instantiate Prisma directly in app code
- Keep queries in `packages/database/prisma/queries/`

### Client-Side Data Fetching

Use TanStack Query with oRPC utilities:

```typescript
"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQuery } from "@tanstack/react-query";

export function ItemsList() {
  const { data, isLoading } = useQuery(
    orpc.items.list.queryOptions()
  );

  const createMutation = useMutation(
    orpc.items.create.mutationOptions()
  );

  // ...
}
```

---

## Authentication & Authorization

### Session Handling

- Use helpers from `@repo/auth` for session handling
- Server-side: `getSession()` from `@saas/auth/lib/server`
- Client-side: `useSession()` hook from `@saas/auth/hooks/use-session`

### Organization Scoping

- Respect organization scoping for multi-tenant features
- Access control helpers live in `apps/web/modules/saas/*/lib`
- Use `useActiveOrganization()` hook for organization context

### Auth Flow Consistency

When updating auth flows, ensure:
- Email templates in `packages/mail/emails` are updated
- Audit hooks remain consistent
- Locale detection works correctly

---

## UI & Styling

### Component Library

- Use Shadcn UI components from `@repo/ui/components`
- Components are built on **Base UI** primitives (`@base-ui-components/react`)
- Import the `cn` helper for conditional class names

```typescript
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui";

export function CustomButton({ variant, className }: Props) {
  return (
    <Button className={cn("custom-styles", className)} variant={variant}>
      Click me
    </Button>
  );
}
```

### Icons

Use Hugeicons for all icons:

```typescript
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

<HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
```

### Tailwind CSS

- Follow mobile-first responsive utility ordering
- Respect design tokens from `tooling/tailwind/theme.css`
- Use consistent spacing and color variables
- Use `data-*` attribute selectors for Base UI component states (e.g., `data-open`, `data-closed`, `data-active`)

### Image Optimization

- Use `next/image` with explicit `width`/`height`
- Prefer WebP format when possible
- Implement lazy loading for non-critical visuals

---

## Forms & Validation

### Form Implementation

- Use `react-hook-form` for form state management
- Use `zod` for schema validation
- Reuse existing form abstractions before creating new ones

### Shared Validation Schemas

- Define validation schemas in API module types for reuse
- Import schemas from `@repo/api/modules/[feature]/types`

---

## Internationalization

### Translation Strings

- Source strings via i18n utilities in `packages/i18n`
- Use `useTranslations()` hook in components

### Locale Handling

- Honor locale detection from `config.i18n`
- Use correct cookie naming conventions (`NEXT_LOCALE`)
- Server components: use `setRequestLocale(locale)`

---

## Configuration

### Config files

Each package and application has its own config file to keep the config scoped.

```typescript
import { config } from "@/config";
import { config as i18nConfig } from "@repo/i18n/config";

config.appName;           // Application name
i18nConfig.defaultLocale; // Default locale
```

### Environment Variables

- Server-only variables: No prefix
- Client-accessible variables: `NEXT_PUBLIC_` prefix
- Never commit secrets; use `.env.local`

---

## Tooling & Quality

### Package Manager

- Use **pnpm** for package management
- Run workspace-wide commands via **Turbo**

```bash
pnpm dev      # Start development server
pnpm build    # Build all packages
pnpm lint     # Run linting
pnpm format   # Format code
```

### Code Quality

- Linting and formatting use **Biome**
- Keep files Biome-clean before committing
- Target Node.js >= 20 with ESM-compatible imports

### Testing

- E2E tests use **Playwright** in `apps/web/tests`
- Run tests with `pnpm test`

### Adding Dependencies

- Add dependencies at the correct workspace package
- Wire up exports through the relevant `index.ts`
- Use the latest stable versions

---

## Performance Optimization

### Core Web Vitals

Optimize for LCP, CLS, and FID:

- Minimize `"use client"` directives
- Use dynamic imports for non-critical components
- Implement proper image optimization
- Avoid layout shifts with proper sizing

### Client Component Guidelines

Limit `"use client"` to:
- Components requiring browser APIs
- Interactive elements (forms, modals)
- Small, focused client boundaries

Avoid `"use client"` for:
- Data fetching
- Complex state management
- Layout components

---

## Best Practices Summary

### When Adding Features

1. Inspect neighboring files for patterns before writing new code
2. Prefer incremental, well-scoped changes over sweeping rewrites
3. Ensure new features have corresponding server and client stories (UI, API, data layer, emails if needed)
4. Test the feature locally before considering it complete

### Code Review Checklist

- [ ] TypeScript types are accurate and complete
- [ ] No `any` types without justification
- [ ] Server Components used where possible
- [ ] Forms use react-hook-form + zod
- [ ] API procedures follow existing patterns
- [ ] Translations added for user-facing strings
- [ ] Mobile-first responsive design
- [ ] Accessibility considered (Base UI primitives)
- [ ] No console.log statements in production code
- [ ] Biome linting passes

### When in Doubt

- Inspect neighboring files for patterns before writing new code
- Ask for clarification on product requirements rather than guessing
- Prefer incremental, well-scoped changes over sweeping rewrites

---

## Feature Implementation Reference: Kanban Board

> This section documents a complete full-stack feature implementation as a reference for building future features.

### Overview

A multi-tenant Kanban board for task management, integrated with a board-centric sidebar. The feature spans database schema, API layer, sidebar navigation, and interactive UI with drag-and-drop.

### Database Schema

**New Prisma models** in `packages/database/prisma/schema.prisma`:

| Model | Purpose |
|-------|---------|
| `Board` | Board entity with title, description, visibility (private/public), org + creator refs |
| `BoardFavorite` | Join table for user-favorited boards (unique per user+board) |
| `BoardAccess` | Tracks last-accessed timestamp per user+board for "Recent" section |
| `Column` | Board columns with position ordering (default: To Do, In Progress, Done) |
| `Task` | Tasks within columns — title, description, priority, position, assignee |

### Database Queries

**File**: `packages/database/prisma/queries/boards.ts`

17 query functions covering Board CRUD, listings (favorites, recent, shared), favorites toggle, access tracking, Column CRUD + reorder, and Task CRUD + move/reorder.

### API Layer (oRPC)

**Module**: `packages/api/modules/boards/`

16 protected procedures organized into a nested router:

```
boards.create / boards.list / boards.get / boards.update / boards.delete
boards.toggleFavorite
boards.columns.create / .update / .delete / .reorder
boards.tasks.create / .update / .delete / .move / .reorder
boards.members.list
```

**Access control** (`lib/board-access.ts`): `verifyBoardAccess` (creator always has access; public boards accessible to any org member) and `verifyBoardOwner` (only the creator can modify board settings).

### UI Components

**Module**: `apps/web/modules/saas/boards/`

| Component | Description |
|-----------|-------------|
| `KanbanBoard` | Main orchestrator — fetches board, applies memoized search/filter, renders columns or mobile view |
| `KanbanColumn` | React Aria `GridList` with `useDragAndDrop` — within-column reorder + cross-column insert |
| `KanbanTaskCard` | Card with title, priority badge, assignee avatar |
| `KanbanTaskContextMenu` | Right-click: Edit, Change Priority, Move to Column, Delete |
| `EditTaskDialog` / `CreateTaskDialog` | Modal forms with react-hook-form |
| `TaskFormFields` | Shared form fields used by both task dialogs |
| `BoardToolbar` | Search input + assignee/priority filters using URL query params (`nuqs`) |
| `MobileColumnView` | Swipeable single-column view with dot indicators for mobile |
| `BoardSettingsForm` | Board name, description, visibility toggle, danger zone with delete |
| `CreateBoardDialog` | Dialog with title + description for creating new boards |
| `BoardSidebarContent` | Sidebar navigation — Favorites, Recent, Shared sections |

### Drag-and-Drop

Built on **React Aria Components** (`react-aria-components`):
- Each column is a `GridList` with `useDragAndDrop` hooks
- `onReorder` handles within-column position changes
- `onInsert` handles cross-column drops
- `onRootDrop` handles drops on empty columns
- Full keyboard accessibility (Space to drag, Arrow keys to move, Enter to drop, Escape to cancel)
- Optimistic updates with TanStack Query `onMutate` and rollback on error

### Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| React Aria for DnD | Accessible by default (keyboard + screen reader), handles both touch and pointer |
| `nuqs` for filter state | Filters persist in URL, shareable/bookmarkable |
| Board visibility model | Simple private/public toggle rather than complex ACL |
| Default columns on create | Every new board starts with "To Do", "In Progress", "Done" |
| Sidebar-first navigation | Boards are the primary workspace, accessed from sidebar |
