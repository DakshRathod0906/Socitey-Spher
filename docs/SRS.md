# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
Project Name: SocietySphere – Multi-Tenant Smart Society Management Platform
Version: 1.0
Document Type: Software Requirements Specification (SRS)
Prepared By: <Your Team Name>
Department: Computer Science Engineering
College: Lok Jagruti University
Academic Year: 2026–2027

## Revision History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | DD/MM/YYYY | Project Team | Initial SRS |

## Approval Sheet
| Role | Name | Signature |
|------|------|-----------|
| Project Guide | | |
| Team Leader | | |
| Team Member | | |
| Team Member | | |

## Table of Contents
1. Introduction
2. Overall Description
3. System Architecture Overview
4. Functional Requirements
5. Non Functional Requirements
6. External Interface Requirements
7. Business Rules
8. Security Requirements
9. Performance Requirements
10. Acceptance Criteria
11. Appendices

---

## Chapter 1 – Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to define the functional and non-functional requirements of SocietySphere, a multi-tenant smart society management platform.
This document serves as the primary technical reference for developers, testers, project reviewers, and future maintainers. It describes the expected behavior of the system, identifies constraints, defines user interactions, and specifies the requirements necessary to implement the application successfully.
The SRS ensures that all stakeholders have a common understanding of the system before implementation begins.

### 1.2 Scope
SocietySphere is a web-based Software-as-a-Service (SaaS) application that enables multiple residential societies to manage their daily operations through a centralized platform.
The system allows each registered society to operate independently while sharing the same infrastructure. Data isolation is enforced through a multi-tenant architecture to ensure that users can access only the information belonging to their own society.
The platform supports the following core modules:
- Society Registration
- Authentication & Authorization
- Society Setup Wizard
- Resident Management
- Visitor Management
- Complaint Management
- Service Management
- Maintenance Billing
- Parking Management
- Amenity Booking
- Notice Board
- Reports & Analytics
- Notifications
- Machine Learning Services (Optional for Version 1.0)

### 1.3 Intended Audience
This document is intended for:
- **Project Team**: Frontend Developers, Backend Developers, ML Developers, Database Designers
- **Academic Reviewers**: Project Guide, Internal Evaluators, External Examiners
- **Quality Assurance**: Software Testers, Review Team
- **Future Developers**: Developers who may extend or maintain the system after the initial release.

### 1.4 Definitions
| Term | Definition |
|------|------------|
| Society | A residential community registered on the platform |
| Tenant | An independent society using the shared platform |
| Resident | A registered owner or tenant of a flat |
| Society Admin | Administrator responsible for managing one society |
| Super Admin | Platform administrator managing all societies |
| Visitor | Guest visiting a resident |
| Service Staff | Staff responsible for resolving complaints |
| QR Pass | Unique QR code issued for visitor verification |
| Work Order | Task assigned to service staff |
| Maintenance Bill | Monthly bill generated for a flat |
| Amenity | Shared facility such as a gym or clubhouse |

### 1.5 Acronyms
| Acronym | Meaning |
|---------|---------|
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| TRD | Technical Requirements Document |
| SaaS | Software as a Service |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| UI | User Interface |
| UX | User Experience |
| CRUD | Create, Read, Update, Delete |
| ML | Machine Learning |
| QR | Quick Response |
| RBAC | Role-Based Access Control |

### 1.6 References
This document is based on:
- Product Requirement Document (PRD) Version 1.0
- IEEE 29148 Software Requirements Specification guidelines
- MERN Stack documentation
- MongoDB documentation
- Express.js documentation
- React documentation
- JWT Authentication best practices
- REST API design principles

### 1.7 Document Overview
This Software Requirements Specification is organized as follows:
- **Chapter 1**: Introduction
- **Chapter 2**: Overall Description
- **Chapter 3**: System Architecture
- **Chapter 4**: Functional Requirements
- **Chapter 5**: Non-Functional Requirements
- **Chapter 6**: External Interface Requirements
- **Chapter 7**: Business Rules
- **Chapter 8**: Security Requirements
- **Chapter 9**: Performance Requirements
- **Chapter 10**: Acceptance Criteria
- **Chapter 11**: Appendices

### 1.8 Relationship with PRD
The Product Requirement Document (PRD) defines:
- Why the product exists.
- Business objectives.
- User personas.
- Product features.

This Software Requirements Specification expands those product requirements into detailed software behavior.
Every functional requirement in this document references:
- Business Requirement (BR)
- Product Feature (F)
- User Story (US)

