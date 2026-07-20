# Project Vision

SocietySphere aims to provide a scalable multi-tenant residential society management platform that replaces manual administrative processes with secure digital workflows while maintaining strict tenant isolation, modular architecture, and role-based access control.

---

# Project Information

- Project Name: SocietySphere
- Version: 2.0 (Project Constitution)
- Current Development Phase: Sprint 7 – Complaint & Helpdesk Management
- Last Updated: 2026-07-20
- Overall Progress (%): 60-70%
- Project Type: Integrated FSD-2 + FCSP-2 Academic Project
- Architecture: MERN Operational Platform + Python Analytics Service

---

# Technology Stack

## Operational Platform

Frontend
- React
- Vite
- Tailwind CSS

Backend
- Node.js
- Express.js

Database
- MongoDB
- Mongoose

Authentication
- JWT

---

## Analytics Platform (Planned)

- Python
- Pandas
- NumPy
- Scikit-learn
- Matplotlib
- Joblib

Communication

Express REST API
        │
        ▼
Python Analytics Service

---

# Hybrid Architecture

React Frontend
        │
        ▼
Express REST API
        │
        ▼
MongoDB
        │
        ├──────────────► Python Analytics Service
        │                     │
        ▼                     ▼
Operational Data      ETL Pipeline
                              │
                              ▼
                  Pandas Data Cleaning
                              │
                              ▼
                    ML & Analytics
                              │
                              ▼
                 Analytics Dashboard

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
Platform Administration
      │
      ▼
Society Setup
      │
      ▼
Resident Management
      │
 ┌────┴───────────────┐
 ▼                    ▼
Visitors         Complaints
 │                    │
 └────────┬───────────┘
          ▼
   Service Management
          │
          ▼
 Maintenance Billing
          │
     ┌────┴─────┐
     ▼          ▼
 Parking   Amenities
          │
          ▼
 Notices
          │
          ▼
 Reports
          │
          ▼
 Python Analytics
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

```text
societysphere/

backend/
frontend/
python-analytics/
    app/
    models/
    datasets/
    notebooks/
    services/
    scripts/
    reports/
```

---

# Milestones & Progress

Sprint 1 – Authentication & Foundation         ✅ COMPLETED
Sprint 2 – Platform Administration             ✅ COMPLETED
Sprint 3 – Society Registration                ✅ COMPLETED
Sprint 4 – Society Setup Wizard                ✅ COMPLETED
Sprint 5 – Resident Management                 ✅ COMPLETED
Sprint 6 – Visitor Management                  ✅ COMPLETED
Sprint 7 – Complaint & Helpdesk                🚧 IN_PROGRESS
Sprint 8 – Billing                             ⏳ PLANNED
Sprint 9 – Parking                             ⏳ PLANNED
Sprint 10 – Amenities & Notices                ⏳ PLANNED
Sprint 11 – Reports                            ⏳ PLANNED
Sprint 12 – Python Analytics Integration       ⏳ PLANNED

---

# Python Analytics Rules

- Python remains an independent service.
- Express is the source of operational data.
- Python never performs CRUD on operational collections.
- Python consumes exported or API-provided data.
- ML predictions are advisory only.
- Operational workflows continue even if Python is unavailable.

---

# ETL Pipeline

```text
MongoDB
      │
      ▼
Export / API
      │
      ▼
Python ETL
      │
      ▼
Data Cleaning
      │
      ▼
EDA
      │
      ▼
Machine Learning
      │
      ▼
Predictions
      │
      ▼
Analytics Dashboard
```

---

# Environment Variables

MONGO_URI
JWT_SECRET
VITE_API_URL

ML_SERVICE_URL
ML_SERVICE_TIMEOUT

PYTHON_DATASET_PATH
MODEL_PATH

---

# Database & Audit Fields

**Standard Audit Fields** (Included on almost every collection)
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `societyId` (Tenant-scoped collections only)
- *Optional/Future:* `isDeleted`, `deletedAt`, `isArchived`, `archivedAt`

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

**Authentication (100%)**
- [x] Register
- [x] Login
- [x] Create Staff User

**Society Management (100%)**
- [x] Approve Society
- [x] Get Society Profile

**Society Setup (100%)**
- [x] Create Tower
- [x] Generate Flats

*(Other modules completed up to Sprint 6)*

---

# Frontend

**Completed Pages**
- Register Society, Login
- Admin Dashboard, Society Setup (Towers/Flats)
- Residents List, Resident Invitations
- Security Guard Dashboard, QR Scanner, Visitor History

**Pending Pages**
- Complaints & Service Dashboard
- Billing
- Parking Allocation
- Notice Board

---

# Authentication Details

**Flow**
1. User provides email and password.
2. Backend verifies and returns JWT access token.
3. Frontend stores tokens and redirects based on role.

**JWT Payload**
- User ID, Role, Society ID.

**Roles**
- Super Admin, Society Admin, Resident, Security Staff, Service Staff

---

# Next Recommended Task

**Next Task**
Sprint 7 – Complaint & Helpdesk Management

**Goals**
- Complaint lifecycle
- Work Order management
- Staff assignment
- Complaint timeline
- Resident feedback

**After Sprint 7**
- Integrate Python prediction service
- Train complaint classification model
- Build analytics dashboard
