# TaskFlow Development Roadmap & Epics / User Stories Breakdown

- **Document Version**: v1.0 (Approved Baseline)
- **Status**: Approved & Baseline Locked
- **Date**: 2026-11-18
- **Project Directory**: `_bmad-output/planning-artifacts/roadmap`

---

## 1. Milestone Architecture

TaskFlow development is structured into three progressive milestones to ensure stable foundations before introducing real-time complexity:

```
[Milestone 1: Core SaaS MVP] (Weeks 1-4)
  ├── Epic 1: Foundation, Auth & Multi-Tenant Workspace Infrastructure
  └── Epic 2: Project Management, Task Hierarchy & LexoRank Kanban Engine

[Milestone 2: Real-Time Collaboration & Time Tracking] (Weeks 5-8)
  ├── Epic 3: Real-Time Engine, Socket.IO Sync & Contextual Comments
  └── Epic 4: Native Time Tracking (Active Stopwatch + Manual Logs) & Calendar

[Milestone 3: Advanced Governance & Commercial Simulation] (Weeks 9-12)
  ├── Epic 5: Subscription Lifecycle, Quotas & Simulated Payments
  └── Epic 6: Productivity Reports, Audit Logs & Super Admin Control Plane
```

---

## 2. Epics & User Stories Breakdown (24 Actionable Stories)

---

### Epic 1: Foundation, Multi-Tenant Infrastructure & Authentication

#### Story 1.1: Global User Registration & Dual-Token Authentication
- **User Role**: Public / Unauthenticated User
- **Description**: As a new user, I want to create an account with email and password so that I can authenticate across the platform with secure session management.
- **Acceptance Criteria**:
  - Validates email format, full name, and password complexity via Zod schema.
  - Password hashed with bcrypt (cost factor 12).
  - Returns 15-minute JWT access token in JSON body; sets 7-day refresh token in `HttpOnly; Secure; SameSite=Strict` cookie.
  - Silent token refresh endpoint (`POST /auth/refresh`) rotates refresh tokens on demand.
- **Dependencies**: None.
- **Testing**: Supertest integration tests verifying valid registration, duplicate email rejection (`409 Conflict`), and silent refresh rotation.

#### Story 1.2: Multi-Tenant Workspace Provisioning & Context Switching
- **User Role**: Authenticated User
- **Description**: As an authenticated user, I want to create an organization workspace and switch between multiple organizations so that my data is cleanly isolated.
- **Acceptance Criteria**:
  - `POST /organizations` creates `Organization`, sets creator as `Org Owner`, and seeds default project.
  - Organization switcher dropdown in top navbar updates `x-organization-id` header in Axios client and Zustand store.
  - Backend middleware enforces `{ organizationId: req.org._id }` on all tenant routes.
- **Dependencies**: Story 1.1.
- **Testing**: Supertest multi-tenant isolation tests verifying User A cannot access Organization B data.

#### Story 1.3: Organization Member Invitations & Dual-Tier RBAC
- **User Role**: Organization Owner / Admin
- **Description**: As an Org Owner, I want to invite team members with specific organization roles so that I can govern workspace access.
- **Acceptance Criteria**:
  - `POST /invitations` generates signed token with 72h TTL; enforces member quota limits.
  - `POST /invitations/accept` binds user to organization with specified role (`Admin`, `Member`, `Guest`).
  - Tier 1 authorization middleware guards administrative routes.
- **Dependencies**: Story 1.2.
- **Testing**: Integration tests for invitation lifecycle and role-based route blocking.

#### Story 1.4: Global Shell Layout & Responsive Navigation
- **User Role**: Authenticated Member
- **Description**: As a user, I want a consistent, responsive layout with collapsible sidebar, breadcrumbs, and command palette so that I can navigate efficiently.
- **Acceptance Criteria**:
  - Implements top navbar, collapsible sidebar, and dynamic content viewport using Tailwind CSS + shadcn/ui.
  - `Ctrl+K` / `Cmd+K` command palette opens accessible search modal respecting user permissions.
  - Sidebar collapses to 64px on tablet and hamburger overlay on mobile.
- **Dependencies**: Story 1.2.
- **Testing**: Vitest component tests and Playwright responsive viewport tests.

---

### Epic 2: Project Workflows, Task Hierarchy & LexoRank Kanban Engine