This traceability ensures that every implemented feature directly supports an approved business objective.

### 1.9 Requirement Identification Convention
To maintain consistency throughout the project, each requirement uses a unique identifier.
| Prefix | Description |
|--------|-------------|
| BR-XXX | Business Requirement |
| F-XXX | Product Feature |
| US-XXX | User Story |
| FR-XXX | Functional Requirement |
| NFR-XXX | Non-Functional Requirement |
| API-XXX | API Endpoint |
| DB-XXX | Database Collection |
| TC-XXX | Test Case |

Example Traceability:
BR-006 -> F-006 -> US-016 -> FR-024 -> API-018 -> DB-006 -> TC-078

### 1.10 Document Objectives
The primary objectives of this SRS are to:
- Define complete software behavior for SocietySphere.
- Establish functional and non-functional requirements.
- Serve as a reference during implementation.
- Guide testing and validation.
- Reduce ambiguity between stakeholders.
- Support future maintenance and enhancement.
- Ensure consistency across development, testing, and documentation.

### 1.11 Chapter Summary
This introductory chapter defines the purpose, scope, audience, terminology, references, and organization of the Software Requirements Specification. It establishes the conventions and traceability model that will be followed throughout the remainder of the document.

---

## Chapter 2 – Overall Description

### 2.1 Introduction
This chapter provides a high-level description of SocietySphere. It explains the product's purpose, its relationship with external systems, major software functions, user roles, operating environment, design constraints, assumptions, and dependencies.

### 2.2 Product Perspective
SocietySphere is a Multi-Tenant Software-as-a-Service (SaaS) application designed for residential society management.
Unlike traditional society management software that is installed separately for each society, SocietySphere hosts multiple independent societies on a single platform while ensuring complete logical separation of data.

### 2.3 Product Functions
SocietySphere provides the following major functional areas:
- **Platform Functions**: Society Registration, Society Approval, Multi-Tenant Management, User Authentication, Role-Based Authorization
- **Society Administration**: Society Profile, Tower Management, Floor Management, Flat Management, Staff Management, Resident Invitations
- **Resident Services**: Visitor Requests, Complaint Submission, Bill Payments, Vehicle Registration, Amenity Booking, Notice Viewing
- **Security Operations**: Visitor Verification, QR Code Scanning, Entry Logging, Exit Logging, Visitor Parking
- **Service Operations**: Work Assignment, Progress Updates, Completion Images, Work History
- **Financial Operations**: Maintenance Bill Generation, Payment Tracking, Late Fee Calculation, Receipt Generation, Expense Recording
- **Reporting**: Visitor Reports, Complaint Reports, Billing Reports, Parking Reports, Service Reports
- **Machine Learning (Optional)**: Complaint Classification, Complaint Priority Prediction, Utility Consumption Forecast, Late Payment Prediction

### 2.4 User Classes
| User Class | Description |
|------------|-------------|
| Super Admin | Platform owner managing all societies |
| Society Admin | Administrator of one society |
| Resident | Owner, tenant, or family member |
| Security Staff | Gate security personnel |
| Service Staff | Electricians, plumbers, technicians, cleaners |

### 2.5 User Characteristics
- **Super Admin**: Advanced technical knowledge, Platform-level responsibilities, Full administrative privileges
- **Society Admin**: Moderate technical knowledge, Daily operational management, Responsible for one society
- **Resident**: Basic to moderate technical knowledge, Uses resident services, Access limited to personal information
- **Security Staff**: Basic technical knowledge, Uses QR scanner, Focuses on visitor management
- **Service Staff**: Basic technical knowledge, Updates work orders, Uploads completion evidence

### 2.6 Operating Environment
**Client Environment**
- Windows, Linux, macOS, Android Browser, iOS Browser
- Supported Browsers: Google Chrome, Microsoft Edge, Mozilla Firefox, Safari

**Server Environment**
- Operating System: Ubuntu Linux
- Runtime: Node.js
- Application Server: Express.js
- Database: MongoDB
- Machine Learning Service: Python

### 2.7 System Context Diagram
(See PRD text representation)

### 2.8 System Workflow
(See PRD text representation)

### 2.9 Design Constraints
The following constraints apply to Version 1.0.
- **Technology Constraints**: React.js, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, Python, Scikit-learn
- **Architecture Constraints**: Multi-tenant architecture, RESTful API, JWT Authentication, Role-Based Access Control, Modular folder structure
- **Academic Constraints**: Completion within one semester, Team of three developers, Open-source tools only

