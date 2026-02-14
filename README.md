<div align="center">

# Naqsh

**A modern, multi-tenant Kanban board SaaS application built with Next.js**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/erfnk/naqsh-app/pulls)

[Getting Started](#getting-started) · [Features](#features) · [Tech Stack](#tech-stack) · [Contributing](#contributing)

</div>

---

## Overview

Naqsh is a production-ready, full-stack SaaS application that demonstrates modern web development best practices. It features a rich Kanban board for multi-tenant task management with role-based access control, complete authentication flows, and an admin panel — all built with a type-safe, server-first architecture.

Built on the [Supastarter](https://supastarter.dev) boilerplate as the foundation, extended with a full Kanban board feature, drag-and-drop interactions, RBAC permissions, task comments, mobile-optimized views, and a redesigned board-centric sidebar.

**Author**: [Erfan S. Khodadadi](https://github.com/erfnk)

---

## Features

### Kanban Boards
- Drag-and-drop task management with columns, priorities, assignees, and optimistic updates
- Full keyboard accessibility via React Aria
- **Private boards** — visible only to the creator
- **Shared/public boards** — visible to all organization members with role-based permissions
- **Task comments** — threaded comments on tasks with inline editing and admin moderation
- Near-real-time updates via 10-second polling

### Role-Based Access Control (RBAC)
Three-tier role hierarchy enforced at both API and UI levels:

| Role | Board Permissions | Org Permissions |
|------|------------------|-----------------|
| **Owner** | Full access to all boards | Manage members, assign admin/member roles |
| **Admin** | Manage columns and tasks on shared boards, create shared boards | Manage members, assign member roles |
| **Member** | View shared boards, move/update own assigned tasks, comment | View-only for org settings |

- Board creators always have full permissions on their own boards
- Members can move their own assigned tasks between columns and leave comments
- Admins can manage columns, create/edit/delete any task on shared boards
- Role assignment is hierarchical — you can only assign roles below your own

### Multi-Tenant Routing
- Organization-scoped URLs (`/app/{org-slug}/...`) inspired by Linear and Notion
- Automatic redirect from `/app` to the user's active organization
- Invited users are routed through onboarding before landing in the org
- Edge proxy handles session checks and auth redirects

### Authentication
- Email/password, Google OAuth, passkeys (WebAuthn), magic links, and two-factor authentication powered by Better Auth
- Organization invitations with automatic onboarding flow

### Additional
- **Admin Panel** — User and organization management for administrators
- **Internationalization** — Multi-language support with next-intl and locale-aware routing
- **Mobile Responsive** — Touch-friendly swipe navigation for Kanban boards, optimized for all screen sizes
- **Type-Safe API** — End-to-end TypeScript with oRPC for type-safe RPC calls between client and server
- **Accessible UI** — WCAG-compliant components built on Base UI and React Aria primitives
- **SEO Ready** — Server-rendered pages with proper metadata, Open Graph tags, and semantic HTML

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router and Server Components |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5.9](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Shadcn UI](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) | Accessible component library |
| [React Aria Components](https://react-spectrum.adobe.com/react-aria/) | Drag-and-drop and accessibility primitives |
| [Hugeicons](https://hugeicons.com/) | Icon library |
| [TanStack Query](https://tanstack.com/query) | Client-side data fetching and caching |
| [TanStack Table](https://tanstack.com/table) | Headless table utilities |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form state management and validation |
| [nuqs](https://nuqs.47ng.com/) | URL search parameter state management |
| [next-intl](https://next-intl-docs.vercel.app/) | Internationalization |

### Backend

| Technology | Purpose |
|-----------|---------|
| [oRPC](https://orpc.unnoq.com/) | Type-safe RPC layer |
| [Better Auth](https://www.better-auth.com/) | Authentication (email, OAuth, passkeys, 2FA, organizations) |
| [Prisma](https://www.prisma.io/) | Database ORM |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Resend](https://resend.com/) / SMTP | Email delivery |
| [S3-compatible storage](https://min.io/) | File uploads (MinIO for development) |

### Tooling

| Technology | Purpose |
|-----------|---------|
| [Supastarter](https://supastarter.dev) | SaaS boilerplate foundation |
| [pnpm](https://pnpm.io/) | Package manager |
| [Turbo](https://turbo.build/) | Monorepo build system |
| [Biome](https://biomejs.dev/) | Linting and formatting |
| [Playwright](https://playwright.dev/) | End-to-end testing |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 10
- [Docker](https://www.docker.com/) (for PostgreSQL and MinIO)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/erfnk/naqsh-app.git
cd naqsh-app
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration. See [`.env.example`](./.env.example) for all available variables.

4. **Start development services:**

```bash
docker compose up -d
```

This starts PostgreSQL and MinIO (S3-compatible storage) for local development.

5. **Set up the database:**

```bash
pnpm --filter database push
pnpm --filter database generate
```

6. **Start the development server:**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## Project Structure

```
naqsh/
├── apps/
│   └── web/                        # Next.js application
│       ├── app/                    # App Router routes
│       │   ├── (marketing)/        # Public marketing pages
│       │   ├── (saas)/             # Protected SaaS application
│       │   ├── auth/               # Authentication flows
│       │   └── api/                # API route handlers
│       ├── proxy.ts                # Edge proxy (session checks, auth redirects)
│       └── modules/                # Feature modules
│           ├── marketing/          # Marketing components
│           ├── saas/               # SaaS features
│           │   ├── boards/         # Kanban board + permissions UI
│           │   ├── auth/           # Auth components
│           │   ├── onboarding/     # User onboarding flow
│           │   ├── organizations/  # Organization management
│           │   ├── settings/       # User settings
│           │   └── admin/          # Admin panel
│           └── shared/             # Shared components and utilities
├── packages/
│   ├── api/                        # oRPC API layer
│   │   └── modules/boards/         # Board procedures + permission checks
│   ├── auth/                       # Better Auth config + role helpers
│   ├── database/                   # Prisma schema and queries
│   ├── i18n/                       # Internationalization
│   ├── mail/                       # Email templates (React Email)
│   ├── storage/                    # S3 file storage
│   ├── ui/                         # Shadcn UI component library
│   └── utils/                      # Shared utilities
├── config/                         # Application configuration
└── tooling/                        # Shared configs (Tailwind, TypeScript, Biome)
```

---

## Development

### Commands

```bash
pnpm dev                            # Start development server
pnpm build                          # Build all packages
pnpm lint                           # Run Biome linter
pnpm format                         # Format code with Biome
pnpm --filter database push         # Push Prisma schema changes
pnpm --filter database generate     # Generate Prisma client
pnpm --filter web e2e               # Run Playwright E2E tests
```

### Adding Dependencies

```bash
pnpm add <package> --filter web             # Add to web app
pnpm add <package> --filter @repo/ui        # Add to UI package
pnpm add <package> --filter @repo/database  # Add to database package
```

---

## Architecture

### Multi-Tenancy & Routing

Organizations provide data isolation with role-based access control. Users always land in their organization scope (`/app/{org-slug}`). The edge proxy in `proxy.ts` handles session validation, redirecting unauthenticated users to login and routing authenticated users to their active organization. Invited users are guided through onboarding before accessing the org workspace.

### RBAC & Board Permissions

The role system is built on a three-tier hierarchy (owner > admin > member) defined in `packages/auth/lib/roles.ts`. Board access is controlled through a `BoardPermissions` interface with 10 granular permission flags, computed by `verifyBoardAccess()` based on the user's org role and relationship to the board. Permission checks happen at both the API layer (oRPC procedures) and the UI layer (conditionally rendering controls, disabling drag-and-drop, hiding action buttons).

### Type Safety

The entire stack is type-safe: TypeScript for the language, oRPC for API calls, Zod for runtime validation, and Prisma for database queries. Types flow from the database schema through the API layer to the UI.

### Server-First

React Server Components are the default. Client components are used only for interactivity (forms, drag-and-drop, dialogs). Data is prefetched on the server with TanStack Query and hydrated on the client.

### Accessibility

All interactive components are built on Base UI and React Aria primitives, providing keyboard navigation, screen reader support, and WCAG compliance out of the box. The Kanban board supports full keyboard drag-and-drop (Space to grab, Arrow keys to move, Enter to drop).

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for comprehensive coding guidelines, architectural patterns, and a full-stack feature implementation reference.

See [agents.md](./agents.md) for detailed documentation on the RBAC system, board permissions model, and multi-tenant routing flow.

---

## Credits

Built by **[Erfan S. Khodadadi](https://github.com/erfnk)**.

This project uses the [Supastarter](https://supastarter.dev) boilerplate as its foundation, extended with custom features including the Kanban board system, RBAC permissions, task comments, board-centric sidebar, and mobile-optimized views.

### Key Technologies

- [Next.js](https://nextjs.org/) — React framework
- [Supastarter](https://supastarter.dev) — SaaS boilerplate
- [Shadcn UI](https://ui.shadcn.com/) — Component library
- [Base UI](https://base-ui.com/) — Accessible primitives
- [Better Auth](https://www.better-auth.com/) — Authentication & organizations
- [oRPC](https://orpc.unnoq.com/) — Type-safe RPC
- [Prisma](https://www.prisma.io/) — Database ORM
- [React Aria](https://react-spectrum.adobe.com/react-aria/) — Accessibility & DnD
- [TanStack Query](https://tanstack.com/query) — Data fetching

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">
Made with care by <a href="https://github.com/erfnk">Erfan S. Khodadadi</a>
</div>
