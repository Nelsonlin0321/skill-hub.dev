# skill-hub.dev Implementation Plan

## Goal
This document translates the product brief in `PRODUCT.md` into a step-by-step build plan for `skill-hub.dev`, with MVP work first and later phases clearly separated.

## Product Assumptions
- A skill belongs to exactly one team.
- Git import is one-time import plus manual re-sync.
- Only the skill owner, or a user with publish permission, can publish a version.
- Personal and company organizations use the same permission model.
- Browser editing is out of scope for MVP; file viewing is enough.
- Search is metadata-first for MVP, not full file content.
- Usage analytics matter, but they can ship after MVP.

## MVP Delivery Order

### Step 0. Foundation and Project Setup
Ship the platform foundation before feature work starts.

#### Build
- Set up Better Auth flows for sign in, sign out, and session handling.
  See `00_BETTER_AUTH_TECH_SPEC.md` for the technical specification for this work item.
- Add base Prisma models and migrations for organizations, teams, memberships, skills, versions, files, tags, invitations, and audit logs.
- Define app shell layout: top navigation, team switcher, sidebar, content area, and empty states.
- Establish shadcn UI primitives for forms, tables, dialogs, badges, dropdowns, tabs, and toasts.
- Create shared permission utilities for checking organization, team, and skill access on the server.
- Add file upload primitives for zip import and a server-side import pipeline abstraction for future Git import.

#### Done When
- A signed-in user can load the app shell.
- The database schema supports all MVP entities.
- Shared auth and permission checks are reusable from server actions and route handlers.

### Step 1. Organizations and Teams
Enable the top-level workspace structure first.

#### Build
- Create organization CRUD flows.
- Create team CRUD flows inside an organization.
- Add membership records that connect users to organizations and teams.
- Build organization and team settings pages.
- Add a team switcher in the main navigation.
- Enforce organization and team scoping in every query.

#### Done When
- A user can create an organization and at least one team.
- Users only see the organizations and teams they belong to.

### Step 2. Invitations and Role-Based Access
Control who can enter a workspace and what they can do.

#### Build
- Define roles for organization and team scope, such as owner, admin, editor, and viewer.
- Add invitation creation, acceptance, expiration, and revocation flows.
- Map each role to specific permissions for viewing, creating, editing, publishing, inviting, and deleting.
- Add role management UI on organization and team member pages.
- Protect server actions and routes with centralized permission checks.
- Record invitation and membership changes in the audit log.

#### Done When
- An authorized user can invite another user to an organization or team.
- Role changes immediately affect what actions the invited user can perform.

### Step 3. Skill Domain Model
Create the main product object before import and browsing flows.

#### Build
- Add `Skill` records scoped to one team.
- Add core metadata fields: name, slug, description, owner, visibility status, source type, and soft-delete state.
- Add `SkillVersion` records with draft and published states.
- Add `SkillFile` records for file path, content metadata, size, and checksum.
- Add validation rules for required metadata and manifest expectations.
- Create skill list and skill detail pages with placeholders for later sections.

#### Done When
- A team can create a skill shell with metadata.
- A skill detail page can show metadata, owner, and version summary.

### Step 4. Skill Creation From Git or Zip Upload
Enable the main ingestion workflow for new skills.

#### Build
- Add a "New Skill" flow with source selection: Git import or zip upload.
- For zip upload, parse the archive server-side, validate structure, and persist extracted files.
- For Git import, clone or fetch the repository server-side, select the target ref, and persist imported files.
- Capture source metadata such as repository URL, branch or tag, import timestamp, and imported commit SHA when available.
- Run validation checks after import and surface actionable errors to the user.
- Save the imported snapshot as the initial draft version.

#### Done When
- A user can create a skill from either zip or Git.
- The imported files appear on the skill detail page as a draft version.

### Step 5. Version History and Publish Flow
Make skill changes traceable and releasable.

#### Build
- Add version numbering and status fields such as draft, published, archived, and failed import.
- Create version history UI with timestamps, actor, source, and notes.
- Add publish action with permission checks.
- Prevent publish when required validation fails.
- Mark one version as the current published version.
- Keep prior versions immutable after publish.

#### Done When
- A user can review version history for a skill.
- An authorized user can publish a valid draft and see it become the active version.

### Step 6. File Explorer
Let users inspect imported skill contents.

#### Build
- Build a tree view for directories and files.
- Add file preview panes for text-based files and metadata-only display for unsupported binaries.
- Show file size, path, and checksum metadata.
- Add basic loading, empty, and error states for large imports.
- Keep browsing scoped to a selected skill version.

#### Done When
- A user can browse folders and open files from any stored version.
- The file explorer performs well enough for normal skill package sizes.

### Step 7. Tags and Tag Filtering
Improve organization and discovery for growing skill catalogs.