### 2.10 Assumptions
- Every society has at least one administrator.
- Every flat belongs to exactly one society.
- Every resident belongs to one flat.
- Internet access is available.
- Email service is operational.
- QR scanners use standard mobile cameras.
- ML predictions are advisory only.

### 2.11 Dependencies
| Dependency | Purpose |
|------------|---------|
| MongoDB | Database |
| SMTP Service | Email verification |
| JWT | Authentication |
| QR Code Library | Visitor verification |
| Python ML Service | Prediction APIs |
| PDF Library | Report generation |

### 2.12 Constraints on Users
Users must follow these operational rules:
- One email account per user.
- Users cannot belong to multiple societies.
- Only Society Admins can configure society settings.
- Only Super Admin can approve societies.
- Residents cannot modify financial records.
- Security Staff cannot modify complaints.
- Service Staff cannot access billing information.

### 2.13 Chapter Summary
This chapter provides an overall understanding of SocietySphere by describing its purpose, environment, user classes, architecture, system workflow, constraints, assumptions, and dependencies.

---

## Chapter 3 – System Architecture Overview

### 3.1 Introduction
This chapter presents the high-level architecture of SocietySphere. It explains how different components of the system interact to provide a secure, scalable, and maintainable multi-tenant platform.

### 3.2 Architectural Goals
- Support multiple societies on a single platform.
- Ensure complete data isolation between societies.
- Maintain modular and reusable components.
- Provide secure role-based access control.
- Simplify future feature additions.
- Support independent deployment of services.

### 3.3 High-Level System Architecture
SocietySphere uses a hybrid MERN + Python architecture.
React Frontend <-> Express Backend <-> MongoDB
MongoDB -> ETL Pipeline -> Python Analytics Service -> Dashboards

### 3.4 Layered Architecture
SocietySphere follows a five-layer architecture:
1. **Presentation Layer**: React UI, Operational Dashboards
2. **Business Logic Layer**: Node/Express Controllers, Services, Validation
3. **Data Access Layer**: Mongoose Models, MongoDB
4. **Analytics Layer (Python)**: Pandas ETL, Scikit-Learn Models, Analytics API
5. **Infrastructure Layer**: SMTP, ML Service, Cloud Storage

### 3.5 Multi-Tenant Architecture
SocietySphere is built as a single application serving multiple societies. Every record stored in the database belongs to exactly one society. Each collection contains a mandatory field: `societyId`.

### 3.6 Frontend Architecture
The frontend is developed using React.
Major responsibilities include: User Authentication, Dashboard Rendering, Form Validation, API Communication, State Management, Route Protection.

### 3.7 Backend Architecture
The backend follows a modular architecture.
Responsibilities: Authentication, Business Logic, Validation, Database Operations, Notifications, Report Generation.

### 3.8 Database Architecture
MongoDB stores all application data. Core collections include:
Societies, Users, Towers, Floors, Flats, Residents, Visitors, Complaints, WorkOrders, MaintenanceBills, Payments, ParkingSlots, Amenities, Bookings, Notices, Notifications.

### 3.9 Authentication Architecture
Authentication uses JWT (JSON Web Tokens).

### 3.10 Authorization Architecture
Authorization is based on: User Role, Society Membership.

### 3.11 Request Processing Flow
Client Request -> Route -> Authentication Middleware -> Authorization Middleware -> Input Validation -> Controller -> Service Layer -> Database -> Response

### 3.12 Module Dependency Diagram
Authentication -> Society Setup -> Resident Management -> Visitors / Complaints / Service Management -> Maintenance Billing -> Reports -> Python Analytics (FCSP-2)

### 3.13 External Services
- SMTP Server (Email verification and notifications)
- QR Library (Visitor QR generation)
- Python ML API (Predictions & Analytics)
- PDF Generator (Report export)

### 3.14 Deployment Architecture
Internet -> React Frontend -> Express API Server -> MongoDB Database -> Python ETL -> Python ML Service

### 3.15 Scalability Considerations
The architecture supports future growth through:
Modular services, RESTful APIs, Independent ML service, Stateless authentication, Database indexing, Pagination, Horizontal scaling (future).

### 3.16 Architectural Principles
The system follows these design principles:
Separation of Concerns, Single Responsibility Principle, Modular Design, Reusability, Security by Design, Least Privilege Access, Multi-Tenant Isolation, API-First Communication.

