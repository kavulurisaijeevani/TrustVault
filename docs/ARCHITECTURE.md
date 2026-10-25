# TrustVault — System Architecture

## 1. Overview

TrustVault is a secure document-sharing application. It allows authenticated users to upload and manage documents while enforcing role-based and document-level permissions on the server.

## 2. Technology Stack (Implemented)

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** ASP.NET Core Web API on .NET 10
- **Database:** PostgreSQL via Npgsql and EF Core
- **Authentication:** JWT bearer tokens (8-hour expiry)
- **File storage:** private directory under the backend content root (`backend/TrustVault.Api/storage/documents`)
- **API documentation:** Swagger / OpenAPI in Development
- **Version control:** Git and GitHub

## 3. Main Components

### Frontend

Provides login, registration, dashboard, document upload, document listing, permission management, and audit-log screens.

The frontend is not a security boundary. Hiding a button or page must never be the only access-control measure. All authorization decisions are made by the backend.

### Backend API
Responsible for authentication, authorization, input validation, document operations, permission changes, audit events, and consistent error responses.

### PostgreSQL Database
Stores application data such as users, document metadata, document permissions, and audit records.

### Private File Storage
Stores document contents separately from public application assets. Files must be retrieved through authorized backend operations.

## 4. User Roles

- **Admin:** Performs explicitly authorized administrative tasks and reviews security activity.
- **Document owner:** Uploads and manages owned documents and grants or revokes access.
- **Viewer:** Reads documents only when the required permission has been granted.

The backend must enforce these roles and permissions for every relevant request.

## 5. API Communication and CORS

- The frontend calls the backend through `fetch` using paths under `/api`.
- In development, the Vite dev server proxies `/api/*` to `http://localhost:5285`.
- The backend CORS policy `frontend` allows origin `http://localhost:5173`, any header, and any method.
- In production, either configure CORS for the deployed frontend origin or place both behind a reverse proxy.
- JWTs are sent in the `Authorization: Bearer <token>` header.

## 6. Core Request Flow

1. A user signs in.
2. The frontend sends an authenticated request to the backend.
3. The backend validates the user's identity.
4. The backend checks the user's role and current document-level permission.
5. The backend performs the permitted operation or rejects the request.
6. The backend records the appropriate audit event.
7. The backend returns the response without exposing unauthorized document contents or sensitive metadata.

## 6. Permission Revocation

When an owner revokes access, subsequent document requests must use the updated permission state.

The application must not rely on stale frontend state or long-lived authorization decisions. Any caching mechanism must not allow access after revocation.

## 7. Audit Logging

Audit events should record relevant information such as the actor, action, target document where applicable, outcome, timestamp, and request correlation identifier.

Sensitive operations, including permission changes and denied access attempts, should be covered. Audit records must be protected against unauthorized modification and deletion.

Passwords, access tokens, and document contents must not be written into audit logs.

## 8. File Upload Security

The backend should validate file size, permitted file types, filenames, and upload contents as appropriate.

Files must receive server-controlled storage names and must not be saved to a publicly accessible directory. Downloads must perform authorization checks before returning file contents.

## 9. Security Boundaries

- Browser to backend API
- Backend API to PostgreSQL
- Backend API to private file storage
- User-accessible operations to administrative operations
- Application services to audit records

Every boundary must be considered when implementing and testing access controls.

## 10. Verification Plan

- Test access between different user accounts.
- Test unauthorized document reads and edits.
- Test immediate permission revocation.
- Test invalid and oversized file uploads.
- Test successful and denied action audit events.
- Test protection of audit records.
- Test that sensitive data is not exposed in error responses.

## 11. Deployment Considerations

Production deployment should use HTTPS, environment-based secrets, restricted database credentials, private file storage, database migrations, and appropriate backup controls.

Do not commit passwords, connection strings containing credentials, or other secrets to Git.

## 10. Authentication Flow (Implemented)

1. `POST /api/auth/register` creates a user with role `Owner` and returns a JWT.
2. `POST /api/auth/login` validates credentials with BCrypt and returns a JWT.
3. `GET /api/auth/me` returns the current user from the JWT claims.
4. The backend validates issuer, audience, lifetime, and signing key for every protected request.
5. Authorization uses role claims and document-level permission checks.

## 11. Database Access (Implemented)

- PostgreSQL is accessed through EF Core and `TrustVaultDbContext`.
- The connection string is read from configuration and is expected to be supplied through user secrets or environment variables.
- The schema is created at startup with `EnsureCreatedAsync()`.
- If no administrator exists, startup seeds `admin@trustvault.local`.
- Uploaded file paths are stored in the `Documents` table; file contents are stored on disk.

## 12. Implementation Status

Implemented:
- JWT authentication and role claims
- CORS for the development frontend origin
- PostgreSQL connectivity and schema creation
- Document metadata CRUD subset: list, get, upload, delete
- Permission grant, revoke, expiry update, and list
- Audit log listing with actor scoping
- React frontend integration with the above endpoints

Not implemented or not verified:
- EF Core migrations
- Document content download
- Server-side search and metadata editing
- Automated tests
- Production deployment configuration