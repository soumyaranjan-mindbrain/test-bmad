# Security Policy

## Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported          |
| :---    | :---:              |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

The TaskFlow team takes the security of our platform and user data seriously. If you discover a security vulnerability, please report it privately rather than opening a public GitHub issue.

### How to Report
Please email security disclosures to:
**security@taskflow.local** (or contact the maintainers directly via GitHub private vulnerability reporting).

Include as much of the following details as possible:
- Nature of the vulnerability (e.g. Broken Object Level Authorization, tenant data isolation bypass, privilege escalation).
- Clear, reproducible step-by-step instructions or proof-of-concept payload.
- Affected API endpoints, client routes, or database collections.
- Any suggested mitigations.

### Response Timeline
- **Initial Acknowledgement**: Within 48 hours of receipt.
- **Triage & Assessment**: Within 5 business days.
- **Fix & Public Disclosure**: Coordinated disclosure after fix deployment (typically within 30 days).

---

## Security Architecture Principles

TaskFlow is architected around foundational defense-in-depth principles:
1. **Multi-Tenant Isolation**: Hard query scoping via `organizationId` compound discriminator indexes prevents unauthorized cross-tenant data access.
2. **Dual-Tier RBAC/PBAC**: Strict authorization barriers between organization management and project execution.
3. **Dual-Token Auth**: Short-lived 15-minute access JWTs coupled with 7-day cryptographically hashed refresh tokens stored in `HttpOnly; Secure; SameSite=Strict` cookies.
4. **Data Redaction**: Sensitive attributes such as `passwordHash` are stripped at serialization, and internal comments (`isInternal: true`) are systematically purged before transmission to external guests.
