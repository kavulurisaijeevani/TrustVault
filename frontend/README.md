# TrustVault Frontend

React + TypeScript + Vite single-page application for TrustVault.

## Prerequisites

- Node.js 18+ (tested with Node 24)
- npm 9+
- TrustVault backend running (optional for UI; features need backend endpoints)

## Install

```powershell
cd c:\projects\TrustVault\frontend
npm install
```

## Run in development

```powershell
npm run dev
```

Opens http://localhost:5173. API requests to `/api/*` are proxied to http://localhost:5285
(the backend). Start the backend first if you want live data:

```powershell
cd c:\projects\TrustVault\backend\TrustVault.Api
dotnet run
```

## Build for production

```powershell
npm run build
```

Output goes to `frontend/dist`. Preview locally with `npm run preview`.

## Environment variables

Copy `.env.example` to `.env` and adjust:

- `VITE_API_BASE_URL` — backend origin. Leave empty in dev to use the Vite proxy.

## Notes

- The backend implements authentication, documents, permissions, and audit endpoints. See the root `API.md` for the current contract.
- Authentication tokens are stored in `sessionStorage` (dev-friendly). Production should use
  httpOnly cookies.
- Never commit real secrets; `.env` is gitignored.
