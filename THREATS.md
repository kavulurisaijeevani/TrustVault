# TrustVault — Threat Model

## 1. Purpose

This document identifies security threats to TrustVault, the controls intended to mitigate them, and the tests used to verify those controls.

**Status:** Initial threat assessment. Mitigations must be verified against the implemented application.

## 2. Assets to Protect

- Confidential document contents
- User accounts and authentication credentials
- Document permissions and ownership
- Audit records
- Uploaded files and backups
- Database connection credentials and application secrets

## 3. Trust Boundaries

- Browser to backend API
- Backend API to PostgreSQL
- Backend API to private file storage
- Application services to audit storage
- Administrator operations to confidential document data

## 4. Threats, Mitigations, and Tests

### T1 — Unauthorized Document Access (IDOR)

**Attack:** User A changes a document ID in an API request to access User B's document.

**Planned mitigation:** Check ownership or explicit document-level permissions on every request that returns or changes protected resources.

**Verification:** Integration tests attempt unauthorized metadata reads, downloads, edits, and deletions.

**Status:** Partially verified. Manual checks confirmed cross-user document reads return `403`; automated tests are not implemented. Downloads and edits are not available endpoints.

### T2 — Frontend Authorization Bypass

**Attack:** A user calls an API endpoint directly instead of using the application's interface.

**Planned mitigation:** Enforce authorization in the backend, independently of frontend visibility or navigation.

**Verification:** Call protected endpoints directly using a user who lacks permission.

**Status:** Partially verified. Manual checks confirmed unauthenticated requests to protected endpoints return `401`; direct calls without a JWT were rejected. Frontend-only restrictions were not treated as controls.

### T3 — Revoked Permission Remains Valid

**Attack:** A former viewer uses a cached authorization decision or previously issued download link.

**Planned mitigation:** Recheck current permissions on every document request and avoid reusable public links.

**Verification:** Grant access, revoke it, then verify the next request is denied.

**Status:** Partially verified. Manual checks confirmed that revoking a permission caused the next document read to return `403`. Reusable public links are not implemented. Previously downloaded copies cannot be recalled.

### T4 — Audit Log Tampering

**Attack:** An attacker modifies, deletes, or fabricates historical audit events.

**Planned mitigation:** Restrict audit storage privileges, prevent ordinary application APIs from altering historical records, and implement independently verifiable tamper evidence.

**Verification:** Attempt unauthorized modification and validate audit integrity.

**Status:** Not verified. No API endpoint exists to modify or delete audit records, but database-level protection and tamper evidence are not implemented or tested.

### T5 — Malicious File Upload

**Attack:** An attacker uploads a prohibited, malformed, or oversized file.

**Planned mitigation:** Apply file-size limits, allowlisted file types, content-signature checks where appropriate, safe generated storage names, and private storage.

**Verification:** Test disallowed formats, oversized files, and mismatches between file extensions and contents.

**Status:** Partially implemented, not verified. The backend enforces a 10 MB size limit and an allowlist of content types. Content-type validation relies on the client-supplied value; content-signature validation is not implemented. Invalid uploads were not manually tested.

### T6 — Permission Escalation

**Attack:** A viewer changes a request to grant themselves edit access or impersonate an owner.

**Planned mitigation:** Derive the acting identity from authenticated server-side identity and authorize permission changes against the document owner and explicit administrative policy.

**Verification:** Attempt permission changes as a viewer and as an unrelated document owner.

**Status:** Partially verified. Manual checks confirmed that non-owners receive `403` when granting permissions. Permission changes derive the actor from the JWT and check ownership/administrator status. Viewer-role assignment and broader escalation tests are not implemented.

### T7 — Search and Metadata Leakage

**Attack:** A user discovers confidential document names, owners, categories, or metadata through search or list endpoints.

**Planned mitigation:** Apply authorization filters before returning search results or metadata.

**Verification:** Search for documents belonging exclusively to another user.

**Status:** Partially verified. Document listing filters by ownership or active permission for non-admin users, and metadata for unreadable documents is not returned by `GET /api/documents/{id}` when permission is missing. Comprehensive search endpoints are not implemented, so search-specific leakage was not tested.

### T8 — Audit Forgery or Missing Events

**Attack:** An attacker causes sensitive actions to occur without an audit record or creates misleading records.

**Planned mitigation:** Centralize security-event recording, restrict who can write audit events, and fail safely when required audit recording cannot be completed.

**Verification:** Test successful and denied operations, audit failures, and unauthorized attempts to create audit events.

**Status:** Partially implemented, not fully verified. Audit entries are created for document reads (denied), uploads, deletes, and permission changes. Login, registration, listing, and permission listing are not audited. Audit write failures are not tested, and no API allows users to create audit events.

### T9 — Authentication and Session Attacks

**Attack:** An attacker steals a session, abuses weak credentials, or accesses protected endpoints without authentication.

**Planned mitigation:** Use a supported authentication framework, secure session configuration, HTTPS, appropriate cookie protections, and rate limiting where appropriate.

**Verification:** Test unauthenticated requests, logout behavior, session expiration, and relevant CSRF protections.

**Status:** Partially implemented, not fully verified. JWT validation enforces expiration and signature. Tokens are stored in browser `sessionStorage`, and no logout, revocation, refresh, or rate-limiting flow is implemented. CSRF protections are not applicable to bearer-token requests but are relevant if cookies are adopted later.

### T10 — Secret or Backup Exposure

**Attack:** Database credentials, uploaded documents, or backups become publicly accessible or are committed to Git.

**Planned mitigation:** Keep secrets out of source control, restrict file and database access, and protect backups with appropriate access controls and encryption.

**Verification:** Inspect repository contents, deployment configuration, and storage access settings.

**Status:** Partially verified. `appsettings.json` contains an empty connection string; secrets are intended to be supplied through .NET user secrets. The frontend ignores `.env`. No root `.gitignore` was found, although `frontend/.gitignore` excludes `.env`. Storage paths are under the backend content root and are not served as static files. Production hardening is not configured.

## 5. Accepted Risks

For each accepted risk, document:

- The remaining vulnerability or limitation
- Its potential impact
- Why it is accepted
- Compensating controls
- Planned remediation

No risk should be marked accepted without an explicit reason.

## 6. Test Traceability

For each threat, record the corresponding automated test name, test result, and relevant commit once these exist.

## 7. Review History

- Initial threat assessment: 2026-10-19
- Frontend-backend integration and documentation review: 2026-10-25