#### Build
- Add team-scoped tag creation and assignment.
- Support assigning multiple tags to a skill.
- Add tag filters to the skill listing page.
- Add tag badges on skill cards and detail pages.
- Prevent duplicate tag names within the same team.

#### Done When
- A user can tag a skill and filter the list by one or more tags.

### Step 8. Search by Name, Tag, and Metadata
Support fast discovery without full-text indexing.

#### Build
- Add indexed search fields for skill name, description, owner, source type, and tags.
- Build a search input with debounced queries.
- Add structured filters for team, tag, owner, and publication status.
- Return metadata-only search results for MVP.
- Add empty-state guidance when no skills match.

#### Done When
- A user can find skills by name, tag, and metadata from the main listing experience.

### Step 9. Basic Audit Log
Make critical actions visible and traceable.

#### Build
- Define audit events for sign-in, invite, role change, skill create, import, publish, tag change, and delete or restore.
- Persist actor, target object, timestamp, organization or team scope, and event payload.
- Build audit log pages with filters by event type, actor, and date range.
- Add audit links from organization, team, and skill pages where useful.

#### Done When
- Admin users can review the key actions that happened in their workspace.

### Step 10. Soft Delete and Recovery
Avoid irreversible mistakes in the MVP.

#### Build
- Add soft-delete fields for skills and optionally versions.
- Hide deleted records from default queries.
- Add restore flow for deleted skills.
- Restrict permanent deletion to a later phase unless there is a strong business need now.
- Record delete and restore actions in the audit log.

#### Done When
- A deleted skill disappears from normal views and can be restored by an authorized user.

### Step 11. MVP Hardening and Release Readiness
Polish the core experience before expanding scope.

#### Build
- Add authorization test coverage for critical server actions.
- Add import validation coverage for common zip and Git failure cases.
- Add pagination where lists can grow large.
- Add basic rate limits or abuse guards for invitations, imports, and auth-sensitive actions.
- Add observability for import failures and server-side errors.
- Write seed data and demo data scripts for internal review.

#### Done When
- The MVP is stable enough for internal teams to onboard and manage real skills.

## Phase 2 Build Steps
These features should start after the MVP proves the main repository and governance workflow.

### 1. Approval Workflow
- Add draft review states such as pending review, approved, and rejected.
- Require approval before publish for selected teams or skills.
- Show reviewer, decision, and decision notes in version history.

### 2. Version Diff Viewer
- Compare files and metadata between versions.
- Highlight added, removed, and changed files.
- Add side-by-side or unified diff modes for text files.

### 3. Notifications
- Notify users about invitations, publish events, review requests, and approvals.
- Start with in-app notifications, then add email if needed.

### 4. Comments and Collaboration
- Add comment threads on skill versions or specific files.
- Support mentions and resolution state for feedback threads.

### 5. Full-Text File Search
- Index file contents for text-based files.
- Combine content matches with metadata search results.

## Phase 3 Build Steps
These features support larger-scale enterprise adoption and ecosystem expansion.

### 1. API and Webhooks
- Expose API endpoints for listing skills, versions, metadata, and audit events.
- Add webhook events for import, publish, approval, and deletion.

### 2. Enterprise Security Features
- Add SSO or SAML, SCIM, access review exports, retention policies, and stronger audit export controls.

### 3. Analytics and Usage Insights
- Track skill adoption, active teams, publish frequency, and search behavior.
- Build dashboards for product and admin visibility.

### 4. External Integrations
- Integrate with internal registries, CI systems, chat tools, or developer portals.

## Suggested Delivery Milestones

### Milestone 1: Workspace Core
- Step 0 through Step 2
- Outcome: users can sign in, create workspaces, invite teammates, and manage roles

### Milestone 2: Skill Registry Core
- Step 3 through Step 5
- Outcome: teams can create skills, import them, and publish versions

### Milestone 3: Discovery and Governance
- Step 6 through Step 10
- Outcome: teams can browse, search, classify, audit, and recover skills

### Milestone 4: Production Readiness
- Step 11
- Outcome: the MVP is ready for internal rollout

## Recommended First Screens
- Sign in
- Organization and team switcher
- Organization settings
- Team settings and members
- Skills list
- Create skill
- Skill detail
- Version history
- File explorer
- Audit log

## Recommended First Prisma Models
- `Organization`
- `Team`
- `Membership`
- `Invitation`
- `Skill`
- `SkillVersion`
- `SkillFile`
- `Tag`
- `SkillTag`
- `AuditLog`

## Notes for Implementation
- Prefer server actions for authenticated writes.
- Keep all data queries scoped by organization and team from day one.
- Use shadcn components for consistency and to speed up admin-style UI delivery.
- Keep import, publish, and permission logic on the server.
- Treat file content storage as a separate concern from skill metadata so the app can evolve toward larger-scale storage later.
