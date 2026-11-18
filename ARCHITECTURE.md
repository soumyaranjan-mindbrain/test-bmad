# TaskFlow System Architecture

TaskFlow is designed as a **Modular Monolith** with clean domain boundary separation, strict multi-tenant isolation, and low-latency real-time collaboration.

---

## 1. High-Level Architecture Topology

```
+--------------------------------------------------------------------------+
|                     CLIENT APPLICATION LAYER (SPA)                       |
|   React 19 + TypeScript + Vite + Tailwind CSS + Zustand + Lucide Icons   |
+--------------------------------------------------------------------------+
                                    │
                                    │ HTTPS (REST) / WSS (Socket.IO)
                                    ▼
+--------------------------------------------------------------------------+
|                       REVERSE PROXY / INGRESS                            |
|                 CORS, Helmet, Rate Limiter, Compression                  |
+--------------------------------------------------------------------------+
                                    │
                                    ▼
+--------------------------------------------------------------------------+
|                   TASKFLOW MODULAR MONOLITH BACKEND                      |
|                                                                          |
|   [ Middleware Pipeline ]                                                |
|   Authenticate (JWT) ──> TenantContext (x-org-id) ──> Authorize (RBAC)  |
|                                                                          |
|   [ Domain Modules ]                                                     |
|   ├── Auth & Session Management         ├── Native Time Tracking         |
|   ├── Organizations & Invitations       ├── Task Dependencies (DFS)      |
|   ├── Projects & Auto-Increment Keys    ├── Billing & Quotas (Adapter)   |
|   ├── LexoRank Kanban Engine            ├── Audit Logging & Governance   |
|   └── Real-Time Socket.IO Hub           └── Super Admin Control Plane    |
+--------------------------------------------------------------------------+
                                    │
                                    ▼
+--------------------------------------------------------------------------+
|                       PERSISTENCE LAYER (DATABASE)                       |
|         MongoDB Atlas (Shared Collections + Discriminator Keys)          |
|         21 Collections with Compound Indexes { organizationId: 1 }       |
+--------------------------------------------------------------------------+
```

---

## 2. Core Architectural Pillars

### 2.1 Multi-Tenant Data Segregation Model
- **Discriminator Strategy**: All core collections share the database but enforce strict tenant boundary scoping by indexing `{ organizationId: 1, ... }`.
- **Enforcement Pipeline**: Incoming API requests supply the active tenant in the `x-organization-id` header. The `tenantContext` middleware validates user membership in that tenant, checking for active status, and populates `req.org` and `req.membership`.
- **Tenant Suspension**: When an organization is suspended by Super Admins (`status: "suspended"`), `tenantContext` rejects all operations with HTTP `403 Forbidden` and terminates all active WebSocket connections for that tenant.

---

### 2.2 Dual-Tier RBAC / PBAC Authorization Matrix

TaskFlow enforces a two-tier authorization model:

1. **Tier 1: Organization Roles** (Tenant Administration)
   - `owner`: Full organizational authority, billing administration, subscription changes, ownership transfer.
   - `admin`: Member invitations, project provisioning, organization settings.
   - `member`: Project participation, task creation and assignment, timesheet logging.
   - `guest`: Read/comment access strictly within explicitly shared projects.

2. **Tier 2: Project Roles** (Contextual Scopes)
   - `lead`: Project settings, column definitions, WIP limit enforcement.
   - `member`: Story execution, status transitions, comment threads.
   - `viewer`: Read-only board observation.

---

### 2.3 LexoRank Kanban Engine & Optimistic Concurrency

```
           Rank: "0|i00000:"             Rank: "0|i00008:"
             [Task FE-101]                 [Task FE-102]
                   \                             /
                    \   Calculated Middle Rank  /
                     \     "0|i00004:"         /
                      ▼                       ▼
                           [Task FE-103 Moved]
```

- **Single-Document Updates**: Card moves do NOT require batch updates across sibling cards. Middle ranks are dynamically calculated as midpoint strings between adjacent cards.
- **Race Condition Prevention**: Every task document maintains an atomic `version` integer. Reorder updates verify `{ _id, version: input.version }` with an atomic `$inc: { version: 1 }`. Conflicting concurrent moves return `409 ORDER_CONFLICT`, prompting client state re-synchronization.

---

### 2.4 Zero-Leak Comment Privacy Filter

- Tasks support internal discussions between organization team members that must remain invisible to external contractors or guests.
- Comments flag sensitive conversations using `isInternal: true`.
- When requests originate from a user whose active membership is `role: "guest"`, the query projection strictly forces `{ isInternal: false }`, guaranteeing zero disclosure of internal discussions over REST or WebSockets.

---

### 2.5 Active Stopwatch Timer Lock & Cycle Detection

- **Single-Active-Timer Lock**: The `ActiveTimer` collection maintains a unique compound index on `{ userId: 1, isRunning: true }`. Starting a timer session automatically flushes any previously running timer across devices, ensuring timesheet data integrity.
- **Dependency Cycle Protection**: Directed task dependencies (`blocks`, `blocked_by`) undergo Depth-First Search (DFS) graph traversal before persistence. Circular dependency loops are rejected with `400 CIRCULAR_DEPENDENCY_DETECTED`.

---

### 2.6 Payment Gateway Adapter Pattern (`IPaymentGateway`)

The billing engine interacts through an abstraction:

```typescript
export interface IPaymentGateway {
  processPayment(
    organizationId: string,
    amountCents: number,
    currency: string,
    paymentMethod: PaymentMethodPayload
  ): Promise<TransactionResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}
```

- In development and demonstration environments, `SimulatedPaymentGateway` evaluates cards deterministically based on test numbers (`...4242` &rarr; Success, `...0002` &rarr; Card Declined).
- Transitioning to production requires swapping in `StripePaymentGateway` without modifying subscription rules, quota guards, or database records.
- Subscription downgrades follow a **zero-data-loss** philosophy: excess projects transition to `status: "archived_read_only"` rather than being deleted.
