# TrustVault Frontend — Backend API Contract

The frontend is built and ready. The backend currently exposes only `GET /` and `GET /db-check`.
To make the dashboard features functional, the backend must implement the endpoints below.
Paths are what the frontend calls (all under the `/api` prefix). Status codes and shapes are
the frontend's expectations; adjust both sides together if changed.

## Authentication

- `POST /api/auth/register` — body `{ email, password, displayName }` → `{ accessToken, tokenType, expiresAt, user }`
- `POST /api/auth/login` — body `{ email, password }` → `{ accessToken, tokenType, expiresAt, user }`

`user`: `{ id, email, displayName, role, createdAt }` (role: `Admin | Owner | Viewer`).

The frontend stores the token in `sessionStorage` and sends `Authorization: Bearer <token>`.
Production should move to httpOnly cookies and CSRF protection.

## Documents

- `GET /api/documents` (auth) → `Document[]`
- `GET /api/documents/{id}` (auth) → `Document`
- `POST /api/documents/upload` (auth, multipart/form-data field `file`) → `Document`
- `DELETE /api/documents/{id}` (auth) → 204

`Document`: `{ id, name, originalFileName, contentType, sizeBytes, ownerId, ownerName?, uploadedAt, description?, tags? }`

## Permissions / Sharing

- `GET /api/documents/{documentId}/permissions` (auth) → `DocumentPermission[]`
- `POST /api/permissions` (auth) body `{ documentId, userId, level, expiresAt? }` → `DocumentPermission`
- `POST /api/permissions/{id}/revoke` (auth) → 204
- `PATCH /api/permissions/{id}/expiry` (auth) body `{ expiresAt }` → `DocumentPermission`

`DocumentPermission`: `{ id, documentId, userId, userEmail?, userName?, level, grantedAt, expiresAt?, revokedAt?, isActive }`
`level`: `Read | Edit` (Owner is implicit for the document owner).

## Audit

- `GET /api/audit?page=&pageSize=` (auth, admin/owner scoped) → `{ items: AuditLog[], total, page, pageSize }`

`AuditLog`: `{ id, timestamp, actorId, actorEmail?, action, targetDocumentId?, targetDocumentName?, outcome, ipAddress?, correlationId?, details? }`
`outcome`: `Success | Denied | Error`

## Backend prerequisites the frontend also needs

1. **CORS**: allow the frontend origin (`http://localhost:5173` in dev) when calling the API directly.
   In dev the Vite proxy avoids CORS; production requires CORS or a reverse proxy.
2. **Authentication scheme** (JWT or cookies) and role-based authorization policies.
3. **EF Core entities/migrations** for User, Document, DocumentPermission, AuditLog.
4. **Private file storage** outside web root; downloads must authorize first.
5. **Audit middleware/filter** to record success and denied actions.

## Implementation status

The endpoints above are implemented by the current backend, except where noted:
- `GET /api/documents/{id}` returns metadata only; document content download is not implemented.
- `GET /api/audit` is scoped to the actor for non-admin users.

The frontend still handles missing or unavailable endpoints gracefully.
