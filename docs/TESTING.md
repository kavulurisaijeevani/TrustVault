# TrustVault — Testing Strategy

## 1. Purpose

This document describes how TrustVault will be tested for functional correctness, authorization, file upload security, permission revocation, and audit integrity.

Tests must reflect the actual implementation. A planned test must not be reported as passed until it has been executed successfully.

## 2. Testing Levels

### Unit Tests
Test individual validation rules, authorization policies, and application services where practical.

### Integration Tests
Test API endpoints and their interactions with the database and file storage.

### Security Tests
Attempt unauthorized operations, including cross-user document access and attempts to bypass permission checks.

### Manual Tests
Verify user workflows and administrative screens in the running application.

## 3. Test Accounts

Create separate development/test accounts for:
- Admin
- Document owner A
- Document owner B
- Viewer A
- Viewer B

Use synthetic documents and test credentials only. Never use real passwords or confidential documents.

## 4. Functional Test Cases

| ID | Test | Expected Result |
|---|---|---|
| F-01 | Sign in with valid credentials | Authentication succeeds |
| F-02 | Sign in with invalid credentials | Request is rejected |
| F-03 | Upload a valid permitted file | File and metadata are stored |
| F-04 | Search for an accessible document | Only authorized results are returned |
| F-05 | Download an accessible document | Correct document is returned |
| F-06 | Edit document metadata with permission | Changes are saved |
| F-07 | Delete a document as an authorized user | Operation follows the defined deletion policy |

## 5. Authorization and Security Tests

| ID | Test | Expected Result |
|---|---|---|
| S-01 | Viewer requests a document without permission | Access is denied |
| S-02 | User A requests User B's private document | Access is denied |
| S-03 | Viewer attempts to edit a document | Access is denied |
| S-04 | User changes a document ID in a request | Server checks authorization for the target |
| S-05 | User attempts an unauthorized permission change | Access is denied |
| S-06 | Owner revokes a viewer's permission | Subsequent access is denied |
| S-07 | Upload an unsupported file type | Upload is rejected according to policy |
| S-08 | Upload a file exceeding the configured size limit | Upload is rejected |
| S-09 | Ordinary user attempts to access admin functions | Access is denied |
| S-10 | User searches for another user's private document | Unauthorized metadata is not disclosed |

## 6. Audit Tests

| ID | Test | Expected Result |
|---|---|---|
| A-01 | Authorized user downloads a document | Successful action is recorded |
| A-02 | Unauthorized user requests a private document | Denied action is recorded |
| A-03 | Owner grants or revokes permission | Permission change is recorded |
| A-04 | Ordinary user attempts to alter audit records | Modification is prevented |
| A-05 | Inspect audit event contents | Passwords, tokens, and document contents are absent |
| A-06 | Trigger an error during a sensitive operation | Audit behavior follows the documented policy |

## 7. Test Execution Record

### Build and integration checks

| Check | Status | Evidence / Notes |
|---|---|---|
| Frontend TypeScript check (`tsc --noEmit`) | Passed | Included in `npm run build` |
| Frontend production build (`vite build`) | Passed | Output generated in `frontend/dist` |
| Backend build (`dotnet build`) | Passed | Project targets .NET 10 |
| Backend startup | Passed | API returned `{ "application": "TrustVault API", "status": "Running" }` |
| PostgreSQL connectivity (`GET /db-check`) | Passed | Returned `{ "status": "Connected", "database": "PostgreSQL" }` |
| Database schema creation | Passed | `EnsureCreatedAsync()` completed on startup |

### Manual API checks

| Test ID | Status | Evidence / Notes |
|---|---|---|
| F-01 | Passed | `POST /api/auth/register` and `POST /api/auth/login` returned JWTs |
| F-02 | Passed | Invalid login returned `401 Unauthorized` |
| F-03 | Passed | Valid text upload returned document metadata; invalid content type returned `400 File type not allowed` |
| F-04 | Not implemented | No server-side search endpoint; frontend filters loaded metadata only |
| F-05 | Not implemented | No document-content download endpoint |
| F-06 | Not implemented | No document metadata edit endpoint |
| F-07 | Passed | `DELETE /api/documents/{id}` returned `204 No Content`; subsequent read returned `403`/`404` |
| S-01 | Passed | Unauthenticated `GET /api/documents` returned `401` |
| S-02 | Passed | Cross-user `GET /api/documents/{id}` returned `403` |
| S-03 | Not implemented | No document edit endpoint exists |
| S-04 | Partially tested | Protected endpoints derive actor from JWT; request-supplied user IDs are not accepted for document access |
| S-05 | Passed | Non-owner permission grant returned `403` |
| S-06 | Passed | Revoked permission caused subsequent read to return `403` |
| S-07 | Passed | Upload with disallowed content type returned `400` |
| S-08 | Not tested | Oversized upload rejection was not exercised with an >10 MB file |
| S-09 | Partially tested | Non-admin user received only own audit entries; admin-only behavior not tested |
| S-10 | Not tested | No search endpoint exists; list filtering only was observed |
| A-01 | Not implemented | No download action exists to audit |
| A-02 | Passed | Denied document read produced an audit entry |
| A-03 | Passed | Upload, delete, grant, revoke, and expiry changes produced audit entries |
| A-04 | Not tested | No API exists to modify or delete audit records |
| A-05 | Partially verified | Audit response contained actor, timestamp, action, outcome, IP, and correlation ID; no token/password observed in sampled payloads |
| A-06 | Not tested | Audit behavior during forced write failures was not tested |

Automated tests: none currently exist. No `dotnet test` project is present, so no automated test result is claimed.

Allowed status values: **Pending**, **Passed**, **Failed**, and **Blocked**.

## 8. Running and Verifying

### Backend

```powershell
cd c:\projects\TrustVault\backend\TrustVault.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=trustvault_db;Username=<user>;Password=<password>"
dotnet user-secrets set "Jwt:Key" "replace-with-a-strong-secret-at-least-32-characters"
dotnet run
```

The API runs on `http://localhost:5285`. Swagger is available at `/swagger` in Development.

### Frontend

```powershell
cd c:\projects\TrustVault\frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api/*` to the backend.

### Build checks

```powershell
cd c:\projects\TrustVault\frontend
npm run build
npm run lint

cd c:\projects\TrustVault\backend\TrustVault.Api
dotnet build
```

### Database connectivity

```powershell
curl http://localhost:5285/db-check
```

Expected response: `{ "status": "Connected", "database": "PostgreSQL" }`.

## 9. Acceptance Criteria

The application is ready for demonstration only when the essential workflows work and the security-critical tests have been executed and reviewed.

Priority acceptance criteria:
1. Document access is enforced by the backend.
2. Revoked permissions no longer authorize new requests.
3. Unauthorized document contents and metadata are not disclosed.
4. Relevant successful and denied actions are audited.
5. Audit records are protected against unauthorized modification.
6. Invalid uploads are rejected.
7. Setup, migrations, and test instructions are documented.

## 10. Limitations

Automated tests can find many defects but cannot prove that the application is completely secure. Manual review and a documented threat assessment remain necessary.