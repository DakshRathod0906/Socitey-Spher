# Changelog

All notable changes to the SocietySphere documentation have been documented in this file. 
This log tracks the "Master Documentation Overhaul" executed to align project documents with the fully realized implementation.

## [2.1.0] - 2026-07-31

### Added
- **`docs/Security.md`**: Created a centralized security architecture document consolidating JWT Auth, RBAC, Tenant Isolation (`societyId`), validation, and API security.
- **UML Diagrams**: Added four standard Mermaid diagrams across the documentation suite to fulfill academic criteria:
  - **Use Case Diagram** added to `docs/SRS.md` featuring 5 primary actors.
  - **Class Diagram** added to `docs/Architecture.md` visualizing the MVC and Service Layer routing.
  - **Entity-Relationship (ER) Diagram** added to `docs/Database.md` mapping collections.
  - **Deployment Diagram** added to `docs/Deployment.md` displaying the 4-node infrastructure.
- **Python Lifecycle**: Added a visual text-based training lifecycle pipeline to `docs/Python_Analytics.md`.

### Changed (Refined)
- **Deduplication**: Trimmed redundant security and architectural overlap across `PRD.md`, `SRS.md`, `TRD.md`, `Backend.md`, and `Database.md`. These documents now link to `Security.md` or `Architecture.md` where appropriate.
- **Scope Alignment**: Realigned PRD (Why), SRS (What), and TRD (How) to standard software engineering boundaries.
- **Terminology Standardization**: Enforced strict global terminology across all documents: "Maintenance Billing" (Financials), "Service Management" (Complaints/Work Orders), and "Service Staff" (Technicians). 

## [2.0.0] - 2026-07-31

### Added
- **`docs/Architecture.md`**: Created new documentation detailing the MERN + Python analytics architecture, Request Lifecycle, and ML Data Flow. Included Mermaid diagrams.
- **`docs/Backend.md`**: Created complete backend documentation covering folder structure, middleware (Auth, RBAC, Tenant isolation), controllers, and services.
- **`docs/Frontend.md`**: Created frontend documentation outlining the feature-based SPA architecture, Context, Hooks, and routing.
- **`docs/Database.md`**: Created detailed schema documentation listing all collections, `societyId` multi-tenancy rules, relationships, enums, and indexes.
- **`docs/API.md`**: Created central API documentation mapping Node.js endpoints (Auth, Complaints, Billing, Visitors, etc.) and Python endpoints (`/api/v1/dashboard`).
- **`docs/Python_Analytics.md`**: Documented the previously undocumented Python service, highlighting ETL pipelines, feature engineering, and model training structure.
- **`docs/Environment.md`**: Consolidated all environment variables (`.env`) for Backend, Frontend, and Python Analytics into a single reference file.
- **`docs/Deployment.md`**: Created a comprehensive local and production startup guide, stipulating the start order (Mongo -> Python -> Node -> React).
- **`docs/System_Workflow.md`**: Outlined the high-level operational lifecycle from Society Registration, to Setup, Daily Operations, and Analytics.

### Changed (Rewritten)
- **`README.md`**: Entirely rewritten to serve as a complete, professional GitHub entry point. Removed "In Progress" and "Upcoming" tags for fully integrated modules (Complaints, Billing, Python Analytics). Marked only future integrations (Payment gateways, Native mobile apps) as "Planned".
- **`docs/PRD.md`**: Updated Product Requirement Document to version 2.0. Reflected the completion of the FSD-2 & FCSP-2 integrated platform.
- **`docs/SRS.md`**: Updated Software Requirement Specification to version 2.0. Ensured functional requirements align with the actual delivered features (e.g., QR Visitor Management, ML Pipeline).
- **`docs/TRD.md`**: Updated Technical Requirement Document to version 2.0. Solidified the MERN + Python hybrid architecture as the primary technical deliverable.

### Removed
- Removed any conflicting documentation stating that the Python layer or Complaint/Billing modules were "Out of Scope" or "Not yet introduced".
