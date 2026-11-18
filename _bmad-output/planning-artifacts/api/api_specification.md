# TaskFlow REST API Specification (OpenAPI / Swagger Architecture)

- **Document Version**: v1.0 (Approved Baseline)
- **Status**: Approved & Baseline Locked
- **Date**: 2026-11-18
- **Project Directory**: `_bmad-output/planning-artifacts/api`

---

## 1. Global API Standards & Conventions

### 1.1 Base URL & Content Negotiation
- **Base URL**: `https://api.taskflow.com/api/v1`
- **Request / Response Formats**: `application/json` (UTF-8)
- **Authentication Headers**:
  - `Authorization: Bearer <accessToken>`
  - `x-organization-id: <organizationId>` (Mandatory on all tenant-scoped endpoints)

### 1.2 Unified Success & Error Schemas

#### Standard Success Envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "hasMore": true
  }
}
```

#### Standard Error Envelope:
```json
{
  "success": false,
  "error": {
    "code": "PROJECT_QUOTA_EXCEEDED",
    "message": "Maximum of 3 active projects allowed on Free tier.",
    "details": { "current": 3, "max": 3 }
  }
}
```

---

## 2. API Endpoint Groups (22 Functional Groups)

---

### Group 1: Authentication (`/auth`)
- `POST /auth/register`
  - Purpose: Register a new user account.
  - Auth: Public.
  - Body: `{ email, password, fullName }`
  - Response: `201 Created` `{ user, accessToken }` + sets refresh token cookie.
- `POST /auth/login`
  - Purpose: Authenticate credentials.
  - Auth: Public.
  - Body: `{ email, password, rememberMe }`
  - Response: `200 OK` `{ user, accessToken, organizations }`.
- `POST /auth/refresh`
  - Purpose: Silent token rotation.
  - Auth: Public (HttpOnly cookie).
  - Response: `200 OK` `{ accessToken }`.
- `POST /auth/logout`
  - Purpose: Terminate current user session.
  - Auth: Authenticated.
  - Response: `200 OK` (Clears cookie, invalidates session in DB).

---

### Group 2: Users & Profiles (`/users`)
- `GET /users/me`
  - Purpose: Get current authenticated user profile and permissions.
  - Auth: Authenticated.
  - Response: `200 OK` `{ user }`.
- `PATCH /users/me`
  - Purpose: Update profile details (name, avatar, theme preferences).
  - Auth: Authenticated.
  - Body: `{ fullName?, displayName?, preferences? }`
- `PUT /users/me/password`
  - Purpose: Change password.
  - Auth: Authenticated.
  - Body: `{ currentPassword, newPassword }`

---

### Group 3: Organizations (`/organizations`)
- `GET /organizations`
  - Purpose: List organizations current user belongs to.
  - Auth: Authenticated.
  - Response: `200 OK` `[ { org, role, plan } ]`.
- `POST /organizations`
  - Purpose: Provision a new organization workspace.
  - Auth: Authenticated.
  - Body: `{ name, slug, logoUrl? }`
  - Response: `201 Created` `{ organization }`.
- `GET /organizations/current`
  - Purpose: Get details of active organization.
  - Auth: `Org Member`+.
- `PATCH /organizations/current`
  - Purpose: Update workspace branding.
  - Auth: `Org Admin` / `Org Owner`.
  - Body: `{ name?, logoUrl? }`
- `DELETE /organizations/current`
  - Purpose: Soft-delete organization workspace.
  - Auth: `Org Owner` strictly.

---

### Group 4: Organization Members (`/organizations/current/members`)
- `GET /organizations/current/members`
  - Purpose: List all members of active organization.
  - Auth: `Org Member`+.
  - Query: `?status=active&search=john`
- `PATCH /organizations/current/members/:userId/role`
  - Purpose: Update member organization role.
  - Auth: `Org Owner` (or `Org Admin` updating lower tiers).
  - Body: `{ role: "admin"|"member"|"guest" }`
  - Side Effect: Dispatches Socket.IO `member:role_updated`.
- `DELETE /organizations/current/members/:userId`
  - Purpose: Deactivate/remove member from organization.
  - Auth: `Org Owner` / `Org Admin`.

---

### Group 5: Invitations (`/organizations/current/invitations`)
- `POST /organizations/current/invitations`
  - Purpose: Invite new member to organization.
  - Auth: `Org Admin` / `Org Owner`.
  - Body: `{ email, role, preAssignedProjectIds? }`
  - Quota Check: Enforces plan seat limits. Returns `402` if exceeded.
- `POST /invitations/accept`
  - Purpose: Accept pending invitation via signed token.
  - Auth: Public / Authenticated.
  - Body: `{ token, password? }`
  - Side Effect: Emits Socket.IO `member:joined` to `org:<id>`.

---

### Group 6: Roles & Permissions (`/organizations/current/roles`)
- `GET /organizations/current/roles`
  - Purpose: List built-in and custom roles.
  - Auth: `Org Member`+.
- `POST /organizations/current/roles`
  - Purpose: Create custom role (Business tier).
  - Auth: `Org Admin` / `Org Owner`.
  - Body: `{ name, permissions: ["task:create", ...] }`

---

### Group 7: Projects (`/projects`)
- `GET /projects`
  - Purpose: List projects in active organization accessible to user.
  - Auth: `Org Member`+ (Guests see only assigned projects).
  - Query: `?status=active&search=mobile`
- `POST /projects`
  - Purpose: Create new project.
  - Auth: `Org Member`+ with create permission.
  - Body: `{ name, key, description?, targetDeliveryDate? }`
  - Quota Check: Free tier capped at 3 projects.
  - Side Effect: Emits Socket.IO `project:created` to `org:<id>`.
- `GET /projects/:projectId`
  - Purpose: Get project details and workflow settings.
- `PATCH /projects/:projectId`
  - Purpose: Update project settings or column configurations.
  - Auth: `Project Manager` / `Org Admin`.
- `DELETE /projects/:projectId`
  - Purpose: Soft-delete / archive project.
  - Auth: `Project Manager` / `Org Admin`.

---

### Group 8: Project Members (`/projects/:projectId/members`)
- `GET /projects/:projectId/members`
  - Purpose: List assigned members and their Tier 2 roles.
- `POST /projects/:projectId/members`
  - Purpose: Assign organization member to project.
  - Auth: `Project Manager` / `Org Admin`.
  - Body: `{ userId, role: "team_lead"|"member"|"viewer" }`
- `DELETE /projects/:projectId/members/:userId`
  - Purpose: Remove member from project.
  - Auth: `Project Manager` / `Org Admin`.

---

### Group 9: Tasks (`/projects/:projectId/tasks`)
- `GET /projects/:projectId/tasks`
  - Purpose: Get tasks for project (supports List, Calendar, Gantt views).
  - Query: `?status=in_progress&assigneeId=...&page=1&limit=50`
- `POST /projects/:projectId/tasks`
  - Purpose: Create new task.
  - Auth: `Project Member`+.
  - Body: `{ title, description?, columnId, priority?, assigneeId?, dueDate? }`
  - Side Effect: Emits Socket.IO `task:created` to `project:<id>`.
- `GET /tasks/:taskId`
  - Purpose: Get full task details, subtasks, and metadata.
- `PATCH /tasks/:taskId`
  - Purpose: Update task attributes (title, priority, assignee, due date).
  - Auth: `Project Member`+.
  - Body: `{ title?, priority?, assigneeId?, dueDate?, storyPoints? }`
  - Side Effect: Emits Socket.IO `task:updated` to `project:<id>`.
- `DELETE /tasks/:taskId`
  - Purpose: Soft-delete task.
  - Auth: `Project Manager` / `Team Lead` / `Task Reporter`.

---

### Group 10: Kanban Board & LexoRank Reordering (`/tasks/:taskId/reorder`)
- `PATCH /tasks/:taskId/reorder`
  - Purpose: Move card to new column and/or update relative rank order.
  - Auth: `Project Member`+ (Forbidden for Guests).
  - Body: `{ newColumnId, orderKey, version }`
  - Concurrency: Validates `version` with optimistic lock.
  - Response: `200 OK` `{ taskId, columnId, order, version: version + 1 }`.
  - Error: `409 Conflict` (`ORDER_CONFLICT`) if concurrent movement detected.
  - Side Effect: Dispatches Socket.IO `card:moved` to `project:<projectId>`.

---

### Group 11: Task Dependencies (`/tasks/:taskId/dependencies`)
- `GET /tasks/:taskId/dependencies`
  - Purpose: Get predecessor and successor links.
- `POST /tasks/:taskId/dependencies`
  - Purpose: Link predecessor task (Gantt dependency).
  - Auth: `Project Member`+.
  - Body: `{ predecessorTaskId }`
  - Validation: Cycle detection graph check. Rejects loops with `400 Bad Request`.
- `DELETE /tasks/:taskId/dependencies/:predecessorTaskId`
  - Purpose: Remove dependency link.

---

### Group 12: Comments & Mentions (`/tasks/:taskId/comments`)
- `GET /tasks/:taskId/comments`
  - Purpose: Get comment discussion thread.
  - Serialization Guard: Automatically strips `isInternal: true` comments if requester is `Org Guest` or `Project Viewer`.
- `POST /tasks/:taskId/comments`
  - Purpose: Add comment or internal team note.
  - Auth: `Project Member`+ or `Project Viewer` (Public comments only).
  - Body: `{ text, isInternal?: boolean }`
  - Validation: If `isInternal: true` and user is a Guest &rarr; `403 Forbidden`.
  - Side Effect: Emits Socket.IO `comment:new` (omitted for guests if internal).

---

### Group 13: File Attachments (`/tasks/:taskId/attachments`)
- `POST /tasks/:taskId/attachments/signature`
  - Purpose: Request signed Cloudinary upload credentials.
  - Auth: `Project Member`+ (Forbidden for Guests).
  - Body: `{ fileName, fileType, fileSize }`
  - Response: `200 OK` `{ signature, timestamp, apiKey, uploadUrl }`.
- `POST /tasks/:taskId/attachments/complete`
  - Purpose: Register completed upload metadata.
  - Body: `{ cloudinaryPublicId, secureUrl, fileName, fileSize, mimeType }`
  - Side Effect: Dispatches Socket.IO `attachment:uploaded`.
- `DELETE /attachments/:attachmentId`
  - Purpose: Remove file attachment.
  - Auth: Uploader / `Project Manager` / `Org Admin`.

---

### Group 14: Labels & Tags (`/organizations/current/labels`)
- `GET /organizations/current/labels`
  - Purpose: List organization labels.
- `POST /organizations/current/labels`
  - Purpose: Create label tag with Hex color.
  - Body: `{ name, color }`

---

### Group 15: Notifications (`/notifications`)
- `GET /notifications`
  - Purpose: Get unread and recent notifications for user.
  - Query: `?isRead=false&page=1&limit=20`
- `PATCH /notifications/:id/read`
  - Purpose: Mark single notification read.
- `POST /notifications/mark-all-read`
  - Purpose: Bulk mark all read.

---

### Group 16: Active Stopwatch Timer (`/time-tracking/timer`)
- `GET /time-tracking/timer/active`
  - Purpose: Get current running timer for authenticated user.
  - Response: `200 OK` `{ timer: { taskId, startTime, isRunning } | null }`.
- `POST /time-tracking/timer/start`
  - Purpose: Start stopwatch timer on task (enforces single-timer constraint).
  - Body: `{ taskId, isBillable?: boolean }`
  - Side Effect: Auto-commits prior active timer; emits `timer:sync` to user's devices.
- `POST /time-tracking/timer/stop`
  - Purpose: Stop running timer and flush duration into `TimeEntry`.
  - Body: `{ notes? }`
  - Response: `201 Created` `{ timeEntry }`.

---

### Group 17: Manual Time Entries (`/time-tracking/entries`)
- `GET /time-tracking/entries`
  - Purpose: Get personal or project time entries.
  - Query: `?startDate=2026-11-01&endDate=2026-11-30&projectId=...`
- `POST /time-tracking/entries`
  - Purpose: Log completed work session manually.
  - Body: `{ taskId, date, durationMinutes, isBillable, notes? }`
- `DELETE /time-tracking/entries/:id`
  - Purpose: Delete erroneous log entry.

---

### Group 18: Productivity Reports & Aggregations (`/reports`)
- `GET /reports/velocity`
  - Purpose: Completed story points per sprint (Pro/Business tier).
- `GET /reports/time-distribution`
  - Purpose: Donut chart data of billable vs non-billable hours across projects.
- `GET /reports/team-workload`
  - Purpose: Member hours breakdown and task throughput.

---

### Group 19: Subscription Plans (`/subscriptions/plans`)
- `GET /subscriptions/plans`
  - Purpose: List available plans (`Free`, `Pro`, `Business`), prices, and quotas.
  - Auth: Public / Authenticated.

---

### Group 20: Organization Subscription Management (`/organizations/current/subscription`)
- `GET /organizations/current/subscription`
  - Purpose: Get active plan, renewal date, and seat usage.
- `GET /organizations/current/subscription/downgrade-preview`
  - Purpose: Preview impact of downgrading (excess projects and members).
- `POST /organizations/current/subscription/downgrade`
  - Purpose: Execute graceful downgrade to Free tier.
  - Auth: `Org Owner` strictly.
  - Body: `{ targetPlan: "free", activeProjectIds: [id1, id2, id3] }`

---

### Group 21: Simulated Payments (`/organizations/current/billing/simulate`)
- `POST /organizations/current/billing/simulate-checkout`
  - Purpose: Execute simulated upgrade or renewal transaction.
  - Auth: `Org Owner` strictly.
  - Body: `{ planKey: "pro"|"business", seatCount: number, testOutcome: "success"|"failure" }`
  - Response: `200 OK` `{ transactionId, status: "simulated_success", invoiceUrl }`.
- `GET /organizations/current/billing/invoices`
  - Purpose: List historical simulated invoices and receipts.

---

### Group 22: Super Admin Platform Operations (`/admin-portal`)
- `GET /admin-portal/telemetry`
  - Purpose: Platform-wide telemetry (Total orgs, active users, simulated MRR).
  - Auth: Super Admin strictly (`isSuperAdmin: true`).
- `GET /admin-portal/tenants`
  - Purpose: Searchable list of all organizations.
- `POST /admin-portal/tenants/:orgId/suspend`
  - Purpose: Suspend organization; terminates WebSocket connections and token sessions.
- `POST /admin-portal/tenants/:orgId/reactivate`
  - Purpose: Restore suspended organization to active state.
