# TrustVault — API Documentation

## Base URLs

- Development API: `http://localhost:5285`
- Development frontend: `http://localhost:5173`
- Health endpoint: `GET /`
- Database check: `GET /db-check`

Most application endpoints are under `/api`. In Development, Swagger UI is available at `/swagger`.

## Authentication

Authentication uses JWT bearer tokens.

- Register or log in to receive `accessToken`, `tokenType`, `expiresAt`, and `user`.
- Send protected requests with:

```http
Authorization: Bearer <accessToken>
```

Tokens expire after 8 hours. There is no refresh-token or logout/revocation endpoint in the current implementation.

Roles in the current implementation:
- `Admin`: seeded on first startup if no administrator exists.
- `Owner`: assigned to every newly registered user.
- `Viewer`: supported by authorization logic, but no endpoint currently assigns this role.

## Common Responses

- `200 OK`: successful read or update returning JSON.
- `204 No Content`: successful deletion/revocation/update with no response body.
- `400 Bad Request`: invalid or missing input.
- `401 Unauthorized`: missing or invalid JWT.
- `403 Forbidden`: authenticated user lacks permission.
- `404 Not Found`: target resource does not exist.
- `409 Conflict`: duplicate registration email.
- `503 Service Unavailable`: database connectivity check failed.

Error responses are JSON objects such as `{ "message": "..." }`.

## Health

### `GET /`

Returns API status.

Response:

```json
{ "application": "TrustVault API", "status": "Running" }
```

### `GET /db-check`

Checks PostgreSQL connectivity.

Response:

```json
{ "status": "Connected", "database": "PostgreSQL" }
```

## Authentication Endpoints

### `POST /api/auth/register`

Request:

```json
{ "email": "user@example.com", "password": "password", "displayName": "User Name" }
```

`displayName` may be empty; the backend then uses the email as the display name.

Response `200 OK`:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresAt": "2026-10-25T12:00:00Z",
  "user": { "id": "...", "email": "user@example.com", "displayName": "User Name", "role": "Owner", "createdAt": "..." }
}
```

Errors: `400` if email or password is missing; `409` if the email is already registered.

### `POST /api/auth/login`

Request:

```json
{ "email": "user@example.com", "password": "password" }
```

Response `200 OK`: same shape as registration.

Error: `401 Unauthorized` for invalid credentials.

### `GET /api/auth/me`

Requires authentication.

Response `200 OK`:

```json
{ "id": "...", "email": "user@example.com", "displayName": "User Name", "role": "Owner", "createdAt": "..." }
```

## Documents

All document endpoints require authentication.

### `GET /api/documents`

Returns document metadata visible to the current user.

- Administrators receive all documents.
- Other users receive documents they own plus documents with an active, non-expired, non-revoked permission.

Response `200 OK`: array of:

```json
{
  "id": "...",
  "name": "document.pdf",
  "originalFileName": "document.pdf",
  "contentType": "application/pdf",
  "sizeBytes": 12345,
  "ownerId": "...",
  "ownerName": "User Name",
  "uploadedAt": "...",
  "description": null,
  "tags": null
}
```

### `GET /api/documents/{id}`

Returns metadata for one document if the current user can read it.

Response `200 OK`: same document shape.

Errors: `403` if read permission is missing; `404` if the document does not exist.

Note: A successful read is audited. A denied read is audited only when permission is missing; a missing document is not audited.

### `POST /api/documents/upload`

Requires authentication. Content type: `multipart/form-data`.

Form fields:
- `file` (required)
- `name` (optional)
- `description` (optional)
- `tags` (optional)

Limits:
- Maximum file size: 10 MB
- Allowed content types: `application/pdf`, `text/plain`, `image/png`, `image/jpeg`, `application/json`

Response `200 OK`: document metadata.

Errors: `400` if the file is missing, too large, or has a disallowed content type.

Uploaded files are stored under `backend/TrustVault.Api/storage/documents/{userId}/`. The storage path is not returned to clients.

### `DELETE /api/documents/{id}`

Deletes a document if the current user is the owner or an administrator.

Response `204 No Content`.

Errors: `403` if the user is not the owner or an administrator; `404` if the document does not exist.

## Permissions / Sharing

All permission endpoints require authentication.

### `GET /api/documents/{documentId}/permissions`

Returns permissions for a document. Only the document owner or an administrator may call this endpoint.

Response `200 OK`: array of:

```json
{
  "id": "...",
  "documentId": "...",
  "userId": "...",
  "userEmail": "viewer@example.com",
  "userName": "Viewer",
  "level": "Read",
  "grantedAt": "...",
  "expiresAt": null,
  "revokedAt": null,
  "isActive": true
}
```

Error: `403` if the caller is not the owner or an administrator.

### `POST /api/permissions`

Grants a document permission. Only the document owner or an administrator may call this endpoint.

Request:

```json
{ "documentId": "...", "userId": "...", "level": "Read", "expiresAt": null }
```

`level` must be `Read` or `Edit`. `expiresAt` is optional.

Response `200 OK`: permission object.

Errors: `400` if the target user does not exist or the level is invalid; `403` if the caller is not the owner or an administrator.

### `POST /api/permissions/{id}/revoke`

Revokes a permission by setting `revokedAt` and `isActive = false`.

Response `204 No Content`.

Errors: `403` if the caller is not the owner or an administrator of the related document; `404` if the permission does not exist.

### `PATCH /api/permissions/{id}/expiry`

Updates a permission's expiry.

Request:

```json
{ "expiresAt": "2026-12-31T23:59:59Z" }
```

`expiresAt` may be `null` to remove expiry.

Response `204 No Content`.

Errors: `403` if the caller is not the owner or an administrator; `404` if the permission does not exist.
## Audit

### `GET /api/audit`

Requires authentication. Query parameters:
- `page` (default `1`)
- `pageSize` (default `50`, maximum `200`)

Administrators receive all audit entries. Other users receive only entries where they are the actor.

Response `200 OK`:

```json
{
  "items": [
    {
      "id": "...",
      "timestamp": "...",
      "actorId": "...",
      "actorEmail": "user@example.com",
      "action": "DocumentUpload",
      "targetDocumentId": "...",
      "targetDocumentName": "document.pdf",
      "outcome": "Success",
      "ipAddress": "127.0.0.1",
      "correlationId": "...",
      "details": null
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 50
}
```

Recorded actions in the current implementation include:
- `DocumentRead` (denied cases)
- `DocumentUpload` (success)
- `DocumentDelete` (success and denied)
- `PermissionGrant` (success and denied)
- `PermissionRevoke` (success and denied)
- `PermissionExpiryUpdate` (success and denied)

Audit logging is not implemented for login, registration, listing, or permission listing.

## Not Implemented

The following features are not implemented in the current backend:
- Document content download
- Document metadata editing
- Server-side document search
- User role management
- Logout or token revocation
- Refresh tokens
- Audit log creation or deletion endpoints
