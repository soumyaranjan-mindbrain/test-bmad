# TaskFlow UI/UX Design System & Global Layout Architecture

- **Document Version**: v1.0 (Approved Baseline)
- **Status**: Approved & Baseline Locked
- **Date**: 2026-11-18
- **Project Directory**: `_bmad-output/planning-artifacts/ux`

---

## 1. Visual Language, Tokens & Design System

TaskFlow implements an enterprise-grade, high-density, accessible UI framework influenced by Linear and GitHub Enterprise, leveraging **Tailwind CSS** and **shadcn/ui (Radix Primitives)** for full WCAG 2.1 AA compliance.

### 1.1 Color Tokens & Semantic Surfaces
- **Canvas & Surface Palette**:
  - `bg-canvas`: Light `#F8FAFC` (Slate-50) | Dark `#0B0F17` (Deep Obsidian)
  - `bg-surface`: Light `#FFFFFF` | Dark `#111827` (Gray-900)
  - `bg-subtle`: Light `#F1F5F9` (Slate-100) | Dark `#1E293B` (Slate-800)
  - `border-default`: Light `#E2E8F0` (Slate-200) | Dark `#1F2937` (Gray-800)
  - `border-focus`: `#6366F1` (Indigo-500) with 2px offset
- **Brand Tokens**:
  - `brand-primary`: `#4F46E5` (Indigo-600) | Hover: `#4338CA` | Active: `#3730A3`
  - `brand-accent`: `#818CF8` (Indigo-400)
- **Functional & Priority States**:
  - `priority-low`: `#94A3B8` (Slate-400)
  - `priority-medium`: `#3B82F6` (Blue-500)
  - `priority-high`: `#F97316` (Orange-500)
  - `priority-urgent`: `#EF4444` (Red-500 with animated badge pulse)
- **Collaboration Tokens**:
  - `note-internal-bg`: `#FEF3C7` (Amber-50) | Border: `#FCD34D` | Text: `#92400E`
  - `timer-active-bg`: `#ECFDF5` (Emerald-50) | Border: `#10B981` | Text: `#065F46`
  - `quota-warning`: `#F59E0B` (Amber-500, triggered at >= 80% quota)
  - `quota-danger`: `#EF4444` (Red-500, triggered at 100% quota)

### 1.2 Typography & Spacing Scale
- **Font Stack**:
  - Primary UI: `Inter`, `Geist Sans`, `-apple-system`, `sans-serif`
  - Code, IDs, Timers: `JetBrains Mono`, `ui-monospace`, `monospace`
- **Scale**:
  - `text-xs` (12px, 16px line): Metadata, badges, timestamps, tags.
  - `text-sm` (14px, 20px line): Body, table rows, form inputs, card descriptions.
  - `text-base` (16px, 24px line): Modals headers, emphasized card titles.
  - `text-lg` (18px, 28px line): Section headers, drawer titles.
  - `text-2xl` (24px, 32px line): Top-level dashboard page titles.