### 3.17 Chapter Summary
This chapter defines the overall software architecture of SocietySphere. It introduces the layered design, multi-tenant model, frontend and backend organization, authentication flow, request lifecycle, database structure, and external integrations.

---

## Chapter 4 – Functional Requirements

### 4.1 Introduction

This chapter defines all functional requirements for SocietySphere. Each requirement is identified by a unique ID and traces back to a business requirement (BR), product feature (F), and user story (US).

**Requirement Format:**
- **FR-XXX** — Functional Requirement ID
- **Description** — What the system shall do
- **Trace** — BR / Feature / User Story reference

---

### 4.2 FR: Authentication Module

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-001 | The system shall allow new users to register with full name, email, password, and role. | BR-002, F-002 |
| FR-002 | The system shall validate that the email address is unique across the platform. | BR-002, F-002 |
| FR-003 | The system shall hash user passwords before storing them in the database. | BR-002, F-002 |
| FR-004 | The system shall authenticate users using email and password and issue a JWT access token on success. | BR-002, F-002 |
| FR-005 | The system shall reject login attempts with invalid credentials and return an appropriate error message. | BR-002, F-002 |
| FR-006 | The system shall associate every JWT token with a user role and society ID. | BR-002, F-002 |
| FR-007 | The system shall protect all API endpoints using JWT middleware. | BR-002, F-002 |
| FR-008 | The system shall provide a password reset flow via email verification. | BR-002, F-002 |
| FR-009 | The system shall allow users to log out by invalidating the active session. | BR-002, F-002 |

---

### 4.3 FR: Society Registration & Setup

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-010 | The system shall allow a new society to register with name, address, city, state, pincode, and admin details. | BR-001, F-001, US-006 |
| FR-011 | The system shall create an admin user account automatically when a society is registered. | BR-001, F-001 |
| FR-012 | The system shall send a verification email after society registration. | BR-001, F-001 |
| FR-013 | The system shall allow the Super Admin to approve or reject society registrations. | BR-001, F-001, US-001 |
| FR-014 | The system shall provide a setup wizard for newly registered societies to configure towers, floors, flats, parking, and amenities. | BR-003, F-003, US-007 |
| FR-015 | The system shall allow the Society Admin to add multiple towers with configurable floor counts. | BR-003, F-003 |
| FR-016 | The system shall automatically generate flats based on the tower and floor configuration. | BR-003, F-003 |
| FR-017 | The system shall allow the Society Admin to configure parking slots (resident, visitor, EV). | BR-003, F-003 |
| FR-018 | The system shall allow the Society Admin to add amenities with name, capacity, and operating hours. | BR-003, F-003 |

---

### 4.4 FR: Resident Management

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-019 | The system shall allow the Society Admin to invite residents by email and assign them to a flat. | BR-004, F-004, US-008 |
| FR-020 | The system shall send an invitation email with an activation link to the invited resident. | BR-004, F-004 |
| FR-021 | The system shall allow residents to complete registration by setting their password via the activation link. | BR-004, F-004, US-013 |
| FR-022 | The system shall prevent duplicate resident registrations for the same email address. | BR-004, F-004 |
| FR-023 | The system shall allow residents to update their profile information (name, phone, photo). | BR-004, F-004, US-014 |
| FR-024 | The system shall allow the Society Admin to deactivate a resident account. | BR-004, F-004 |
| FR-025 | The system shall allow residents to add family members to their profile. | BR-004, F-004 |

---

### 4.5 FR: Visitor Management

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-026 | The system shall allow residents to create a visitor request with visitor name, purpose, and expected arrival date/time. | BR-005, F-005, US-015 |
| FR-027 | The system shall generate a unique QR code for each approved visitor request. | BR-005, F-005 |
| FR-028 | The system shall allow the resident to share the QR code with the visitor. | BR-005, F-005 |
| FR-029 | The system shall allow security staff to scan or manually verify a visitor's QR code. | BR-005, F-005, US-022 |
| FR-030 | The system shall record the visitor entry timestamp when the QR is verified. | BR-005, F-005, US-023 |
| FR-031 | The system shall prevent a visitor from using the same QR code for entry more than once. | BR-005, F-005 |
| FR-032 | The system shall allow security staff to record the visitor exit and update the exit timestamp. | BR-005, F-005, US-024 |
| FR-033 | The system shall maintain a complete visitor history searchable by date, resident, or visitor name. | BR-005, F-005 |
| FR-034 | The system shall notify the resident when their visitor has entered the society. | BR-005, F-005, F-013 |

