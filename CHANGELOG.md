# Changelog

All notable changes to the TaskFlow platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-18

### Added

#### Foundation, Auth & Multi-Tenancy (Milestone 1)
- User registration, login, and dual-token authentication (15-minute JWT access tokens + 7-day cryptographically hashed refresh tokens in HttpOnly cookies).
- Silent token refresh rotation via `POST /api/v1/auth/refresh`.
- Multi-tenant workspace provisioning with `tenantContext` middleware scoping all database queries by `organizationId`.
- Dual-tier RBAC/PBAC: Organization roles (`owner`, `admin`, `member`, `guest`) and Project roles (`lead`, `member`, `viewer`).
- Member invitations with 72-hour TTL tokens and Free tier 5-seat quota limits (`402 Payment Required`).

#### Project Management & LexoRank Kanban Engine (Milestone 1)
- Project Hub and issue key auto-increment generation (e.g. `FE-101`, `FE-102`).
- Free tier 3-project quota enforcement.
- Single-document LexoRank card reordering (`PATCH /api/v1/tasks/:id/reorder`) with atomic version increments and optimistic concurrency conflict rejection (`409 ORDER_CONFLICT`).
- Slide-over task details drawer with URL query synchronization (`?task=ID`), popstate history, and subtask management.

#### Real-Time Collaboration & Time Tracking (Milestone 2)
- Authenticated Socket.IO engine with scoped room routing (`org:<id>`, `project:<id>`, `user:<id>`, `task:<id>`).
- Sub-100ms real-time card movement synchronization across active clients.
- Threaded task comments with **Zero-Leak privacy filter** automatically stripping `isInternal: true` comments for guests.
- Signed Cloudinary direct upload integration with MIME and 10MB file size validation.
- Single-active-timer stopwatch lock enforcing one running timer per user across devices with multi-device `timer:sync` broadcasts.
- DFS cycle detection algorithm preventing circular task dependency loops (`400 CIRCULAR_DEPENDENCY_DETECTED`).
- Weekly timesheet grid with billable hours breakdown and manual time logging.
- Project milestone calendar grid with date-based task deadline mapping.

#### Simulated Payments, Governance & Super Admin Plane (Milestone 3)
- `IPaymentGateway` adapter pattern with deterministic test card harness (`...4242` success, `...0002` card decline).
- Graceful subscription downgrade to Free tier with read-only project archival (`status: "archived_read_only"`) and zero data loss.
- Simulated invoice history with downloadable HTML printable receipts.
- Aggregation pipelines for sprint velocity and billable vs. non-billable time allocations.
- Immutable audit logging recording administrative actions.
- Dedicated Super Admin control plane (`/admin-portal`) for cross-tenant telemetry, instant suspension, and WebSocket disconnection.