#### Story 2.1: Project Hub, Settings & Quota Guard
- **User Role**: Project Manager / Org Admin
- **Description**: As a project manager, I want to create projects and configure workflow columns so that our team can organize sprints.
- **Acceptance Criteria**:
  - `POST /projects` creates project; rejects creation if organization is on Free plan and has 3 active projects (`402 Payment Required`).
  - Project Settings allows editing workflow columns and assigning project members with Tier 2 roles.
- **Dependencies**: Story 1.2.
- **Testing**: Supertest quota validation tests and soft-delete tests.

#### Story 2.2: Task Creation, Metadata & Rich-Text Description
- **User Role**: Project Member
- **Description**: As a team member, I want to create tasks with priorities, assignees, due dates, and rich descriptions so that work items are well-defined.
- **Acceptance Criteria**:
  - Tasks generate sequential human-readable IDs (e.g. `ACME-102`).
  - Supports Priority (`Low`, `Medium`, `High`, `Urgent`), Story Points, Due Date, and Markdown description.
- **Dependencies**: Story 2.1.
- **Testing**: Mongoose schema tests verifying validation constraints and indexes.

#### Story 2.3: Slide-Over Task Details Drawer & URL Deep-Linking
- **User Role**: Project Member / Guest
- **Description**: As a user, I want to open task details in a slide-over drawer with URL synchronization so that I can share links without losing board context.
- **Acceptance Criteria**:
  - Clicking any task appends `?task=TASK-ID` to URL; supports browser back/forward history.
  - Expands to 640px on desktop and 100% full-screen on mobile viewports.
  - Prompts confirmation dialog if user attempts to close drawer with unsaved edits.
- **Dependencies**: Story 2.2.
- **Testing**: Playwright tests verifying query parameter sync and dirty-check alert.

#### Story 2.4: Interactive Kanban Board & LexoRank Reordering
- **User Role**: Project Member / Team Lead
- **Description**: As a team member, I want to drag and drop cards across columns so that I can update task workflow stages with fractional order precision.
- **Acceptance Criteria**:
  - Dragging card calculates LexoRank string midpoint; updates exactly 1 document in MongoDB via `PATCH /tasks/:id/reorder`.
  - Employs optimistic concurrency locking (`version` field) to prevent race conditions.
  - Dragging is disabled for users with `Guest / Viewer` role.
- **Dependencies**: Story 2.3.
- **Testing**: Vitest unit tests for LexoRank algorithm and Supertest concurrent movement tests.

---

### Epic 3: Real-Time Engine, Socket.IO & Contextual Collaboration

#### Story 3.1: Authenticated Socket.IO Gateway & Room Hierarchy
- **User Role**: System Infrastructure
- **Description**: As a system service, I want to authenticate WebSocket connections and manage room subscriptions so that real-time events are securely routed.
- **Acceptance Criteria**:
  - Socket.IO connection authenticates via JWT; rejects invalid sessions.
  - Manages room subscriptions: `org:<id>`, `project:<id>`, `task:<id>`.
  - Reconciles incoming events directly with frontend TanStack Query caches.
- **Dependencies**: Story 1.1, Story 2.1.
- **Testing**: Integration tests verifying connection auth and room join/leave authorization.

#### Story 3.2: Real-Time Kanban Card Movement & Multi-User Sync
- **User Role**: Project Member
- **Description**: As a developer, I want to see cards move in real-time when another member moves them on the Kanban board so that team state is always synchronized.
- **Acceptance Criteria**:
  - `card:moved` event broadcast to `project:<projectId>`.
  - Connected clients smoothly transition card position in < 100ms without page reload.
- **Dependencies**: Story 2.4, Story 3.1.
- **Testing**: Multi-browser Playwright E2E test verifying card movement propagation.

#### Story 3.3: Task Comments & Privacy Filtering (`isInternal: true`)
- **User Role**: Team Lead / Project Member / Guest
- **Description**: As a team member, I want to post public comments or toggle internal team notes so that sensitive discussions are hidden from client guests.
- **Acceptance Criteria**:
  - `POST /tasks/:id/comments` saves comment with `isInternal: boolean` flag.
  - Backend serialization layer automatically strips internal comments for users with `Org Guest` or `Project Viewer` roles.
  - Internal comments render with distinct amber styling and badge for authorized members.
- **Dependencies**: Story 2.3, Story 3.1.
- **Testing**: Supertest security tests verifying zero leak of internal notes to guest tokens.