---

### 4.6 FR: Complaint Management

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-035 | The system shall allow residents to create a complaint with title, description, category, and optional photo. | BR-006, F-006, US-016 |
| FR-036 | The system shall assign a unique complaint ID to each submitted complaint. | BR-006, F-006 |
| FR-037 | The system shall set the initial complaint status to "Open". | BR-006, F-006 |
| FR-038 | The system shall allow the Society Admin to review complaints and assign them to available service staff. | BR-006, F-006, US-010 |
| FR-039 | The system shall update the complaint status to "Assigned" after assignment. | BR-006, F-006 |
| FR-040 | The system shall notify the service staff member when a new work order is assigned to them. | BR-006, F-006, F-013 |
| FR-041 | The system shall allow service staff to update the complaint status to "In Progress". | BR-006, F-007, US-027 |
| FR-042 | The system shall allow service staff to upload completion photos and mark the complaint as "Resolved". | BR-006, F-007, US-028 |
| FR-043 | The system shall notify the resident when their complaint is resolved. | BR-006, F-006, F-013 |
| FR-044 | The system shall allow the resident to rate the resolution (1–5 stars) and optionally provide feedback. | BR-006, F-006 |
| FR-045 | The system shall set the complaint status to "Closed" after the resident submits feedback. | BR-006, F-006 |
| FR-046 | The system shall allow residents to track the full status history of their complaints. | BR-006, F-006, US-017 |
| FR-047 | The system shall prevent editing of complaints with status "Closed". | BR-006, F-006 |

---

### 4.7 FR: Maintenance Billing

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-048 | The system shall allow the Society Admin to configure the monthly maintenance amount per flat type. | BR-008, F-008 |
| FR-049 | The system shall generate maintenance bills for all occupied flats for a given month. | BR-008, F-008, US-009 |
| FR-050 | The system shall prevent duplicate bills from being generated for the same flat and month. | BR-008, F-008 |
| FR-051 | The system shall display bills to the resident in their billing dashboard. | BR-008, F-008, US-018 |
| FR-052 | The system shall allow residents to mark their bill as paid (manual payment confirmation). | BR-008, F-008 |
| FR-053 | The system shall update the payment status and record the payment date and amount. | BR-008, F-008 |
| FR-054 | The system shall apply a configurable late fee for bills unpaid after the due date. | BR-008, F-008 |
| FR-055 | The system shall generate a digital receipt upon payment confirmation. | BR-008, F-008 |
| FR-056 | The system shall allow the Society Admin to record society expenses. | BR-008, F-008 |
| FR-057 | The system shall provide a billing summary showing total bills generated, paid, pending, and overdue per month. | BR-008, F-008 |

---

### 4.8 FR: Parking Management

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-058 | The system shall allow residents to register vehicles with registration number, type, and model. | BR-009, F-009, US-019 |
| FR-059 | The system shall allow the Society Admin to assign parking slots to residents. | BR-009, F-009 |
| FR-060 | The system shall prevent two residents from being assigned the same parking slot simultaneously. | BR-009, F-009 |
| FR-061 | The system shall allow security staff to allocate visitor parking slots upon visitor entry. | BR-009, F-009, US-025 |
| FR-062 | The system shall automatically release visitor parking slots upon visitor exit. | BR-009, F-009 |
| FR-063 | The system shall display available, occupied, and reserved parking slots on the admin dashboard. | BR-009, F-009 |

---

### 4.9 FR: Amenity Booking

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-064 | The system shall display available amenities with name, capacity, and operating hours. | BR-010, F-010 |
| FR-065 | The system shall allow residents to book an amenity for a specific date and time slot. | BR-010, F-010, US-020 |
| FR-066 | The system shall prevent double booking of the same amenity slot. | BR-010, F-010 |
| FR-067 | The system shall generate a booking confirmation with a reference number. | BR-010, F-010 |
| FR-068 | The system shall allow residents to cancel their amenity booking before the booking time. | BR-010, F-010 |
| FR-069 | The system shall allow the Society Admin to disable an amenity for maintenance. | BR-010, F-010 |

---

