# Project Vision

SocietySphere aims to provide a scalable multi-tenant residential society management platform that replaces manual administrative processes with secure digital workflows while maintaining strict tenant isolation, modular architecture, and role-based access control.

---

# Project Information

- Project Name: SocietySphere
- Version: 1.0
- Current Development Phase: Initial MVP Scaffold
- Last Updated: 2026-07-08
- Overall Progress (%): 10%

---

# Technology Stack & Architecture

**Frontend**
React + Vite + Tailwind

**Backend**
Node.js
Express.js

**Database**
MongoDB
Mongoose

**Authentication**
JWT

**Architecture**
REST API

**Deployment**
Local → Docker (Future)

---

# Non-Negotiable Rules

- **Platform-level collections** (e.g., `SuperAdmin`, `Society`) do NOT contain a `societyId`.
- **Tenant-level collections** (everything else) MUST carry `societyId`.
- Every tenant query must pass through `enforceTenant` middleware.
- Never bypass RBAC.
- Controllers remain thin.
- Business logic belongs inside services.
- Routes never access models directly.
- Frontend never hardcodes permissions.
- Every API returns a standard response structure.
- No module may directly query another module's collections without using services.

---

# Invariant Business Rules

- A Flat belongs to exactly one Tower.
- A Tower belongs to exactly one Society.
- Residents belong to one Flat.
- Visitors belong to Residents.
- Bills belong to Flats.
- Bookings cannot overlap.
- Closed complaints cannot be edited.
- Security cannot edit resident data.
- Residents cannot access another resident's data.
- Society Admins cannot access another society.

---

# Workflow & Setup Sequence

Every future module depends on this exact order:

```text
Super Admin
      │
      ▼
Approves Society
      │
      ▼
Society becomes ACTIVE
      │
      ▼
Society Admin logs in
      │
      ▼
Society Setup
      │
      ▼
Create Towers
      │
      ▼
Generate Flats
      │
      ▼
Invite Residents
```

---

# Module Dependencies

```text
Authentication
    │
    ▼
Society Management
    │
    ▼
Society Setup
    │
    ▼
Resident Management
    │
 ┌──┴───────────┐
 ▼              ▼
Visitors   Complaints
 │              │
 └──────┬───────┘
        ▼
Notifications

Residents
 │
 ├──► Billing
 ├──► Parking
 └──► Amenities

Everything
      │
      ▼
Reports
```

---

# Architecture & Service Boundaries

**Controllers**
- Validate request
- Call service
- Return response

**Services**
- Business logic
- Database transactions
- Cross-module coordination

**Models**
- Schema only
- No business logic

**Routes**
- Route mapping only

**Middleware**
- Authentication
- RBAC
- Tenant enforcement

---

# Definition of Done (DoD)

Every module must satisfy this checklist before being marked complete:

- [ ] Models
- [ ] Validation
- [ ] Controllers
- [ ] Routes
- [ ] Services
- [ ] RBAC
- [ ] Tenant Isolation
- [ ] API Tests
- [ ] Frontend Pages
- [ ] Manual Testing
- [ ] Documentation Updated
- [ ] `brain.md` Updated

---

# Validation Standards

- Every request MUST be validated.
- Never trust frontend validation.
- `ObjectId` types must be validated.
- Emails must be unique and properly formatted.
- Passwords must be hashed.
- Enum validation is required for status/type fields.
- Pagination is required for all list endpoints.

---

# Testing Standards

All code is expected to satisfy the following quality bars:
- Unit Tests
- Middleware Tests
- Controller Tests
- Service Tests
- Integration Tests
- Manual UI Tests

---

# Standard API Responses & Error Codes

**Success**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {}
}
```

**Failure**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

**Standard Error Codes**
- `AUTH_INVALID_TOKEN`
- `AUTH_FORBIDDEN`
- `VALIDATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `DUPLICATE_RESOURCE`
- `TENANT_ACCESS_DENIED`
- `SERVER_ERROR`

---

# Coding & Naming Conventions

- **File names:** `camelCase`
- **Models:** `PascalCase` (Singular, e.g., `Tower`, `Resident`)
- **Collections in DB:** `PascalCase` (Singular)
- **Controllers:** `camelCase`
- **Services:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **REST Endpoints:** `kebab-case` (Plural, e.g., `/api/societies`, `/api/towers`)
- **Environment variables:** `UPPER_SNAKE_CASE`

---

# Folder Standards

