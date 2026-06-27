# Better Auth Technical Specification

## Document Purpose
This document defines the technical implementation for the Step 0 foundation item in `IMPLEMENTATION_PLAN.md`:

- Set up Better Auth flows for Google sign in, sign out, and session handling.

It translates that line item into concrete architecture, routes, components, server helpers, environment requirements, OAuth provider configuration, security expectations, and acceptance criteria for the MVP foundation.

## Current State
The repository already contains a minimal Better Auth integration:

- `lib/auth.ts` creates a Better Auth instance backed by the Prisma adapter.
- `app/api/auth/[...all]/route.ts` exposes the Better Auth handler.
- `lib/auth-client.ts` creates a React auth client.
- `prisma/schema.prisma` includes the Better Auth base models: `User`, `Session`, `Account`, and `Verification`.

What is still missing for the Step 0 requirement:

- A user-facing Google sign-in experience.
- A sign-out flow integrated into the app shell.
- Shared server-side session retrieval and authorization guards.
- Consistent redirect behavior for authenticated and unauthenticated requests.
- Environment-based configuration instead of hardcoded auth base URL values.
- Google OAuth provider configuration using environment variables.
- A clear contract for how later server actions and route handlers consume session state.

## Goals
- Support MVP authentication with Better Auth Google OAuth flows.
- Provide a usable sign-in page and sign-out action.
- Make session state available from server components, server actions, and route handlers.
- Establish a reusable auth boundary for future organization, team, and permission features.
- Keep the implementation small and aligned with the current stack: Next.js, Prisma v7, Postgres, and Better Auth.

## Non-Goals
- Additional social login providers beyond Google.
- Password reset, email verification UX, or magic links.
- Organization-aware role resolution beyond the authenticated user identity.
- SSO, SAML, SCIM, or enterprise auth features.
- Middleware-heavy authorization; MVP should prefer server-side checks in components, route handlers, and server actions.

## User Stories
- As a visitor, I can sign in with my Google account.
- As a signed-in user, I can open the app shell and remain authenticated across requests.
- As a signed-in user, I can sign out and return to the public entry point.
- As a developer, I can retrieve the current session from any protected server entry point using one shared helper.
- As a future feature owner, I can build permission checks on top of a stable authenticated-user contract.

## Functional Requirements

### 1. Sign-In
- The app must expose a dedicated sign-in route, recommended as `/sign-in`.
- The sign-in screen must expose a Google OAuth entry point, such as a `Continue with Google` button.
- The Google OAuth flow must use Better Auth as the callback and session orchestration layer.
- On successful sign-in, the user must be redirected to the authenticated home route, recommended as `/`.
- On failed sign-in, the UI must show a user-safe error message without exposing internal details.
- If an already authenticated user opens `/sign-in`, the route should redirect to `/`.
- If the user cancels Google consent or the provider callback fails, the route should return the user to `/sign-in` with retry-safe messaging.

### 2. Sign-Out
- The authenticated app shell must expose a sign-out action.
- Sign-out must invalidate the current session on the server.
- After sign-out, the user must be redirected to `/sign-in`.
- Any protected route opened after sign-out must require re-authentication.

### 3. Session Handling
- The application must provide a shared server helper to retrieve the current session.
- Protected server components, route handlers, and server actions must use that shared helper instead of duplicating auth lookup logic.
- When no valid session exists, protected entry points must either redirect to `/sign-in` or return `401` for API-like handlers.
- The authenticated session contract must expose the current user ID, email, display name if present, and OAuth-linked identity data returned by Better Auth where useful.
- The auth layer must be compatible with future organization and team membership lookups.

### 4. App Shell Access
- A signed-in user must be able to load the authenticated app shell.
- An unauthenticated user must not be able to access protected application routes.
- The first protected route can remain the existing root page until organizations and teams are introduced.

## Technical Design

### Auth Provider Configuration
The Better Auth server configuration should remain centralized in `lib/auth.ts`.

Implementation requirements:

