# TrustVault — Secure Document Sharing

## 1. Project Overview

TrustVault is a secure document-sharing application designed to protect confidential files through document-level permissions and an auditable record of user activity.

## 2. Problem Statement

Organizations share confidential documents with employees, customers, and external partners. Incorrect permissions and missing audit records can expose sensitive information.

TrustVault aims to ensure that only authorized users can access documents and that important actions can be investigated later.

## 3. Project Objectives

- Implement secure user authentication.
- Support administrator, document owner, and viewer roles.
- Upload, organize, search, and manage documents.
- Grant and revoke per-document permissions.
- Record successful and denied access attempts.
- Provide an administrative activity dashboard.
- Test authorization with automated security tests.

## 4. Technology Stack

- Frontend: React 18 + TypeScript + Vite
- Backend: ASP.NET Core Web API
- Database: PostgreSQL
- Version control: Git and GitHub

## 5. Project Status

Current phase: Frontend-backend integration and documentation.

Implemented features:
- User registration and login with JWT authentication
- Current-user profile retrieval
- Document listing, metadata retrieval, upload, and deletion
- Document-level read/edit permissions: grant, revoke, and expiry update
- Audit log listing (users see their own events; administrators see all events)
- React frontend pages for login, registration, dashboard, documents, upload, sharing/access, and audit logs
- Development CORS policy for the Vite frontend origin

Known limitations:
- No automated test project or test suite has been run.
- No document-content download endpoint is implemented; only document metadata is returned.
- Search and filtering are performed in the frontend over already loaded metadata; there is no server-side search endpoint.
- Document metadata cannot be edited after upload.
- Database schema is created with `EnsureCreatedAsync()`; EF Core migrations are not used.
- JWTs are stored in browser `sessionStorage`; production should use httpOnly cookies and CSRF protection.
- No logout or token-revocation flow is implemented.
- The default development administrator account is seeded by startup code and must be changed for any shared or production environment.
- File-type validation uses the client-supplied content type; content-signature validation is not implemented.
- No rate limiting, refresh tokens, or production deployment configuration is implemented.

## 6. Security Principles

- Enforce authorization on the server for every protected operation.
- Store uploaded files in private storage.
- Recheck permissions when documents are accessed.
- Record important security events.
- Test unauthorized access and permission revocation.

## 7. Known Limitations

See the known limitations listed under "Project Status".

## 8. Project Links

Repository: To be added.

Live application: To be added.

Demo video: To be added.


## 9. Setup and Run

### Prerequisites

- .NET 10 SDK
- Node.js 18+ and npm 9+
- PostgreSQL 18 (or an accessible PostgreSQL instance)
- Git

### Backend

```powershell
cd c:\projects\TrustVault\backend\TrustVault.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=trustvault_db;Username=<user>;Password=<password>"
dotnet user-secrets set "Jwt:Key" "replace-with-a-strong-secret-at-least-32-characters"
dotnet run
```

The API listens on `http://localhost:5285` by default. In Development, Swagger is available at `/swagger`.

The application creates the database schema on startup with `EnsureCreatedAsync()` and seeds one administrator account if no administrator exists.

### Frontend

```powershell
cd c:\projects\TrustVault\frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173`. API requests to `/api/*` are proxied to `http://localhost:5285`.

### Build and type check

```powershell
cd c:\projects\TrustVault\frontend
npm run build
npm run lint
```

### Database connectivity check

```powershell
curl http://localhost:5285/db-check
```

Expected response: `{ "status": "Connected", "database": "PostgreSQL" }`.

## 10. Deployment (Render + Vercel/Netlify)

TrustVault now includes deployment files:

- Backend Docker image: `backend/TrustVault.Api/Dockerfile`
- Render Blueprint: `render.yaml`
- Frontend Netlify config: `frontend/netlify.toml`
- Frontend Vercel config: `frontend/vercel.json`

### Backend (Render)

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and point it to the repository.
3. Render will create:
   - `trustvault-api` web service (Docker)
   - `trustvault-db` PostgreSQL database
4. After creation, set `CORS_ALLOWED_ORIGINS` to your deployed frontend URL, for example:
   - `https://your-app.vercel.app`
5. Render automatically provides the database connection string through `ConnectionStrings__DefaultConnection`.

The backend listens on Render's `PORT` environment variable automatically.

### Frontend (Vercel)

1. Import the `frontend` folder into Vercel.
2. Set the environment variable:
   - `VITE_API_BASE_URL=https://your-render-backend.onrender.com`
3. Deploy.

### Frontend (Netlify)

1. Import the repository and set the base directory to `frontend`.
2. Netlify will use `frontend/netlify.toml`.
3. Set the environment variable:
   - `VITE_API_BASE_URL=https://your-render-backend.onrender.com`
4. Deploy.

### Important production notes

- Change the seeded administrator password immediately.
- Set a strong `Jwt__Key` (Render can generate one).
- Use HTTPS for all production traffic.
- Replace `EnsureCreatedAsync()` with EF Core migrations before long-term production use.

## Project Overview

TrustVault is a secure document-sharing application designed to restrict document access to authorized users and maintain an audit trail of document activity.

## Completed

- [x] Created the ASP.NET Core Web API project using .NET 10.
- [x] Installed PostgreSQL 18.
- [x] Created the `trustvault_db` database.
- [x] Created the initial project documentation.
- [x] Configured the application to run locally.
- [x] Implemented JWT authentication and role claims.
- [x] Implemented document upload, listing, metadata retrieval, and deletion.
- [x] Implemented document-level permission grant, revoke, and expiry updates.
- [x] Implemented audit log listing.
- [x] Built React frontend pages and integrated them with the backend API.
- [x] Verified frontend TypeScript build and production build.
- [x] Verified backend build and local API/database connectivity.

## In Progress

- [ ] Resolve and verify the PostgreSQL connection for every environment.
- [ ] Replace `EnsureCreatedAsync()` with EF Core migrations.
- [ ] Implement document content download with authorization.
- [ ] Implement server-side search and document metadata editing.
- [ ] Complete security and integration testing.
- [ ] Publish the project to GitHub.
- [ ] Deploy the application and verify the live URL.

## Current Status

The frontend and backend are integrated for authentication, documents, permissions, and audit logs. The frontend build and backend build pass, and the local PostgreSQL connection check succeeds. Security-critical behavior still needs broader automated and manual verification.

## Project Documentation

- `API.md` — API documentation
- `THREATS.md` — Threat model and security risks
- `PROMPTS.md` — AI prompts, mistakes, corrections, and lessons learned
- `docs/ARCHITECTURE.md` — System architecture
- `docs/TESTING.md` — Test cases and results