**backend/**
```text
config/
controllers/
middleware/
models/
routes/
services/
validators/
utils/
seeders/
constants/
```

**React (src/)**
```text
pages/
components/
layouts/
hooks/
services/
context/
routes/
utils/
assets/
```

---

# Milestones & Progress

Status Values: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `TESTING`, `COMPLETED`

- **Phase 1: Authentication** - `IN_PROGRESS`
- **Phase 2: Society Setup** - `NOT_STARTED`
- **Phase 3: Resident Management** - `NOT_STARTED`
- **Phase 4: Visitor Management** - `NOT_STARTED`
- **Phase 5: Complaint Management** - `NOT_STARTED`
- **Phase 6: Billing** - `NOT_STARTED`
- **Phase 7: Parking** - `NOT_STARTED`
- **Phase 8: Amenities** - `NOT_STARTED`
- **Phase 9: Reports** - `NOT_STARTED`
- **Phase 10: Polish** - `NOT_STARTED`

---

# Database & Audit Fields

**Standard Audit Fields** (Included on almost every collection)
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `societyId` (Tenant-scoped collections only)
- *Optional/Future:* `isDeleted`, `deletedAt`

**Platform Collections**
- **Society**: Owner: Platform | Contains: Users, Towers, Amenities | Tenant Scoped: NO
- **SuperAdmin**: Owner: Platform | Tenant Scoped: NO

**Tenant Collections (Scoped by societyId)**
- **User**: Owner: Society | Referenced By: Notifications | Tenant Scoped: YES
- **Tower**: Owner: Society | Contains: Flats | Tenant Scoped: YES
- **Flat**: Owner: Tower | Contains: Residents | Referenced By: Bills | Tenant Scoped: YES
- **Resident**: Owner: Flat | Contains: Visitors, Vehicles, Complaints | Tenant Scoped: YES
- **Visitor**: Owner: Resident | Tenant Scoped: YES
- **Complaint**: Owner: Resident | Tenant Scoped: YES
- **Bill**: Owner: Flat | Tenant Scoped: YES
- **ParkingSlot**: Owner: Society | Referenced By: Resident | Tenant Scoped: YES
- **Amenity**: Owner: Society | Contains: Bookings | Tenant Scoped: YES
- **Booking**: Owner: Amenity | Referenced By: Resident | Tenant Scoped: YES
- **Notice**: Owner: Society | Tenant Scoped: YES

---

# RBAC Matrix

| Module | Super Admin | Society Admin | Resident | Security | Service |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Society | Full | Read/Update Own | ❌ | ❌ | ❌ |
| Towers | ❌ | CRUD | ❌ | ❌ | ❌ |
| Residents | ❌ | CRUD | Self | Read | ❌ |
| Visitors | ❌ | Read | Create | Verify | ❌ |
| Complaints | ❌ | Manage | Create | Read | Assigned |
| Bills | ❌ | Manage | View | ❌ | ❌ |

---

# API Status

**Authentication (90%)**
- [x] Register
- [x] Login
- [ ] Refresh
- [ ] Forgot Password
- [ ] Reset Password

**Society Management**
- [ ] Approve Society
- [ ] Get Society Profile

**Society Setup**
- [ ] Create Tower
- [ ] Generate Flats

*(Other modules pending API tracking)*

---

# Frontend

**Completed Pages**
- Register Society
- Login

**Pending Pages**
- Admin Dashboard
- Society Setup (Towers/Flats)
- Residents List
- Visitor Log
- Complaints
- Billing
- Parking Allocation
- Notice Board

---

# Authentication Details

**Flow**
1. User provides email and password.
2. Backend verifies and returns JWT access and refresh tokens.
3. Frontend stores tokens and redirects based on role.

**JWT Payload**
- User ID, Role, Society ID.

**Roles**
- Super Admin, Society Admin, Resident, Security Staff, Service Staff

---

# Version History

**v0.1**
- Initial project scaffolding (Express + Vite/React)
- Basic Authentication and Society Registration scaffold
- Created `docs/API.md` for API contract
- Created `README.md` for setup instructions
- Generated `brain.md` project memory file

---

# Pending Tasks

**High Priority**
- Seed a Super Admin manually and demo the approval workflow
- Build UI and API for Society Setup (Towers and Flats)

**Medium Priority**
- Complete remaining Auth features (Refresh token, password reset)
- Resident invitation and activation flow

**Low Priority**
- Notification system

---

# Known Issues

- Need real file upload for work-order completion photos (currently a placeholder string).
- Excluded from V1.0 MVP: ML services, Payment Gateway, Mobile Apps, SMS/WhatsApp, 2FA, Redis, WebSockets, CI/CD, Audit Logs, S3.

---

# Decisions

- Multi-tenancy isolation at the database level (`societyId`).
- JWT-based Auth with RBAC middleware.
- Focus exclusively on MVP "Must Haves" for the initial 2-4 week sprint.

---

# Environment Variables

- `MONGO_URI`
- `JWT_SECRET`
- `VITE_API_URL`

---

# Next Recommended Task

**Next Task:** 
Implement Super Admin creation and basic Society Setup Flow

**Goal**
Seed a Super Admin manually and create the essential views to add Towers and Flats for a registered society, fulfilling Phase 2 requirements.

**Files to modify**
- `backend/models/Tower.js`
- `backend/models/Flat.js`
- `backend/routes/towerRoutes.js`
- `backend/controllers/towerController.js`
- `frontend/src/pages/SocietySetup.jsx`

**Expected output**
A logged-in Society Admin can navigate to a "Society Setup" page and successfully create Towers and generate Flats.

**Dependencies**
- MongoDB connection
- Auth module (already scaffolded)

**Acceptance criteria**
- [ ] Models
- [ ] Validation
- [ ] Controllers
- [ ] Routes
- [ ] Services
- [ ] RBAC
- [ ] Tenant Isolation
- [ ] API Tests
- [ ] Frontend Pages
- [ ] Manual Testing
- [ ] Documentation Updated
- [ ] `brain.md` Updated
