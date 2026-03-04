<div align="center">

# Naqsh

**Multi-tenant Project Management with Kanban board SaaS — Next.js 16, React 19, TypeScript, Prisma, oRPC, Better Auth**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## What This Is

Naqsh is a full-stack, multi-tenant project management application with Kanban boards, granular RBAC, and real-time-ish updates. Features include a complete board system with drag-and-drop interactions, task comments with role-aware moderation, mobile-optimized views, and a board-centric sidebar.

**Author**: [Erfan S. Khodadadi](https://github.com/erfnk)

---

## Architecture

### Multi-Tenancy

Organizations are the isolation boundary. All routes under `/app/{org-slug}/...` are scoped to a single tenant. An edge proxy (`proxy.ts`) handles session validation, auth redirects, and routing invited users through onboarding before they hit the org workspace. No data leaks across tenants — queries are always scoped by `organizationId`.

### Type-Safe Stack (DB → API → UI)

Types flow unbroken from the database to the browser:

- **Prisma** generates TypeScript types from the PostgreSQL schema
- **oRPC** provides end-to-end type-safe RPC between server and client (no REST, no GraphQL — just typed function calls)
- **Zod** validates all inputs at runtime at the API boundary
- **TanStack Query** handles client-side caching with typed query keys

There are no `any` types. No manual type assertions at API boundaries. If the Prisma schema changes, the compiler catches every downstream breakage.

### Server-First Rendering

React Server Components are the default. Client components (`"use client"`) are used only where interactivity demands it: forms, drag-and-drop, dialogs, and optimistic updates. Data is prefetched on the server via TanStack Query and hydrated on the client — no loading spinners on initial page load.

---

## RBAC & Permissions Model

The permission system is the most involved piece of custom engineering in the project.

### Three-Tier Role Hierarchy

`Owner > Admin > Member` — defined in `packages/auth/lib/roles.ts`. Role assignment is hierarchical: you can only assign roles below your own.

### Board-Level Permissions

A `BoardPermissions` interface exposes 10 granular boolean flags (`canEditBoard`, `canDeleteBoard`, `canManageColumns`, `canCreateTask`, `canEditAnyTask`, `canDeleteAnyTask`, `canMoveAnyTask`, `canEditOwnTask`, `canMoveOwnTask`, `canComment`). These are computed by `verifyBoardAccess()` based on:

- The user's org-level role
- Whether the user is the board creator
- Whether the board is private or shared
- Whether a task is assigned to the current user

Permission checks are enforced **twice**: once in oRPC procedures (server-side, authoritative), and once in the UI layer (conditionally rendering controls, disabling drag handles, hiding delete buttons). The server never trusts the client.

### What Each Role Can Actually Do

| | Owner | Admin | Member |
|---|---|---|---|
| **Shared boards** | Full CRUD on everything | Manage columns, CRUD tasks, create boards | View, move own tasks, comment |
| **Private boards** | Full access to own | Full access to own | Full access to own |
| **Org settings** | Full access, assign any role | Manage members, assign member role | View only |

---

## Kanban Board Implementation

The board is the core feature and the most complex piece of UI in the app.

### Drag-and-Drop

Built on **React Aria's** drag-and-drop primitives (not `react-beautiful-dnd` or `dnd-kit`). This gives full keyboard accessibility out of the box — Space to grab, Arrow keys to move, Enter to drop. All drag operations produce **optimistic updates**: the UI moves the card immediately, then syncs with the server. If the server rejects the move (e.g., permission denied), the card snaps back.

### Polling

Near-real-time updates via 10-second polling with TanStack Query. Not WebSockets — a deliberate trade-off for simplicity and serverless compatibility.

### Mobile

Touch-friendly swipe navigation between columns. The board is fully usable on phone screens, not just "responsive" in the sense that it doesn't break.

### Task Comments

Threaded comments on tasks with inline editing. Admins can moderate (delete any comment); members can only edit/delete their own.

---

## Tech Stack

### Frontend

| | |
|---|---|
| Next.js 16 (App Router, RSC) | React 19 |
| TypeScript 5.9 | Tailwind CSS v4 |
| Shadcn UI + Base UI | React Aria Components |
| TanStack Query + Table | React Hook Form + Zod |
| nuqs (URL state) | next-intl (i18n) |
| Hugeicons | |

### Backend

| | |
|---|---|
| oRPC (type-safe RPC) | Better Auth (email, OAuth, passkeys, 2FA) |
| Prisma ORM | PostgreSQL |
| Resend / SMTP | S3-compatible storage (MinIO for dev) |

### Tooling

| | |
|---|---|
| [Supastarter](https://supastarter.dev) (SaaS boilerplate) | pnpm + Turbo (monorepo) |
| Biome (lint + format) | Playwright (E2E) |
| Docker Compose (local services) | |

---

## Project Structure

```
naqsh/
├── apps/web/                       # Next.js application
│   ├── app/                        # App Router: (marketing), (saas), auth, api
│   ├── proxy.ts                    # Edge proxy — session checks, auth redirects
│   └── modules/
│       └── saas/boards/            # Kanban UI, drag-and-drop, permission-aware components
├── packages/
│   ├── api/modules/boards/         # oRPC procedures, verifyBoardAccess(), permission checks
│   ├── auth/                       # Better Auth config, role hierarchy, helpers
│   ├── database/                   # Prisma schema, migrations
│   ├── i18n/                       # Locale files, next-intl setup
│   ├── mail/                       # React Email templates
│   ├── storage/                    # S3 abstraction
│   ├── ui/                         # Shadcn component library
│   └── utils/                      # Shared utilities
├── config/                         # App-level configuration
└── tooling/                        # Shared Tailwind, TS, Biome configs
```

---


## License

[MIT](./LICENSE)

---

<div align="center">
Built by <a href="https://github.com/erfnk">Erfan S. Khodadadi</a>
</div>