### 4.10 FR: Notice Board

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-070 | The system shall allow the Society Admin to create notices with title, body, and optional file attachments. | BR-011, F-011, US-011 |
| FR-071 | The system shall display published notices to all residents of the same society. | BR-011, F-011, US-021 |
| FR-072 | The system shall record the publication date and time of each notice. | BR-011, F-011 |
| FR-073 | The system shall allow the Society Admin to pin important notices to the top of the notice board. | BR-011, F-011 |
| FR-074 | The system shall archive older notices and allow residents to browse the notice history. | BR-011, F-011 |

---

### 4.11 FR: Reports & Analytics

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-075 | The system shall provide a visitor report showing daily/monthly visitor counts filterable by date range. | BR-012, F-012 |
| FR-076 | The system shall provide a complaint report showing counts by status, category, and resolution time. | BR-012, F-012 |
| FR-077 | The system shall provide a billing report showing total generated, collected, pending, and overdue amounts. | BR-012, F-012 |
| FR-078 | The system shall provide a parking utilization report. | BR-012, F-012 |
| FR-079 | The system shall allow reports to be exported as PDF and Excel (CSV) files. | BR-012, F-012 |
| FR-080 | The system shall display a summary dashboard for the Society Admin on login. | BR-012, F-012 |

---

### 4.12 FR: Notifications

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-081 | The system shall send an in-app notification when a visitor arrives. | BR-013, F-013 |
| FR-082 | The system shall send an in-app notification when a complaint status is updated. | BR-013, F-013 |
| FR-083 | The system shall send an in-app notification when a maintenance bill is generated. | BR-013, F-013 |
| FR-084 | The system shall send an email notification when a bill is generated or overdue. | BR-013, F-013 |
| FR-085 | The system shall send an in-app notification when a notice is published. | BR-013, F-013 |
| FR-086 | The system shall maintain a notification inbox for each user, showing read/unread status. | BR-013, F-013 |

---

### 4.13 FR: Machine Learning Services (Optional)

| ID | Requirement | Trace |
|----|-------------|-------|
| FR-087 | The system shall automatically predict the complaint category from the complaint description text. | BR-014, F-014 |
| FR-088 | The system shall automatically predict the complaint priority (Low / Medium / High) from the description. | BR-014, F-014 |
| FR-089 | The system shall store ML predictions alongside the complaint record with a timestamp. | BR-014, F-014 |
| FR-090 | The system shall fall back gracefully to manual workflow if the ML service is unavailable. | BR-014, F-014 |
| FR-091 | The system shall allow admins to override ML-predicted category and priority values. | BR-014, F-014 |

---

## Chapter 5 – Non-Functional Requirements

### 5.1 Performance Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | API response time shall be less than 2 seconds for standard CRUD operations under normal load. |
| NFR-002 | Dashboard initial load time shall be less than 3 seconds on a standard broadband connection. |
| NFR-003 | Report generation shall complete within 10 seconds for standard date-range queries. |
| NFR-004 | The system shall support pagination for all list endpoints returning more than 20 records. |
| NFR-005 | The system shall use database indexes on societyId, userId, and status fields for all major collections. |

### 5.2 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR-006 | All user passwords shall be hashed using bcrypt with a minimum cost factor of 10 before storage. |
| NFR-007 | All API endpoints shall require a valid JWT token except registration, login, and password reset. |
| NFR-008 | JWT tokens shall include the user's role and societyId claims. |
| NFR-009 | All database queries shall filter by societyId to enforce tenant data isolation. |
| NFR-010 | The system shall validate and sanitize all user inputs to prevent injection attacks. |
| NFR-011 | CORS shall be configured to allow only trusted origins in production. |
| NFR-012 | Sensitive configuration values (database credentials, JWT secrets) shall be stored in environment variables and never committed to version control. |

### 5.3 Reliability Requirements

| ID | Requirement |
|----|-------------|
| NFR-013 | The system shall log all application errors with timestamps and stack traces. |
| NFR-014 | The system shall return meaningful HTTP error codes and user-friendly error messages for all failure scenarios. |
| NFR-015 | The system shall handle database connection failures gracefully without crashing the server process. |

### 5.4 Scalability Requirements

| ID | Requirement |
|----|-------------|
| NFR-016 | The system shall support onboarding of additional societies without code changes or data migration. |
| NFR-017 | The backend shall follow a modular architecture to allow new modules to be added without modifying existing ones. |
| NFR-018 | The ML service shall operate independently and communicate with the backend via REST API. |

### 5.5 Usability Requirements

