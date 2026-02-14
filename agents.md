# Naqsh — System Architecture & Agent Documentation

> This document describes how the application works at a system level: multi-tenant routing, role-based access control, board permissions, and the task comments system.

---

## Table of Contents

- [Multi-Tenant Routing](#multi-tenant-routing)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Board Permissions System](#board-permissions-system)
- [Task Comments](#task-comments)
- [Database Schema](#database-schema)
- [API Layer](#api-layer)
- [UI Permission Awareness](#ui-permission-awareness)

---

## Multi-Tenant Routing

### How Users Enter the App

All routing logic lives in `apps/web/proxy.ts`, which acts as a Next.js edge proxy (middleware). It intercepts every request and decides where the user should go.

**Flow:**

```
User visits /app
  ├── No session cookie → redirect to /auth/login?redirectTo=/app
  └── Has session cookie → hits /app page (server component)
        ├── No organizations → redirect to /new-organization
        └── Has organizations → redirect to /app/{org-slug}
```

### Organization-Scoped URLs

Once authenticated, users always operate within an organization scope:

```
/app/{org-slug}                    → Organization dashboard (boards list)
/app/{org-slug}/boards/{board-slug} → Board detail (Kanban view)
/app/{org-slug}/settings/members   → Org member management
```

The `/app` route (`apps/web/app/(saas)/app/(account)/page.tsx`) is a pure redirect — it fetches the user's organizations and sends them to their active org or first available org.

### Invitation Flow

When a user clicks an organization invitation link:

```
/organization-invitation/{invitationId}
  ├── Accept invitation
  │   ├── User not onboarded → /onboarding?redirectTo=/app/{org-slug}
  │   └── User onboarded → /app/{org-slug}
  └── Reject invitation
      ├── Has other orgs → /app/{first-org-slug}
      └── No orgs → /auth/login
```

### Onboarding

The onboarding page (`/onboarding`) handles first-time user setup. On completion:

```
onCompleted()
  ├── redirectTo param exists → follow redirect (e.g., back to org from invitation)
  ├── Has organizations → /app/{org-slug}
  └── No organizations → /new-organization
```

If a user who has already completed onboarding visits `/onboarding`, they are immediately redirected to their org.

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

Defined in `packages/auth/lib/roles.ts`:

```
owner (level 3)  >  admin (level 2)  >  member (level 1)
```

Roles come from Better Auth's organization plugin and are stored as strings in the `Member` table.

### Core Functions

| Function | Purpose |
|----------|---------|
| `hasMinRole(userRole, requiredRole)` | Check if a user's role meets a minimum threshold |
| `canManageMembers(role)` | Returns true for admin and above |
| `canManageBoards(role)` | Returns true for admin and above |
| `canAssignRole(assignerRole, targetRole)` | Assigner must be strictly higher than target |
| `getAssignableRoles(assignerRole)` | Returns roles the assigner can grant |

### Role Assignment Rules

- **Owner** can assign: admin, member
- **Admin** can assign: member
- **Member** can assign: nobody

Role changes and member removal in the UI (`OrganizationMembersList`, `InviteMemberForm`) are gated by these functions. The role select dropdown is disabled for users you cannot manage, and only shows roles you can assign.

---

## Board Permissions System

### Board Visibility

Boards have two visibility modes:

- **Private** (`visibility: "private"`) — Only the creator can see and interact with the board
- **Public/Shared** (`visibility: "public"`) — All members of the organization can see the board

Only org admins and owners can create shared (public) boards. Any user can create private boards.

### Permission Model

Defined in `packages/api/modules/boards/types.ts`:

```typescript
interface BoardPermissions {
  canEditBoard: boolean;       // Edit board title, description
  canDeleteBoard: boolean;     // Delete the board
  canManageColumns: boolean;   // Create, edit, delete, reorder columns
  canCreateTasks: boolean;     // Create new tasks
  canEditAnyTask: boolean;     // Edit any task's details
  canMoveAnyTask: boolean;     // Move any task between columns
  canUpdateOwnTask: boolean;   // Update tasks assigned to you
  canComment: boolean;         // Add comments to tasks
  canFavorite: boolean;        // Favorite/unfavorite the board
  canView: boolean;            // View the board at all
}
```

### Permission Resolution

`verifyBoardAccess()` in `packages/api/modules/boards/lib/board-access.ts` computes permissions based on:

1. **Board creator** → Full permissions (all true)
2. **Public board + org admin/owner** → Can manage columns and tasks, but cannot edit/delete the board itself
3. **Public board + org member** → View-only, plus: can update own assigned tasks, comment, and favorite
4. **Private board + not creator** → Access denied (FORBIDDEN)

```
verifyBoardAccess(boardId, userId)
  ├── Board not found → NOT_FOUND
  ├── User is board creator → FULL_PERMISSIONS
  ├── Board is public
  │   ├── User is org admin/owner → admin-level permissions
  │   └── User is org member → member-level permissions (view + own tasks + comment)
  └── Board is private + user is not creator → FORBIDDEN
```

### Own-Task Fallback

Members on shared boards cannot edit arbitrary tasks, but they CAN:
- **Move their own assigned tasks** between columns (checked in `move-task.ts`)
- **Update their own assigned tasks** (limited to column change, checked in `update-task.ts`)

This is the "own-task fallback" pattern — the procedure first checks `canMoveAnyTask`/`canEditAnyTask`, and if that fails, checks if the user is the task's assignee AND has `canUpdateOwnTask`.

---

## Task Comments

### Data Model

```prisma
model TaskComment {
  id        String   @id @default(cuid())
  taskId    String
  authorId  String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  task      Task     @relation(...)
  author    User     @relation("commentAuthor", ...)
}
```

### API Procedures

| Procedure | Route | Permission |
|-----------|-------|------------|
| `boards.tasks.comments.create` | `POST /boards/{boardId}/comments` | `canComment` |
| `boards.tasks.comments.list` | `GET /boards/{boardId}/tasks/{taskId}/comments` | `canView` |
| `boards.tasks.comments.update` | `PUT /boards/comments/{id}` | Author only |
| `boards.tasks.comments.delete` | `DELETE /boards/comments/{id}` | Author or org admin |

### UI Component

`TaskCommentsSection` (`apps/web/modules/saas/boards/components/TaskCommentsSection.tsx`) is embedded in the `EditTaskDialog`. It provides:

- Comment list with author avatars, timestamps, and content
- Inline editing for own comments
- Delete for own comments (with edit/delete icons)
- Org admins can also delete any comment (via API)
- New comment input with Cmd/Ctrl+Enter keyboard shortcut
- 10-second polling for near-real-time updates
- Conditional rendering: comment input only appears if `canComment` is true

---

## Database Schema

### Core Models

```
User ─┬─ Session
      ├─ Account (OAuth providers)
      ├─ Passkey (WebAuthn)
      ├─ TwoFactor
      ├─ Member ── Organization
      ├─ Board (creator)
      ├─ Task (creator, assignee)
      ├─ TaskComment (author)
      ├─ BoardFavorite
      └─ BoardAccess

Organization ─┬─ Member
              ├─ Invitation
              └─ Board ─┬─ Column ── Task ── TaskComment
                        ├─ BoardFavorite
                        └─ BoardAccess
```

### Key Relationships

- A **Board** belongs to an Organization and has a creator (User)
- A **Task** belongs to a Column and a Board, has a creator and optional assignee
- A **TaskComment** belongs to a Task, authored by a User
- **BoardFavorite** is a unique join table (user + board)
- **BoardAccess** tracks last-accessed timestamps for "Recent" boards in the sidebar

---

## API Layer

### Procedure Structure

All board API logic lives in `packages/api/modules/boards/procedures/`. Each procedure follows this pattern:

1. Define route metadata (HTTP method, path, tags)
2. Define input schema (Zod)
3. Call `verifyBoardAccess()` to get permissions
4. Check the relevant permission flag
5. Execute the database query

### Router Structure

```
boards
├── create / list / get / getBySlug / update / delete
├── toggleFavorite
├── columns
│   ├── create / update / delete / reorder
├── tasks
│   ├── create / update / delete / move / reorder
│   └── comments
│       ├── create / list / update / delete
└── members
    └── list
```

### Procedure Types

- `publicProcedure` — No auth required
- `protectedProcedure` — Requires authenticated session (all board procedures use this)
- `adminProcedure` — Requires admin role

---

## UI Permission Awareness

The UI adapts based on the `BoardPermissions` object returned from the board API:

### Drag-and-Drop

`KanbanColumn` conditionally enables/disables drag-and-drop based on `canMoveAnyTask` or `canUpdateOwnTask`:
- When disabled: `getItems` returns empty arrays and `acceptedDragTypes` is set to `[]`, silently preventing drag initiation and drop acceptance
- This keeps the UI clean (no broken cursor states) while enforcing permissions

### Context Menu

`KanbanTaskContextMenu` conditionally renders menu items:
- "Edit" (view) always shows
- "Change Priority" only if `canEditAnyTask`
- "Move to Column" only if `canMoveAnyTask`
- "Delete" only if `canEditAnyTask`

### Task Dialog

`EditTaskDialog` switches between two modes:
- **Editable**: Full form with submit button when `canEditAnyTask`
- **Read-only**: Disabled form fields with no submit when `canEditAnyTask` is false
- **Comments section** always shows at the bottom when the task exists, with the input field conditional on `canComment`

### Column Header

`ColumnHeader` hides the "Add task" button when `canCreateTasks` is false.

### Board Creation

`CreateBoardDialog` shows a "Shared with organization" toggle only for org admins/owners. Regular members can only create private boards.
