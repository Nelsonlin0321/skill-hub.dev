# skill-hub.dev Product Definition

## Product Summary

`skill-hub.dev` is a platform for individuals and enterprises to manage agent skill assets in a structured, secure, and searchable way. It helps teams store, version, discover, govern, and collaborate on skills across organizations and teams.

The core idea is to treat skills as managed digital assets, similar to source code or internal packages, with permissions, version history, metadata, and collaboration workflows.

## Problem Statement

Teams building agent workflows often store skills in scattered repositories, zip files, local folders, or internal documents. This creates problems:

- skills are hard to discover and reuse
- version history is inconsistent
- access control is unclear
- teams cannot easily review or govern changes
- there is no central place to search, tag, inspect, and manage skill assets

`skill-hub.dev` solves this by providing a centralized system of record for agent skills.

## Target Users

- individual builders managing personal skill libraries
- startups managing skills across small teams
- enterprises managing skill assets across organizations, teams, and departments
- platform, operations, and governance teams responsible for access and compliance

## Core Concepts

### Organization

Top-level workspace for a company or personal workspace.

### Team

A sub-group under an organization used to separate ownership, access, and collaboration boundaries.

### Skill

A managed asset that contains files, metadata, versions, tags, and permissions.

### Version

A snapshot of a skill created from a Git source or uploaded archive.

## Confirmed Core Features

These are the features confirmed from the current product idea.

### 1. Organization and Team Management

- create personal or enterprise organizations
- create teams under an organization
- invite users into an organization
- manage access at organization level
- manage access at team level

### 2. Skill Upload and Versioning

Support two ways to create or update a skill:

- connect to a Git repository and sync the skill against a selected branch, where each synced Git commit becomes a version reference for that skill
- upload a zip file manually, where a new platform-managed version is created whenever the skill is updated and uploaded again

Versioning should preserve:

- version history
- source type, such as Git or zip upload
- timestamps
- actor who created the version

Versioning model differs by source type:

- Git-connected skills use repository history, so versions are tied to branch sync state and specific commit references
- manually uploaded zip skills use application-managed version history, so versions are created based on each uploaded update rather than Git commits

### 3. File Explorer

- browse skill files from the web interface
- inspect folder structure and file content
- allow read-only viewing without requiring external tools

### 4. Tagging and Filtering

- add tags to skills
- filter skills by tags
- support repository-level and skill-level discovery through tags

### 5. Search

- search within an organization
- search within a team
- search by skill name, description, tags, and metadata

### 6. Role-Based Permissions

- create, read, update, and delete permissions for skills
- assign permissions at organization level
- assign permissions at team level
- ensure team permissions can be scoped without exposing all organization assets

## Recommended Features Missing From the Initial Scope

These features are strongly recommended to make the product more complete and practical.

### 1. Skill Metadata and Documentation Validation

A button to validate the skill with the flag if the skill is validated. The user can set auto validation whenever a skill is uploaded or updated.

### 2. Approval and Review Workflow

Before a new skill version becomes available to others, support:
- draft status
- review or approval flow
- published status
- archived or deprecated status

This is especially important for enterprise governance.

### 3. Audit Log

Track key events such as:

- skill created
- skill updated
- version uploaded
- permissions changed
- user invited or removed
- skill deleted or restored

This improves traceability and compliance.

### 4. Skill Diff and Change History
Supported only for Git-connected skills.
Users should be able to:

- compare two versions of a skill
- view file-level differences
- review metadata changes between versions

This helps users understand what changed before adopting a version.

### 5. Soft Delete and Recovery

Instead of permanent deletion by default:

- move deleted skills to trash
- allow restore within a retention window
- record who deleted the skill

This reduces accidental data loss.

### 6. Skill Discovery Experience

Support better browsing with:
- recently updated skills
- popular or frequently used skills
- skills by team or owner
- saved filters
- pinned or featured skills

### 7. Validation and Quality Checks

When a skill is imported or uploaded, validate:
- required files exist
- archive is readable
- metadata is complete
- unsupported file types are flagged
- size limits and security checks pass

### 8. Search Inside Files

In addition to metadata search, support full-text search across skill files where possible. This makes the platform significantly more useful for larger repositories.

### 9. Comments and Collaboration

Allow users to:
- comment on a skill
- leave notes on a version
- mention teammates

This supports internal review and collaboration.

### 10. Notifications

Users should be notified when:

- they are invited to an organization or team
- a skill is shared with them
- a version is updated
- an approval is requested
- access is changed

### 11. API and Automation

Enterprise users will likely need:
- API access
- webhook support
- CLI or automation support for publishing and syncing skills

This enables integration with internal developer workflows.

### 12. Security and Compliance Controls
Important enterprise requirements may include:
- SSO or SAML
- SCIM user provisioning
- encryption at rest
- access review reports
- retention policies
- IP allowlists or audit export

These can be phased in, but they should be considered early.

## Suggested MVP Scope
A practical MVP for `skill-hub.dev` could include:
- organizations and teams
- user invitation and role-based access
- skill creation from Git or zip upload
- version history
- file explorer
- tags and tag filtering
- search by name, tag, and metadata
- basic audit log
- soft delete

## Suggested Future Phases

### Phase 2
- approval workflow
- version diff viewer
- notifications
- comments and collaboration
- full-text file search

### Phase 3
- API and webhooks
- enterprise security features
- analytics and usage insights
- external integrations

## Open Product Questions
These questions should be answered before detailed design and implementation:
- what is the exact format of a "skill" and do we want a required manifest file? Answer: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices 
- can one skill belong to multiple teams, or only one team? Answer: Only one team.
- should Git sync be one-time import, manual re-sync, or continuous sync? Answer: One-time import, manual re-sync.
- who can publish a version versus upload a draft? Answer: Only the owner of the skill can publish a version or the permission to publish a version.
- do personal organizations differ from company organizations in permissions or billing? Answer: No.
- should file editing in the browser be supported later, or is viewing enough for now? Answer: supported later.
- should search return only metadata first, or full file content too? Answer: Metadata first.
- do we need usage analytics to show which skills are actively adopted? Answer: Yes.

## Product Positioning
`skill-hub.dev` can be positioned as:
"The internal system of record for agent skills."
It combines:
- repository management
- package registry thinking
- document discovery
- governance and access control
into one focused product for AI agent teams.
