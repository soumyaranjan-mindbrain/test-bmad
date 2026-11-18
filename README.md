# TaskFlow - B2B SaaS Project Management Platform

TaskFlow is a production-grade multi-tenant project management platform built with React, Node.js, Express, TypeScript, Mongoose, and Socket.IO, architected using the BMad Method.

## Overview & Architecture

TaskFlow implements a modular monolith architecture designed for enterprise collaboration, strict tenant isolation, and responsive real-time interactions.

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Zustand, Lucide React
- **Backend**: Node.js, Express 5, TypeScript, Mongoose, Zod, Socket.IO
- **Database**: MongoDB Atlas with multi-tenant discriminator indexes
- **Real-Time**: Socket.IO room routing (`org:<id>`, `project:<id>`, `user:<id>`, `task:<id>`)

---

## Core Capabilities

1. **Multi-Tenant Architecture & Dual-Tier RBAC**
   - Organization tenant scoping via `x-organization-id` middleware header.
   - Dual-tier RBAC/PBAC: Organization roles (`owner`, `admin`, `member`, `guest`) and Project roles (`lead`, `member`, `viewer`).
   - Free tier quota enforcement (5 member seats, 3 active projects).

2. **LexoRank Kanban Engine**
   - Single-document card reordering with optimistic concurrency version locks (`409 ORDER_CONFLICT` race prevention).
   - Real-time drag-and-drop movement broadcasts across connected team members.

3. **Real-Time Contextual Collaboration**
   - Threaded task comments with a **Zero-Leak privacy filter** (strips internal notes for guest users).
   - Direct file upload signing with MIME and size validation.

4. **Native Time Tracking & Dependency Management**
   - Single-active-timer lock per user across devices with automated flush to timesheets.
   - Interactive weekly timesheet breakdown and billable hours analytics.
   - Milestone calendar views with priority deadlines.
   - Directed acyclic graph (DAG) cycle detection preventing circular task dependencies.

5. **Simulated Payment Gateway & Quotas**
   - `IPaymentGateway` adapter pattern supporting zero-downtime transition to production gateways.
   - Deterministic test card harness (`...4242` success, `...0002` card decline).
   - Graceful downgrade to Free tier with read-only project archival and zero data loss.
   - Printable HTML simulated invoice receipts with disclaimer watermarks.

6. **Governance, Auditing & Super Admin Control Plane**
   - Aggregation pipelines for sprint velocity and billable time allocations.
   - Immutable audit logging recording administrative mutations.
   - Dedicated Super Admin plane (`/admin-portal`) for cross-tenant telemetry, instant suspension, and WebSocket session termination.

---

## Repository Structure

```text
├── _bmad-output/             # Canonical BMad planning specifications (PRD, UX, Architecture, etc.)
├── backend/                  # Node.js + Express + Mongoose + Socket.IO API
│   ├── src/
│   │   ├── config/           # Database & environment configuration
│   │   ├── middleware/       # Auth, tenant context, RBAC & error handlers
│   │   ├── models/           # 21 Mongoose schema collections
│   │   ├── modules/          # Domain services (auth, tasks, billing, governance, etc.)
│   │   ├── real-time/        # Socket.IO connection & event handlers
│   │   └── utils/            # LexoRank, cycle detection, token helpers
├── frontend/                 # React + TypeScript + Tailwind SPA
│   ├── src/
│   │   ├── components/       # Kanban, Drawer, Timesheets, Calendar, Billing, Admin
│   │   ├── hooks/            # Socket.IO and event listeners
│   │   └── stores/           # Zustand state management
└── .agent/                   # BMad Method v6.12 skills & agents
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or pnpm
- A running MongoDB instance or MongoDB Atlas cluster connection string

### 1. Environment Configuration

In the `backend/` directory, create a `.env` file (refer to `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run build
npm run dev
```
The API server will listen on `http://localhost:5000` with health check at `http://localhost:5000/api/v1/health`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
The React application will be available at `http://localhost:5173`.

---

## Planning & Documentation

Complete design specifications produced under BMad Method are preserved in `_bmad-output/planning-artifacts/`:
- **PRD**: Product requirements and acceptance criteria
- **UX**: Screen maps, responsive layouts, and design tokens
- **Architecture**: Modular monolith pipeline and middleware contracts
- **Database**: 21 Mongoose schemas and compound indexes
- **API Specification**: Standard envelope REST endpoint catalog
- **Billing**: `IPaymentGateway` adapter and test card matrix
- **Security & QA**: Threat modeling and testing pyramid
- **Roadmap**: Epics, user stories, and acceptance verification criteria

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