#### Story 3.4: Cloudinary Secure File Attachments
- **User Role**: Project Member
- **Description**: As a member, I want to attach project files to tasks via secure direct upload so that specs and assets are easily accessible.
- **Acceptance Criteria**:
  - Frontend obtains signed upload parameters via `POST /attachments/signature`; uploads directly to Cloudinary.
  - File upload action completely hidden and forbidden for Guests.
  - MIME whitelist strictly enforces image/document types; rejects executables.
- **Dependencies**: Story 2.3.
- **Testing**: Integration tests verifying signature generation and file registration.

---

### Epic 4: Native Time Tracking, Stopwatch & Schedule Management

#### Story 4.1: Top Navbar Active Stopwatch Widget & Concurrency Lock
- **User Role**: Team Member
- **Description**: As an engineer, I want an active stopwatch timer in the top bar so that I can track work accurately without manual guesswork.
- **Acceptance Criteria**:
  - Starting timer on Task B automatically commits and stops running timer on Task A.
  - Unique database index on `ActiveTimers.userId` enforces strictly one running timer per user.
  - Topbar widget displays live `HH:MM:SS` duration, task title, and one-click stop action.
- **Dependencies**: Story 1.4, Story 2.2.
- **Testing**: Supertest concurrent timer locking tests and Zustand timer store unit tests.

#### Story 4.2: Manual Time Logging & Timesheets Matrix
- **User Role**: Team Member
- **Description**: As a member, I want to manually log work hours and review my weekly timesheets so that all project contributions are recorded.
- **Acceptance Criteria**:
  - Modal form allows logging duration, date, task association, billable toggle, and notes.
  - Prevents invalid future dates and negative durations.
  - Timesheet screen (`/timesheets`) displays weekly Mon-Sun hour bar chart against 40h target.
- **Dependencies**: Story 4.1.
- **Testing**: Vitest form validation tests and aggregation query tests.

#### Story 4.3: Task Dependencies & Timeline / Gantt View
- **User Role**: Project Manager (Pro / Business Tier)
- **Description**: As a project manager, I want to link predecessor tasks and view interactive Gantt charts so that I can manage critical path schedules.
- **Acceptance Criteria**:
  - `POST /tasks/:id/dependencies` validates DAG cycle detection; rejects circular loops.
  - SVG Gantt timeline connects tasks with dependency lines; dragging duration bars updates schedules.
  - Free tier organizations see preview card with upgrade CTA.
- **Dependencies**: Story 2.2.
- **Testing**: Vitest unit tests for graph cycle detection and UI upgrade modal tests.

#### Story 4.4: Project & Organization Calendar View
- **User Role**: Project Member (Pro / Business Tier)
- **Description**: As a member, I want to view task due dates and milestones on a monthly calendar grid so that I can track upcoming deadlines.
- **Acceptance Criteria**:
  - Displays monthly and weekly calendar grids populated with color-coded task pills.
  - Clicking a date opens "Quick Create Task"; clicking a pill opens task details drawer.
- **Dependencies**: Story 2.2.
- **Testing**: Component tests for calendar day grid and event rendering.

---

### Epic 5: Subscription Lifecycle, Quotas & Simulated Payments

#### Story 5.1: Plan Quota Middleware & UI Progress Indicator
- **User Role**: Org Admin / Member
- **Description**: As an administrator, I want to monitor resource consumption against plan limits so that our team knows when to upgrade.
- **Acceptance Criteria**:
  - Sidebar footer displays numeric and progress bar indicators (`Projects: X/Y`, `Members: X/Y`).
  - Bar turns amber at >= 80% and red at 100% capacity.
  - Backend middleware blocks excess project creation or invitations with `402 Payment Required`.
- **Dependencies**: Story 1.4, Story 2.1.
- **Testing**: Supertest quota rejection tests and UI threshold color tests.

#### Story 5.2: Simulated Payment Gateway & Plan Upgrade Checkout
- **User Role**: Organization Owner
- **Description**: As an Org Owner, I want to simulate upgrading our workspace plan using test credit cards so that advanced features are unlocked safely.
- **Acceptance Criteria**:
  - Checkout modal accepts test card numbers (e.g. `...4242` for success, `...0002` for decline).
  - Upgrading to Pro or Business executes in a MongoDB transaction, updates subscription state, and generates simulated invoice PDF metadata.
  - Broadcasts Socket.IO event immediately unlocking Pro features for all active workspace sessions.
  - Persistent UI watermarks clearly state simulation environment.