- Replace the hardcoded `baseURL` with an environment variable.
- Keep the Prisma adapter as the source of truth for auth persistence.
- Enable the Google OAuth provider for MVP.
- Configure the provider with environment variables only.
- Avoid introducing optional providers beyond Google until explicitly required.

Recommended environment variables:

- `BETTER_AUTH_URL`: public app URL used by Better Auth.
- `BETTER_AUTH_SECRET`: application secret for Better Auth.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID for the app.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret for the app.
- `DATABASE_URL`: Postgres connection string already required by Prisma.

If local and deployed environments need separate behavior, that should be handled through environment configuration, not code branches.

Google provider expectations:

- `lib/auth.ts` should read `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the environment and register the Better Auth Google provider.
- The Google Cloud Console OAuth app must allow the Better Auth callback URL derived from `BETTER_AUTH_URL`.
- Missing Google OAuth configuration should fail fast in development and produce clear server logs in deployed environments.

### Data Model
The current Prisma auth models are sufficient for Step 0:

- `User`
- `Session`
- `Account`
- `Verification`

No new auth tables are required for this specific implementation item.

Constraints:

- Do not duplicate user identity data into app-specific tables during Step 0.
- Future organization and membership tables should reference the Better Auth `User.id`.

### Route Structure
Recommended route layout:

- `app/api/auth/[...all]/route.ts`: Better Auth handler, already present.
- `app/sign-in/page.tsx`: sign-in page.
- `app/(app)/layout.tsx` or equivalent authenticated layout: protected app shell boundary.
- `app/page.tsx` or a route group child: authenticated landing page.

If route groups are introduced, the authenticated group should contain all app-shell pages and enforce session presence at the layout level where practical.

OAuth routing note:

- The Google authorization request and callback should flow through the Better Auth API handler rather than through a custom callback route unless Better Auth requires a framework-specific wrapper.

### Session Access Pattern
Create shared auth utilities in `lib/auth` or a nearby server-only helper module with three usage modes:

- `getSession()`: returns the current session or `null`.
- `requireSession()`: returns the current session or redirects for protected page flows.
- `requireUser()`: returns the authenticated user payload and can become the base for future permission checks.

Behavior rules:

- Server components should call `requireSession()` at the route or layout boundary.
- Server actions should call `requireUser()` before mutating data.
- Route handlers returning JSON should call `getSession()` or `requireUser()` and return `401` when unauthenticated.

This keeps the codebase aligned with the "server action first" rule and avoids premature client-side auth gating.

### Client Auth Usage
`lib/auth-client.ts` remains the client entry point for interactive auth flows.

Client responsibilities:

- Trigger Google sign-in from the sign-in screen.
- Trigger sign-out from the app shell.
- Surface loading and error states in the UI.

Client code should not be the source of truth for access control. It may improve UX, but all protected data access must still be enforced on the server.

## Detailed Flow Design

### Sign-In Flow
1. User opens `/sign-in`.
2. If a valid session already exists, redirect to `/`.
3. User clicks `Continue with Google`.
4. Client calls the Better Auth Google sign-in entry point.
5. Better Auth redirects the user to Google OAuth consent.
6. Google redirects back to the Better Auth callback route after successful authentication.
7. Better Auth creates or validates the session in the database.
8. On success, the user is redirected to `/`.
9. Protected layout or page retrieves the session on the server and renders the app shell.

Failure cases:

- User denies Google consent: return to `/sign-in` and show retry-safe messaging.
- Invalid or missing Google OAuth configuration: show generic retry messaging to the user and log a server-side configuration error.
- Auth service failure: show generic retry messaging.
- Missing required env configuration: fail fast in development and log a server error in deployed environments.

### Sign-Out Flow
1. Authenticated user opens the app shell.
2. User triggers sign-out from a menu or header action.
3. Client calls Better Auth sign-out.
4. Server invalidates the current session.
5. Client redirects to `/sign-in`.
6. Any subsequent access to protected routes requires a new session.

### Session Validation Flow
1. A protected route, layout, route handler, or server action starts.
2. Shared auth helper reads the request context and attempts to resolve the session.
3. If the session is valid, the helper returns normalized user data.
4. If the session is missing or expired:
   - page or layout flow: redirect to `/sign-in`
   - route handler or action flow: return or throw an unauthorized result appropriate to that entry point

## UI Specification

### Sign-In Page
Required elements:

- `Continue with Google` button.
- Pending state while request is in flight.
- Inline error state for authentication failures.
- Optional copy explaining that the app uses Google for authentication.

Preferred component approach:

- Use shadcn form primitives and input components.
- Keep styling minimal and foundation-focused.
- Match the future app shell aesthetic without blocking Step 0 on visual polish.

### App Shell Auth Entry Points
The authenticated shell should include:

- Current user identity display placeholder, at minimum email or name.
- Sign-out action in top navigation or profile dropdown.
- A loading-safe pattern so server-rendered protected pages do not briefly flash unauthenticated content.

## Security Requirements
- Never trust client auth state alone for authorization.
- Keep secrets in environment variables only.
- Do not hardcode the Better Auth base URL in committed code.
- Do not hardcode Google OAuth client credentials in committed code.
- Protect all server writes by validating session state first.
- Return generic sign-in failure messages to avoid leaking provider configuration details.
- Ensure expired or deleted sessions are treated as unauthenticated.
- Validate Google OAuth redirect URIs against the configured app URL and registered provider callback settings.

## Error Handling and Logging
- Log unexpected server-side auth errors with enough context for debugging, but without logging passwords or secrets.
- Return user-safe error messages from the sign-in page.
- Standardize unauthorized handling so later features can reuse one pattern.

Recommended categories:

- `AUTH_OAUTH_CALLBACK_FAILED`
- `AUTH_UNAUTHORIZED`
- `AUTH_CONFIGURATION_ERROR`
- `AUTH_INTERNAL_ERROR`

These identifiers do not need to be surfaced directly to end users, but they are useful in server logs and future observability work.

## Testing Strategy

### Manual Verification
- Sign in with a valid Google account and confirm redirect to `/`.
- Refresh the protected route and confirm the session persists.
- Sign out and confirm redirect to `/sign-in`.
- Re-open `/` after sign-out and confirm redirect back to `/sign-in`.
- Open `/sign-in` while authenticated and confirm redirect to `/`.
- Cancel the Google consent flow and confirm the app returns to `/sign-in` with a safe error state.

### Automated Coverage
Step 0 does not require broad auth test coverage yet, but targeted checks are recommended:

- Server helper test for unauthenticated access handling.
- Route or page protection test for redirect behavior.
- Google sign-in initiation test that verifies the provider flow is wired to Better Auth when practical.
- Sign-out action test that verifies session invalidation behavior when practical.

Broader authorization and permission tests belong to later milestones once organizations and teams exist.

## Implementation Tasks
1. Replace hardcoded Better Auth configuration values with environment-driven configuration.
2. Add Google provider configuration in `lib/auth.ts` using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
3. Add shared server-side session helper functions.
4. Create a sign-in page with Better Auth Google client integration.
5. Add an authenticated app-shell boundary that requires a session.
6. Add a sign-out UI action in the shell.
7. Standardize redirect and unauthorized behavior across protected entry points.
8. Validate the flow manually and add narrowly scoped automated checks if implementation complexity justifies them.

## Acceptance Criteria
- A signed-in user can successfully access the authenticated app shell.
- An unauthenticated user is redirected to `/sign-in` when opening protected pages.
- A signed-in user can sign out and loses access to protected routes immediately.
- Session retrieval logic is implemented once and reused across server components, route handlers, and server actions.
- Better Auth configuration is environment-driven and does not rely on hardcoded local URLs.
- Google OAuth configuration uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the environment.
- The sign-in page successfully initiates the Google OAuth flow and returns the user to the authenticated app on success.

## Future Follow-Ups
These items are intentionally deferred beyond this Step 0 scope:

- Email/password sign-up UX if self-service registration is needed.
- Password reset flow.
- Email verification flow.
- Organization-scoped onboarding after first sign-in.
- Audit log integration for sign-in and sign-out events in Step 9.
- Role and permission enrichment in Step 1 and Step 2.
