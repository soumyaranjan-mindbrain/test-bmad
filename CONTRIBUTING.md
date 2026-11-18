# Contributing to TaskFlow

Thank you for your interest in contributing to TaskFlow! We welcome contributions from developers of all backgrounds. Please take a few moments to review these guidelines before submitting code.

---

## Code of Conduct

By participating in this project, you agree to abide by our respectful, inclusive, and professional collaboration standards. Treat fellow contributors with kindness and constructive feedback.

---

## Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **MongoDB**: MongoDB Atlas URI or local MongoDB replica set (required for multi-document transactions)

### Local Environment
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/soumyaranjan-mindbrain/test-bmad.git
   cd test-bmad
   ```

2. Configure backend environment:
   ```bash
   cd backend
   cp .env.example .env
   # Populate MONGODB_URI and JWT secrets in backend/.env
   npm install
   ```

3. Configure frontend environment:
   ```bash
   cd ../frontend
   npm install
   ```

4. Verify builds:
   ```bash
   # In backend/
   npm run build

   # In frontend/
   npm run build
   ```

---

## Branching & Commit Conventions

### Branch Naming
- Features: `feat/issue-number-short-description` (e.g. `feat/102-lexorank-rebalance`)
- Fixes: `fix/issue-number-bug-name` (e.g. `fix/204-timer-race-condition`)
- Docs: `docs/short-description` (e.g. `docs/api-contracts`)

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(...)`: A new user-facing or platform feature
- `fix(...)`: A bug fix
- `docs(...)`: Documentation additions or changes
- `refactor(...)`: Code change that neither fixes a bug nor adds a feature
- `test(...)`: Adding or updating automated test suites
- `chore(...)`: Maintenance, dependency updates, build tooling

---

## Key Architectural Invariants

When writing code for TaskFlow, you must adhere to these architectural requirements:

1. **Strict Multi-Tenant Scoping**:
   - Every database query mutating or reading tenant data MUST include `{ organizationId: req.org._id }`.
   - Never write unbounded cross-tenant queries.

2. **LexoRank Optimistic Concurrency**:
   - Card order changes must update `version: { $inc: 1 }` and verify the current version to prevent race condition overwrites (`409 ORDER_CONFLICT`).

3. **Zero-Leak Comment Privacy Filter**:
   - Comments with `isInternal: true` must be strictly omitted when querying or streaming data for users with `role: "guest"`.

4. **Single-Active-Timer Lock**:
   - Each user may only run one active stopwatch timer at a time. Starting a new timer must automatically commit the previous running timer.

---

## Pull Request Process

1. Ensure the code compiles cleanly (`npm run build` in both `backend/` and `frontend/`).
2. Run automated verification scripts against a test MongoDB instance.
3. Open a Pull Request against the `main` branch with a clear description of changes, referenced issue numbers, and test evidence.