| ID | Requirement |
|----|-------------|
| NFR-019 | The user interface shall be responsive and functional on desktop (1280px+), tablet (768px–1279px), and mobile (below 768px) screen sizes. |
| NFR-020 | Each user role shall see only the navigation items and features relevant to their role. |
| NFR-021 | All forms shall display inline validation messages for required fields, format errors, and duplicates. |
| NFR-022 | The system shall display a loading indicator during API requests that take longer than 500ms. |

### 5.6 Maintainability Requirements

| ID | Requirement |
|----|-------------|
| NFR-023 | The project shall follow a consistent folder structure separating routes, controllers, services, and models. |
| NFR-024 | All API endpoints shall be documented with request/response formats. |
| NFR-025 | Environment-specific configuration shall use `.env` files with a provided `.env.example` template. |

---

## Chapter 6 – External Interface Requirements

### 6.1 User Interface Requirements

| ID | Requirement |
|----|-------------|
| UI-001 | The system shall provide a public landing page with information about SocietySphere and a call-to-action to register or log in. |
| UI-002 | Each user role shall have a dedicated dashboard displaying role-relevant information upon login. |
| UI-003 | Navigation shall be role-specific — menu items not relevant to the current user's role shall not be visible. |
| UI-004 | The UI shall use a consistent color scheme, typography, and component library across all pages. |
| UI-005 | All data tables shall support pagination, sorting, and basic search/filtering. |

### 6.2 API Interface Requirements

| ID | Requirement |
|----|-------------|
| API-001 | All API endpoints shall follow REST conventions using standard HTTP methods (GET, POST, PUT, PATCH, DELETE). |
| API-002 | All request and response bodies shall use JSON format. |
| API-003 | All endpoints shall return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500). |
| API-004 | All protected endpoints shall validate the Authorization header containing the Bearer JWT token. |
| API-005 | API versioning shall be implemented via the URL prefix `/api/v1/`. |

### 6.3 Email Interface Requirements

| ID | Requirement |
|----|-------------|
| EMAIL-001 | The system shall use an SMTP service for sending transactional emails. |
| EMAIL-002 | Email configuration (host, port, user, password) shall be defined in environment variables. |
| EMAIL-003 | All outgoing emails shall include the SocietySphere branding and society name. |

### 6.4 ML Service Interface

| ID | Requirement |
|----|-------------|
| ML-001 | The ML service shall expose REST API endpoints for complaint category and priority prediction. |
| ML-002 | The ML service shall accept JSON input containing the complaint description and return JSON predictions. |
| ML-003 | The ML service shall be independently deployable and communicate with the backend over HTTP. |

---

## Chapter 7 – Business Rules

| ID | Rule |
|----|------|
| BR-R-001 | Every resident must belong to exactly one flat within one society. |
| BR-R-002 | Every flat must belong to exactly one society. |
| BR-R-003 | A user can hold only one role at a time. |
| BR-R-004 | Only the Society Admin can generate maintenance bills for their society. |
| BR-R-005 | A maintenance bill can only be generated once per flat per calendar month. |
| BR-R-006 | Security staff cannot create, edit, or delete resident, complaint, or billing records. |
| BR-R-007 | Service staff can only update work orders assigned to them. |
| BR-R-008 | Residents can only view and pay their own maintenance bills. |
| BR-R-009 | Amenity bookings for the same slot and amenity cannot overlap. |
| BR-R-010 | A closed complaint cannot be reopened or edited. |
| BR-R-011 | Parking slots cannot be assigned to more than one resident simultaneously. |
| BR-R-012 | A QR visitor pass can be used for entry only once. |
| BR-R-013 | ML predictions are advisory only and can be overridden by the Society Admin. |
| BR-R-014 | A society admin cannot access data belonging to another society. |
| BR-R-015 | The Super Admin cannot modify resident-level records directly. |

---

## Chapter 8 – Security Requirements

| ID | Requirement |
|----|-------------|
| SEC-001 | All passwords shall be hashed using bcrypt before storage. Plain-text passwords shall never be stored. |
| SEC-002 | JWT tokens shall have a configurable expiry (default: 24 hours for access tokens). |
| SEC-003 | JWT secrets shall be stored in environment variables and rotated periodically. |
| SEC-004 | All API endpoints shall enforce RBAC — the server shall verify both authentication and authorization for every request. |
| SEC-005 | Every database query that returns society-specific data shall include a `societyId` filter. |
| SEC-006 | User inputs shall be validated and sanitized on the server side before any database operation. |
| SEC-007 | File uploads (complaint photos, notice attachments) shall be validated for type and size before storage. |
| SEC-008 | HTTPS shall be enforced in production. |
| SEC-009 | CORS configuration shall whitelist only the production frontend origin. |
| SEC-010 | Sensitive fields (passwords, tokens) shall be excluded from all API responses. |

