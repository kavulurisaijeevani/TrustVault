# PROMPTS.md — AI Usage Log

## Purpose

This file documents how AI tools are used during the development of TrustVault. It records the task, the assistance received, how the output is reviewed, and any limitations. AI-generated suggestions are not treated as proof that the application is secure.

**Project:** TrustVault  
**Log started:** 2026-10-19

## AI Usage Entries

### Entry 1 — Project planning and documentation
- **Date:** 2026-10-19
- **Task:** Plan the TrustVault project and organize its documentation.
- **AI assistance:** Used ChatGPT to help structure the README, API documentation, architecture documentation, testing documentation, and threat model.
- **Human review:** I review the suggested structure and adapt it to the actual project.
- **Verification:** Documentation content will be checked against the implemented application.
- **Limitations:** Documentation does not establish that features have been implemented or tested.

### Entry 2 — Threat modeling
- **Date:** 2026-10-19
- **Task:** Identify likely security threats for a document-sharing application.
- **AI assistance:** Used ChatGPT to draft threat scenarios covering insecure direct object references (IDOR), unauthorized access, permission escalation, malicious uploads, and sensitive metadata exposure.
- **Human review:** I will assess whether each threat applies to TrustVault and update the mitigations as implementation decisions are made.
- **Verification:** Each applicable threat will be linked to relevant tests or manual verification.
- **Limitations:** The generated threat list may omit application-specific attack paths.

### Entry 3 — Authentication and authorization planning
- **Date:** 2026-10-19
- **Task:** Plan server-side access control for document operations.
- **AI assistance:** Used AI-assisted planning to identify the need to enforce roles and document-level read/edit permissions on the server rather than relying on frontend controls.
- **Human review:** The planned policy must be checked against the actual API endpoints and database model.
- **Verification:** I will test access using different user accounts, including attempts to access documents owned by another user.
- **Limitations:** No authorization implementation or successful security test is claimed by this entry.

### Entry 4 — Audit logging and integrity planning
- **Date:** 2026-10-19
- **Task:** Plan security audit events and protection against audit tampering.
- **AI assistance:** Used AI-assisted threat analysis to identify the need to record successful and denied sensitive actions and to protect audit records from unauthorized modification.
- **Human review:** I will determine which operations require events and how the application will protect audit records.
- **Verification:** Planned tests will check event creation for permitted and denied actions and whether ordinary users can modify audit records.
- **Limitations:** Audit integrity is not verified until the implementation and tests are completed.

### Entry 5 — Security verification planning
- **Date:** 2026-10-19
- **Task:** Plan security-focused tests and project acceptance checks.
- **AI assistance:** Used ChatGPT to help organize testing priorities for authorization, permission revocation, file validation, and audit logging.
- **Human review:** I will convert applicable checks into automated tests and review their results.
- **Verification:** Test results, failures, and any unresolved issues will be recorded in the project.
- **Limitations:** A test plan is not evidence that the application passes those tests.

### Entry 6 — Frontend-backend integration and documentation

- **Date:** 2026-10-25
- **Task:** Integrate the React frontend with the ASP.NET Core backend and update project documentation.
- **AI assistance:** Used Cline to inspect the backend controllers, DTOs, services, frontend API client, and configuration, then update README, API documentation, architecture, testing, threat model, and prompts.
- **Human review:** Documentation was checked against implemented endpoints and configuration. Untested or unimplemented features are marked as not implemented, not tested, or pending verification.
- **Verification:** Frontend `npm run build` and `npm run lint`, backend `dotnet build`, backend startup, and `/db-check` were verified. No automated test suite exists.
- **Limitations:** Manual verification was limited to the local development environment. Security-critical behavior still requires broader testing.
## Responsible AI Use

- AI-generated code and documentation must be reviewed before acceptance.
- Security-sensitive behavior must be verified with automated tests or documented manual checks.
- AI tools must not receive real passwords, API keys, private documents, or other secrets.
- AI assistance must not be represented as independent security certification.
- This log will be updated as development progresses, including corrections, rejected suggestions, and verification results.

## Update History

| Date | Update |
|---|---|
| 2026-10-19 | Initial AI usage log drafted for project planning and security design. |
| 2026-10-25 | Documented frontend-backend integration, implemented API endpoints, build/test results, and remaining verification tasks. |
| Future updates | Record additional assistance and actual verification results as work progresses. |

**Accuracy note:** Keep only entries that accurately describe AI assistance actually used. Update the dates, prompts, tools, and verification results when necessary. Do not claim that tests passed or security controls were implemented unless you have verified that they did.