- **Dependencies**: Story 5.1.
- **Testing**: Integration tests verifying simulated checkout outcomes and role restriction (Owner only).

#### Story 5.3: Graceful Subscription Downgrade & Read-Only Archival
- **User Role**: Organization Owner
- **Description**: As an Org Owner, I want to downgrade our plan gracefully so that excess projects become read-only and no historical data is destroyed.
- **Acceptance Criteria**:
  - Downgrade preview modal lists excess projects and members.
  - Owner selects exactly 3 projects to remain active; remaining projects transition to `status: "archived_read_only"`.
  - Excess members beyond 5 transition to `status: "inactive"`, preserving all historical time logs and comment attribution.
- **Dependencies**: Story 5.2.
- **Testing**: Supertest multi-document transaction tests verifying archival status and data preservation.

#### Story 5.4: Simulated Invoices & Billing History
- **User Role**: Organization Owner / Admin
- **Description**: As an administrator, I want to review past simulated billing transactions and download receipts so that we can track expenses.
- **Acceptance Criteria**:
  - Displays searchable table of historical simulated transactions (`Paid`, `Pending`, `Failed`).
  - "Download Receipt" generates printable simulated PDF invoice with disclaimer watermark.
- **Dependencies**: Story 5.2.
- **Testing**: Component tests for invoice table and PDF rendering.

---

### Epic 6: Productivity Reports, Governance & Super Admin Control Plane

#### Story 6.1: Team Velocity & Time Allocation Reporting
- **User Role**: Project Manager / Org Admin (Pro / Business Tier)
- **Description**: As a manager, I want to inspect sprint velocity and billable vs non-billable time allocations so that I can optimize team productivity.
- **Acceptance Criteria**:
  - Generates velocity burndown bar chart and time distribution donut chart via MongoDB aggregation pipelines.
  - Redacts billable hourly rates for users without billing permissions.
  - Supports CSV export and PDF executive summary download.
- **Dependencies**: Story 4.2.
- **Testing**: MongoDB aggregation pipeline unit tests with sample timesheet datasets.

#### Story 6.2: Custom Roles & Granular Permission Management
- **User Role**: Organization Owner (Business Tier)
- **Description**: As an enterprise owner, I want to create custom roles with tailored permission sets so that our organizational governance is strictly defined.
- **Acceptance Criteria**:
  - Interface allows creating custom roles and selecting granular permission checkboxes.
  - Assigned custom roles enforce permissions across Tier 1 and Tier 2 middleware.
  - Gated strictly by Business plan tier.
- **Dependencies**: Story 1.3, Story 5.2.
- **Testing**: Integration tests verifying dynamic custom role permission evaluation.

#### Story 6.3: Workspace Audit Logging Engine
- **User Role**: Organization Owner / Admin (Business Tier)
- **Description**: As an administrator, I want an immutable audit log of sensitive events so that our organization maintains compliance visibility.
- **Acceptance Criteria**:
  - Automatically records audit events for member role changes, invitations, billing upgrades, project deletions, and ownership transfers.
  - Audit log table supports filtering by user, date range, and action type; exportable to CSV.
- **Dependencies**: Story 1.3, Story 5.2.
- **Testing**: Supertest audit interception tests verifying records cannot be modified or deleted via API.

#### Story 6.4: Super Admin Control Plane & Tenant Lifecycle
- **User Role**: Super Admin (`isSuperAdmin: true`)
- **Description**: As a platform operator, I want a dedicated control plane to monitor tenant telemetry, manage global plan tiers, and suspend accounts so that the SaaS platform is properly governed.
- **Acceptance Criteria**:
  - Accessible strictly at `/admin-portal` with dark theme and amber operational banner.
  - Displays platform telemetry (Total Tenants, Active Users, Simulated MRR).
  - "Suspend Organization" action terminates active tenant WebSocket connections, revokes refresh tokens, and blocks subsequent API requests with HTTP `403 Forbidden` (`TENANT_SUSPENDED`).
- **Dependencies**: Story 1.1, Story 1.2.
- **Testing**: Security integration tests verifying non-super-admins cannot access `/admin-portal` and suspended tenants are completely locked out.