---

## Chapter 9 – Performance Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| PERF-001 | Standard CRUD API response time | < 2 seconds |
| PERF-002 | Dashboard initial load | < 3 seconds |
| PERF-003 | Report generation | < 10 seconds |
| PERF-004 | ML prediction API response | < 5 seconds |
| PERF-005 | Paginated list endpoints | Max 20 records per page by default |
| PERF-006 | Database indexes | Required on societyId, userId, status, and date fields |

---

## Chapter 10 – Acceptance Criteria

### 10.1 Module Acceptance Criteria

| Module | Criteria |
|--------|----------|
| Society Registration | Society created, email verified, admin account linked, setup wizard accessible |
| Authentication | Login accepted with valid credentials, rejected with invalid; JWT issued; logout invalidates session |
| Society Setup | Towers, floors, flats, parking, amenities, and staff all configurable |
| Resident Management | Invitation sent, account activated, resident linked to flat, duplicates prevented |
| Visitor Management | QR generated, entry recorded, exit recorded, no duplicate entry with same QR |
| Complaint Management | Full lifecycle: Open → Assigned → In Progress → Resolved → Closed |
| Service Management | Assigned work visible, status updated, photos uploaded, completion recorded |
| Maintenance Billing | Bills for occupied flats, no duplicate monthly bill, payment tracked, receipt generated |
| Parking Management | No double allocation, visitor parking released on exit |
| Amenity Booking | No double booking, confirmation generated, cancellation supported |
| Notice Board | Society-scoped, timestamp recorded, archive accessible |
| Reports | Date filters work, PDF and Excel export functional |
| Notifications | Delivered to correct recipient, in-app and email channels functional |

### 10.2 System-Level Acceptance Criteria

- All Must Have features are functional before submission.
- Data isolation between societies is complete — no cross-tenant data access.
- All protected API routes require valid JWT.
- Role-based dashboards show only role-relevant information.
- Application runs without critical errors on a standard development environment.

---

## Chapter 11 – Appendices

### Appendix A – Glossary

| Term | Definition |
|------|------------|
| Society | A residential community registered as a tenant on the platform |
| Tenant | An independent society using the shared SocietySphere platform |
| Resident | A registered owner or tenant of a flat within a society |
| Society Admin | The administrator responsible for managing one society |
| Super Admin | The platform owner who manages all registered societies |
| Visitor | A guest visiting a resident |
| QR Pass | A unique QR code issued for visitor verification |
| Work Order | A task assigned to service staff originating from a complaint |
| Maintenance Bill | Monthly bill generated for a flat |
| Amenity | Shared facility such as a gym, swimming pool, or community hall |
| JWT | JSON Web Token used for stateless authentication |
| RBAC | Role-Based Access Control — permissions based on user role |
| societyId | Database field enforcing tenant-level data isolation |

### Appendix B – Acronyms

| Acronym | Meaning |
|---------|---------|
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| TRD | Technical Requirements Document |
| SaaS | Software as a Service |
| JWT | JSON Web Token |
| API | Application Programming Interface |
| REST | Representational State Transfer |
| CRUD | Create, Read, Update, Delete |
| ML | Machine Learning |
| QR | Quick Response |
| RBAC | Role-Based Access Control |
| UI | User Interface |
| UX | User Experience |
| ORM | Object Relational Mapper |
| DRF | Django REST Framework |

### Appendix C – Requirement Traceability Summary

| FR Range | Module |
|----------|--------|
| FR-001 to FR-009 | Authentication |
| FR-010 to FR-018 | Society Registration & Setup |
| FR-019 to FR-025 | Resident Management |
| FR-026 to FR-034 | Visitor Management |
| FR-035 to FR-047 | Complaint Management |
| FR-048 to FR-057 | Maintenance Billing |
| FR-058 to FR-063 | Parking Management |
| FR-064 to FR-069 | Amenity Booking |
| FR-070 to FR-074 | Notice Board |
| FR-075 to FR-080 | Reports & Analytics |
| FR-081 to FR-086 | Notifications |
| FR-087 to FR-091 | Machine Learning Services |

---

*SRS Version 1.0 — SocietySphere — Lok Jagruti University — Academic Year 2026-27*