- **Spacing Grid**: Standard 4px grid (`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px).

---

## 2. Navigation Architecture & Global Shell

### 2.1 Three-Shell Architecture
1. **Public Marketing Shell** (`/`, `/pricing`, `/about`):
   - Centered marketing header, clean CTA buttons, responsive mobile drawer menu.
2. **Authenticated SaaS Tenant Shell** (`/dashboard`, `/projects/*`, `/team`, `/settings/*`):
   - Collapsible desktop sidebar (240px expanded &rarr; 64px collapsed icon rail).
   - Sticky top navigation bar (56px height) persistent across all views.
   - Dynamic viewport-scrollable content area with standard breadcrumbs.
3. **Super Admin Control Plane Shell** (`/admin-portal/*`):
   - Distinct dark styling with a persistent top amber security banner ("PLATFORM SUPER ADMIN MODE").

```
+----------------------------------------------------------------------------------------------------+
|  TOP NAVBAR: [🏢 Acme Corp v] [🔍 Search Ctrl+K / Cmd+K] [⏱️ TASK-42 01:24:12 ■] [🔔 3] [Avatar v] |
+----------------------------------------------------------------------------------------------------+
| SIDEBAR                 | BREADCRUMBS: Acme Corp > Projects > Mobile App > Kanban                  |
| Overview                | PAGE HEADER: Mobile App v1.0   [Kanban | List | Gantt | Cal]  [+ Task]   |
|   Dashboard             +--------------------------------------------------------------------------+
|   My Work (4)           | WORKSPACE CONTENT AREA                                                   |
| Work Management         |                                                                          |
| v Projects              | [To Do (3)]           [In Progress (2)]       [Review]     [Done]        |
|   • Mobile App          | +------------------+  +-------------------+   +----------+ +-----------+ |
|   • Core Backend        | | TASK-101         |  | TASK-104          |   | ...      | | ...       | |
|   • Marketing Site      | | Auth middleware  |  | Socket sync       |   |          | |           | |
|   Timeline / Gantt [🔒] | | [Dev] [P1] 2h    |  | [Dev] [P2] 4h     |   |          | |           | |
|   Calendar              | +------------------+  +-------------------+   +----------+ +-----------+ |
| Tracking & Team         |                                                                          |
|   Timesheets            |                                                                          |
|   Reports               |                                                                          |
|   Team Directory        |                                                                          |
| ----------------------- |                                                                          |
| [Quota: Proj 2/3 (66%)] |                                                                          |
| [Org Settings]          |                                                                          |
+----------------------------------------------------------------------------------------------------+
```

### 2.2 Global Top Navigation Bar Specifications
- **Workspace Switcher**:
  - Displays current organization name, logo, and plan tag (`[Free]`, `[Pro]`, `[Business]`).
  - Dropdown lists all organizations the user belongs to, with active indicator and "Create New Workspace" modal trigger.
- **Global Command Palette (`Ctrl+K` / `Cmd+K`)**:
  - Accessible from any screen; closes on `Escape`.
  - Keyboard-navigable autocomplete with arrow keys and `Enter`.
  - Sections:
    1. *Quick Actions*: "Create Task", "Start Stopwatch Timer", "Invite Member".
    2. *Recent Tasks & Projects*: Fast links to the user's last 5 opened tasks.
    3. *Global Search*: Queries tasks, projects, and members via backend search.
  - **Strict Permission Filtering**: Never surfaces projects, tasks, or actions that the user's Tier 1/Tier 2 roles do not permit.
- **Active Stopwatch Widget**:
  - Real-time indicator displaying active Task ID, task title snippet, and live ticking clock (`HH:MM:SS`).
  - Stop button triggers instantaneous commit to a `TimeEntry` record.
  - Dropdown allows pausing or switching active task without opening timesheet screen.
- **Notification Popover**:
  - Live count badge updated via Socket.IO `notification:new`.
  - Categorized tabs: `All`, `Unread`, `Mentions`, `Assignments`.
  - Clicking a notification marks it read and directly opens the associated task drawer.
- **User Profile Menu**:
  - Displays Avatar, Name, Email, and presence badge (Green = Online).
  - Links: `Profile & Credentials`, `Notification Preferences`, `Theme Toggle` (Light/Dark/System), `Sign Out`.

### 2.3 Collapsible Sidebar & Plan Quota Footer
- **Navigation Groups**:
  - *Overview*: Dashboard (routes to role-specific dashboard), My Work (personal tasks & quick timer).
  - *Work Management*: Projects list (collapsible tree), Timeline/Gantt (locked with crown icon on Free tier), Calendar.
  - *Tracking*: Timesheets & Timers (hidden from Guests), Productivity Reports (Pro/Business).
  - *Administration*: Team Directory, Audit Logs (Business only), Organization Settings.
- **Sidebar Footer & Quota Monitoring**:
  - **Visual Indicator**: Dual progress bars showing `Projects: X / Y` and `Members: X / Y`.
  - **Threshold Styling**:
    - `< 80%`: Neutral slate progress bar.
    - `80% - 99%`: Amber warning progress bar with tooltip ("Approaching plan capacity").
    - `100%`: Red alert bar with tooltip ("Quota reached. New creations blocked").
  - **Role-Based Visibility**:
    - `Org Owner` & `Org Admin`: Sees progress bar and actionable "Upgrade Plan" button.
    - `Team Member` & `Guest`: Sees non-interactive summary or hidden entirely.
  - **Mobile Adaptation**: On mobile viewports, the quota indicator is removed from the collapsed drawer and presented inside the Organization Settings page.

---

## 3. Screen-by-Screen UX Specifications (20 Primary Screens)

### Screen 1: Public Marketing & Landing Page
- **Route**: `/`
- **Allowed Roles**: Public / Unauthenticated
- **Purpose**: Showcase TaskFlow value proposition, interactive Kanban demo, and tier pricing comparison.
- **Layout**: Clean marketing shell, sticky header with brand logo, nav links (`Features`, `Solutions`, `Pricing`), and CTAs (`Sign In`, `Get Started Free`).
- **Key Sections**:
  - Hero banner with headline, CTA, and interactive live card-dragging preview.
  - Core feature grid: Adaptive Views, Native Time Tracking, Real-time Collaboration, Enterprise Multi-Tenancy.
  - Interactive Pricing Matrix: Monthly/Annual toggle comparing Free ($0), Pro ($12), and Business ($25) plans with detailed feature checklists.
  - Footer with documentation links and legal notices.

---

### Screen 2: User Registration & Authentication Suite
- **Route**: `/register`, `/login`, `/forgot-password`, `/reset-password`
- **Allowed Roles**: Public / Unauthenticated
- **Purpose**: Secure credential collection and session initialization.
- **Layout**: Centered minimal card (400px width) with brand mark.
- **Components**:
  - Email and password inputs with client-side Zod validation.
  - Real-time password complexity checklist (Min 8 chars, 1 uppercase, 1 number, 1 symbol).
  - "Remember this device for 30 days" checkbox (controls refresh token cookie persistence).
  - Simulated Single Sign-On (SSO) buttons: "Continue with Google", "Continue with GitHub".
- **States**:
  - *Loading*: Button enters disabled state with spinner.
  - *Error*: Inline field validation red borders + global alert banner for invalid credentials or locked account.

---

### Screen 3: Organization Onboarding & Creation Wizard
- **Route**: `/onboarding/create-org`
- **Allowed Roles**: Authenticated users without an organization or creating a new workspace.
- **Purpose**: Fast, guided workspace provisioning.
- **Layout**: 3-step progressive wizard stepper with progress bar.
- **Steps**:
  1. *Workspace Basics*: Organization Name, Auto-generated Workspace URL slug (`app.taskflow.com/[slug]`), optional logo upload.
  2. *Plan Selection*: Choose initial tier (`Free` or `14-Day Pro Simulation Trial`).
  3. *Invite Initial Collaborators*: Email input pills with initial role dropdown (`Admin`, `Member`, `Guest`).
- **Success Transition**: Provisions organization, assigns creator as `Org Owner`, seeds default project, and redirects to `/dashboard`.

---

### Screen 4: Super Admin Platform Control Plane
- **Route**: `/admin-portal/dashboard`
- **Allowed Roles**: Super Admin only (`isSuperAdmin: true`)
- **Purpose**: System-wide telemetry, multi-tenant directory, tenant lifecycle management, and global plan administration.
- **Layout**: Segregated dark theme shell with top amber warning banner.
- **Components**:
  - *System KPI Cards*: Total Active Tenants, Global User Count, Simulated Monthly Recurring Revenue (MRR), System Error Rate.
  - *Tenant Management Table*: Searchable table displaying Organization Name, Slug, Plan Tier, Owner Email, Member Count, Created Date, Status (`Active` / `Suspended`).
  - *Tenant Actions*:
    - "Inspect Tenant": View read-only usage metrics.
    - "Suspend Tenant": Modal requiring reason input; immediately terminates active tenant sessions and marks organization suspended.
    - "Reactivate Tenant": Restores full tenant operations.
  - *Global Plan Configuration*: Form to adjust plan quotas (e.g. Free max projects, max members) applied platform-wide.

---

### Screen 5: Organization Admin & Owner Dashboard
- **Route**: `/dashboard` (Role-specific view for Org Owner / Org Admin)
- **Allowed Roles**: Org Owner, Org Admin
- **Purpose**: High-level organizational oversight of project velocity, capacity utilization, and billing status.
- **Components**:
  - *Top Metric Cards*: Active Projects (with quota indicator `2/3`), Total Tasks in Flight, Team Hours Logged This Week, Overdue Milestones.
  - *Velocity & Burnup Chart*: Weekly completed story points across the entire organization.
  - *Project Portfolio Health Grid*: Cards for each active project showing progress bar, assigned team member avatars, and health badge (`On Track` green, `At Risk` amber, `Delayed` red).
  - *Organization Audit Feed*: Stream of administrative events (invitations, role updates, plan changes).

---

### Screen 6: Member Dashboard ("My Work")
- **Route**: `/my-work` (Default landing for Project Managers, Team Leads, and Team Members)
- **Allowed Roles**: All Organization Members
- **Purpose**: Distraction-free personal command center focusing exclusively on work assigned to the user.
- **Components**:
  - *Personal Summary Ribbon*: Tasks Due Today, High Priority Tasks, Hours Logged Today.
  - *Tabbed Task View*:
    - `Assigned to Me`: Sorted by priority and due date.
    - `Created by Me`: Tasks awaiting review or in progress by others.
    - `Reviewing`: Code or design deliverables waiting on user feedback.
  - *Quick Timer Resume Card*: One-click action to resume active timer on recently worked tasks.
  - *Weekly Schedule Strip*: 7-day horizontal deadline visualizer.

---

### Screen 7: Project Hub & Project Settings
- **Route**: `/projects`, `/projects/:projectId/settings`
- **Allowed Roles**: All members viewable; Settings restricted to Project Manager, Org Admin, and Org Owner.
- **Purpose**: Workspace project directory and project configuration.
- **Components**:
  - *Project Directory Table / Grid*: Search bar, filter by category/lead, cards displaying project title, description, team size, task completion bar, and status badge.
  - *"New Project" Modal*: Title, description, project lead picker, initial members, and target delivery date.
    - *Quota Guard*: If organization is on Free tier with 3 projects, modal triggers an inline alert with "Upgrade to Pro to create unlimited projects".
  - *Project Settings Drawer*:
    - General: Title, key identifier (e.g. `TASK`), description.
    - Workflow Columns: Add/remove/reorder Kanban workflow columns and set Work In Progress (WIP) limits.
    - Member Access List: Add/remove project members and assign project-level roles (`PM`, `Team Lead`, `Member`, `Viewer`).
    - Danger Zone: "Archive Project" (makes project read-only) and "Delete Project" (soft-delete with 30-day recovery window).

---

### Screen 8: Task Management List View
- **Route**: `/projects/:projectId/list`
- **Allowed Roles**: All project members and assigned Guests.
- **Purpose**: High-density spreadsheet-style work management for bulk triage and rapid filtering.
- **Components**:
  - *Filter & Grouping Bar*: Text search, Assignee multi-select, Priority filter, Status filter, Due Date range picker, and Group By selector (`Status`, `Assignee`, `Priority`).
  - *Data Table*:
    - Columns: Checkbox, Task ID (`TASK-102`), Status dropdown, Title, Priority icon, Assignee avatar, Due Date, Story Points, Logged Time.
    - Inline Editing: Single-click editing on priority, status, and due date.
    - Title Click: Opens Task Details Drawer (`?task=TASK-102`).
  - *Bulk Action Floating Bar*: Appears when multiple checkboxes are active (Bulk Status Change, Bulk Assign, Bulk Delete).

---

### Screen 9: Interactive Kanban Board
- **Route**: `/projects/:projectId/kanban`
- **Allowed Roles**: All project members (Full interaction); Guests (View only).
- **Purpose**: Visual workflow pipeline with real-time drag-and-drop card movements.
- **Components**:
  - *Kanban Columns*: Configurable workflow stages (`Backlog`, `To Do`, `In Progress`, `Review`, `Done`) with WIP limit indicators (`3/5`).
  - *Task Cards*:
    - Header: Task ID (`TASK-104`), Priority badge (`Urgent` = red pulse).
    - Body: Task title, tags/labels.
    - Footer: Subtask ratio (`3/5`), Attachment count icon, Comment count icon, Assignee avatar, Logged time indicator.
  - *Drag-and-Drop Engine*:
    - Utilizes HTML5 drag-and-drop or pointer sensors.
    - Re-indexing calculates fractional LexoRank midpoint.
    - Emits atomic Socket.IO `card:moved` event.
    - Optimistic UI update instantly renders new position; rolls back with toast notification if server rejects.
  - *Guest Mode*: Drag handles disabled; cards are read-only triggers for the task details drawer.

---

### Screen 10: Project & Team Calendar
- **Route**: `/projects/:projectId/calendar` and `/calendar`
- **Allowed Roles**: All members (Gated by Pro/Business plan; Free tier displays preview card).
- **Purpose**: Schedule visualization of milestones, sprints, and task deadlines across monthly and weekly views.
- **Components**:
  - *View Switcher*: Month grid, Week view, Day agenda.
  - *Calendar Grid*: Days populated with colored task pills matching project color and priority tag.
  - *Interactions*:
    - Click date cell: Opens "Quick Create Task" modal pre-filled with selected due date.
    - Click task pill: Opens Task Details Drawer (`?task=ID`).
    - Drag task pill: Moves due date; triggers atomic update and Socket.IO broadcast.

---

### Screen 11: Timeline & Interactive Gantt View
- **Route**: `/projects/:projectId/timeline`
- **Allowed Roles**: Project members (Gated by Pro/Business plan; Free tier displays upgrade preview).
- **Purpose**: Dependency mapping, critical path tracking, and milestone planning.
- **Components**:
  - *Split Pane Layout*:
    - Left Panel (Resizable): Task hierarchy table (ID, Title, Start Date, End Date).
    - Right Panel (Timeline Grid): Time axis (Days / Weeks / Months) with horizontal duration bars.
  - *Interactive Dependency Connectors*:
    - SVG bezier curves connecting predecessor end-points to successor start-points.
    - Dragging connection handle from Task A to Task B creates a `finish-to-start` dependency.
    - **Circular Dependency Guard**: Real-time graph traversal rejects loops (e.g. A &rarr; B &rarr; C &rarr; A) with an immediate warning toast.

---

### Screen 12: Team & Member Directory
- **Route**: `/team`
- **Allowed Roles**: All members can view; Org Admins and Owners can invite, edit roles, and deactivate.
- **Purpose**: Organization roster management, invitation lifecycle, and role assignment.
- **Components**:
  - *Member Roster Table*: Avatar, Name, Email, Organization Role badge (`Owner`, `Admin`, `Member`, `Guest`), Project Assignments count, Last Active timestamp, Status (`Active` / `Deactivated`).
  - *"Invite Member" Modal*:
    - Email address input.
    - Role selector (`Org Admin`, `Org Member`, `Org Guest`).
    - Project assignment pre-selector.
    - *Quota Guard*: Validates against 5-member limit on Free plan; displays upgrade banner when full.
  - *Member Actions Menu*:
    - Change Role: Updates organization-level permissions.
    - Deactivate Member: Suspends member access while preserving historical task attributions and time logs.
    - Resend Invitation: Resends pending invitation link.

---

### Screen 13: Task Details Slide-Over Drawer
- **Route**: Accessible from Kanban, List, Calendar, Timeline, and Notifications via `?task=TASK-ID`
- **Allowed Roles**: All project members and assigned Guests.
- **Purpose**: Comprehensive deep-dive editing, subtasks, dependencies, file attachments, and discussion.
- **Architecture & Interaction**:
  - **Slide-Over Drawer**: 640px desktop width sliding from right; full-screen on mobile (`< 768px`).
  - **URL Synchronization**: Selected task ID stored in query parameter `?task=TASK-42`, enabling direct linking and browser back/forward navigation.
  - **Unsaved Changes Dirty Check**: If a user has uncommitted text in the description or comment editor and clicks the backdrop or close button, a confirmation dialog appears ("You have unsaved changes. Discard or keep editing?").
- **Layout**:
  - *Drawer Header*: Breadcrumb (`Project > Column`), Task ID badge, Copy Direct Link button, Close button (`Escape` shortcut).
  - *Left Content Column (65%)*:
    - Inline editable title (autosaves on blur).
    - Markdown rich-text description editor with preview toggle.
    - Subtask checklist with completion progress bar and reordering.
    - Dependencies list (Predecessors & Successors) with "Add Dependency" search picker.
    - File Attachments: File grid showing preview thumbnails, file size, download link. (Upload button hidden for Guests).
    - **Activity & Comments Feed**:
      - Comment composer supporting markdown, code blocks, and `@mention` auto-complete.
      - **"Internal Team Note" toggle checkbox** (Amber background styling; visible exclusively to team members).
      - Comment items: Author avatar, timestamp, edited indicator, delete/edit actions, and explicit `[Internal Note]` amber pill for internal items.
  - *Right Metadata Sidebar (35%)*:
    - Assignee picker with user presence indicators.
    - Status column selector.
    - Priority selector (`Low`, `Medium`, `High`, `Urgent`).
    - Due Date & Start Date picker.
    - Story points estimation input.
    - **Time Tracking Card**: Shows logged hours vs estimate, "Start Stopwatch Timer" button, and "Log Manual Time" trigger.
    - **Live Presence Avatars**: Shows icons of other members currently inspecting this task drawer.

---

### Screen 14: Centralized Notification Center
- **Route**: Dedicated page `/notifications` and top-navbar popover drawer.
- **Allowed Roles**: All authenticated users.
- **Purpose**: Triage of mentions, assignment changes, task status transitions, and system events.
- **Components**:
  - *Filter Tabs*: `All`, `Unread`, `Mentions`, `Assignments`.
  - *Toolbar*: "Mark All as Read", "Clear Read Notifications".
  - *Notification Items*:
    - Sender avatar, action snippet ("John assigned you to TASK-104"), project tag, relative timestamp ("10m ago").
    - Unread items visually highlighted with an indigo indicator dot.
  - *Action*: Clicking an item marks it read, closes the popover, and opens the task details drawer (`?task=ID`).

---

### Screen 15: Timesheets & Time Tracking Hub
- **Route**: `/timesheets`
- **Allowed Roles**: All members (Guests have no access; non-admins see only personal logs).
- **Purpose**: Personal time logging, active timer management, weekly timesheet review, and team hours inspection.
- **Components**:
  - *Active Stopwatch Card*: Live ticking timer with Pause, Stop, and Discard buttons.
  - *Weekly Timesheet Matrix*: Day-by-day bar chart (Mon - Sun) displaying daily logged hours against a 40-hour weekly target.
  - *"Log Manual Time" Modal*:
    - Task selector (searchable dropdown).
    - Date picker (defaults to today; future dates blocked).
    - Duration input (Hours and Minutes).
    - Billable toggle (`Billable` / `Non-Billable`).
    - Work description / notes.
  - *Time Entries Data Table*:
    - Columns: Date, Task ID, Task Title, Project, Duration, Billable badge, Hourly Rate (visible only to Org Owner/Admin), Actions (Edit, Delete).
    - Export button: "Download CSV".

---

### Screen 16: Productivity Reports & Analytics
- **Route**: `/reports`
- **Allowed Roles**: Org Owner, Org Admin, Project Manager (Gated by Pro/Business tier; Free shows upgrade preview).
- **Purpose**: Project velocity analytics, budget/time burn, and resource capacity reporting.
- **Components**:
  - *Report Filters*: Date range picker, Project selector, Team member filter.
  - *Velocity Chart*: Completed story points per sprint across time.
  - *Time Distribution Chart*: Donut chart illustrating Billable vs Non-Billable hours across projects.
  - *Team Workload Table*: Member Name, Assigned Tasks count, Completed Tasks, Total Logged Hours.
  - *Export Toolbar*: "Export CSV Data" and "Generate PDF Executive Summary".

---

### Screen 17: Subscription, Plans & Simulated Billing
- **Route**: `/settings/billing`
- **Allowed Roles**: Org Owner (Full administrative access); Org Admin (Read-only view); Members/Guests (Forbidden).
- **Purpose**: Plan management, quota tracking, simulated checkout, and simulated invoice review.
- **Components**:
  - *Plan Overview Card*: Active Plan badge (`Free`, `Pro`, `Business`), Renewal date, Seat count, Quota meters (`Projects: 2/3`, `Members: 4/5`).
  - *Plan Comparison Grid*: 3 cards detailing Free ($0), Pro ($12), and Business ($25) with "Current Plan" indicator and "Upgrade / Switch Plan" buttons.
  - *Simulated Checkout Modal*:
    - Simulated order summary (Seats x Monthly Price).
    - Simulated test card details with disclaimer ("SIMULATED TEST TRANSACTION - NO REAL CHARGE").
    - "Confirm Simulated Upgrade" action.
  - *Graceful Downgrade Modal*:
    - Warning alert detailing plan limit differences.
    - **Active Project Selector**: Org Owner selects exactly 3 projects to remain active; remaining projects are tagged `archived_read_only`.
    - **Member Impact Preview**: List of excess members who will be transitioned to `inactive` status.
  - *Simulated Invoices Table*:
    - Columns: Invoice ID, Billing Date, Amount, Status (`Paid` / `Pending`), Action ("Download Simulated Receipt PDF").

---

### Screen 18: Personal User Profile & Security Settings
- **Route**: `/settings/profile`
- **Allowed Roles**: All authenticated users.
- **Purpose**: Account management, security credentials, and personal preferences.
- **Components**:
  - *Profile Information*: Avatar upload, Full Name, Display Name, Bio.
  - *Security & Credentials*:
    - Password Change form (Current password, New password, Confirm password).
    - Active Sessions list (Browser, IP, Last Active date, "Revoke Session" action).
  - *Notification Settings*: Checkbox preferences for email and in-app alerts (Mentions, Due date reminders, Project updates).
  - *Appearance*: Theme switcher radio group (Light, Dark, System Default).

---

### Screen 19: Organization Settings & Workspace Administration
- **Route**: `/settings/organization`
- **Allowed Roles**: Org Owner (Full access); Org Admin (Restricted access, no delete/transfer).
- **Purpose**: Organization branding, default policies, custom roles, and workspace lifecycle.
- **Components**:
  - *General Details*: Organization Name, Workspace Slug (`taskflow.com/[slug]`), Logo upload.
  - *Security Policies*: Default role for invited members, Guest access permissions toggle.
  - *Custom Roles Tab (Business Plan Only)*:
    - Table of defined roles.
    - "Create Role" modal with granular permission checkboxes (Create Task, Edit Kanban, View Timesheets, etc.).
  - *Danger Zone (Org Owner Only)*:
    - "Transfer Organization Ownership" modal (selects new Owner from active Admin roster).
    - "Delete Workspace" modal with confirmation slug input and 30-day soft-delete grace period.

---

### Screen 20: System Error, Fallback & Quota Limit States
- **Route**: `/404`, `/403`, `/500`, `/maintenance`, Quota Banners
- **Allowed Roles**: Global / Public
- **Purpose**: Contextual fallback guidance, graceful error recovery, and connectivity indicators.
- **Components**:
  - *404 Not Found*: Friendly illustration, "The page or task you requested could not be found", "Return to Dashboard" button.
  - *403 Forbidden*: Clear boundary explanation ("You do not have permission to access this project"), "Request Access" button.
  - *500 Server Error*: "Something went wrong on our end. Our engineering team has been notified", "Reload Page" button.
  - *Plan Quota Exceeded Modal*: Triggered when an action hits a tier ceiling; displays current usage, explanation, and "Upgrade to Pro" primary CTA.
  - *Offline / Reconnection Floating Banner*:
    - Amber pill at top center: "Connection lost. Reconnecting to real-time sync...".
    - Transitions to green: "Connected" before fading out once Socket.IO handshake re-establishes.

---

## 4. Reusable Component Inventory (shadcn/ui Based)

| Component Name | Base Primitive | Use Cases across TaskFlow | Accessibility / Behavior |
| :--- | :--- | :--- | :--- |
| `TaskDetailsDrawer` | Radix Dialog / Sheet | Task inspection from any screen | URL sync, trap focus, dirty check on close |
| `CommandPalette` | `cmdk` | Global `Ctrl+K` search & quick actions | Keyboard navigation, ARIA combobox |
| `StopwatchWidget` | Custom + Radix Dropdown | Top navbar active timer | Live tick, ARIA live region |
| `KanbanColumn` | Custom Drag-and-Drop | Kanban board workflow stages | Droppable container, keyboard reorder ready |
| `TaskCard` | Radix Card | Task item in Kanban & boards | Draggable handle, focus ring, role labels |
| `DataTable` | TanStack Table | Task List, Timesheets, Team, Audit Logs | Sorting, filtering, row selection, pagination |
| `QuotaMeter` | Radix Progress | Sidebar footer & billing page | Dynamic color thresholds (80% amber, 100% red) |
| `SkeletonLoader` | Custom Pulse | Table, Card, and Drawer loading states | Matches target layout dimensions |
| `InternalCommentBadge` | Radix Badge | Highlight internal team discussion | Amber badge, distinct screen-reader text |
| `ConfirmModal` | Radix AlertDialog | Delete task, downgrade plan, discard edits | Destructive styling, focus on cancel button |

---

## 5. Responsive Layout Breakpoints

- **Desktop (`>= 1024px`)**:
  - Full expanded sidebar (240px).
  - Multi-column Kanban boards with horizontal scrolling.
  - Side-by-side Gantt split pane.
  - Slide-Over Drawer takes 640px right overlay.
- **Tablet (`768px - 1023px`)**:
  - Collapsed icon-only sidebar (64px).
  - Kanban columns scroll horizontally with sticky headers.
  - Slide-Over Drawer expands to 80% screen width.
  - Top command palette remains fully accessible.
- **Mobile (`< 768px`)**:
  - Sidebar collapses into a sliding hamburger overlay.
  - Top navigation bar compacts: Brand logo, search icon, stopwatch icon, avatar.
  - **Task Details Drawer expands to full screen (100% width)** with native-like top bar.
  - Quota indicator moves from sidebar to the Organization Settings page.
  - Kanban board defaults to a single-column swipeable tab view or List view.
