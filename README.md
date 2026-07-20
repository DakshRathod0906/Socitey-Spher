# SocietySphere — Multi-Tenant Smart Society Management Platform

SocietySphere is a **combined academic project** that brings together:

* **FSD-2**: a full-stack residential society management platform
* **FCSP-2**: a Python analytics and prediction layer to be integrated later

The current codebase focuses on the **operational web platform**. The Python layer is part of the final combined scope, but it has **not been introduced yet** in the implementation.

---

## Project Structure

```text
societysphere/
├── backend/          Express + MongoDB REST API
├── frontend/         React + Vite + Tailwind SPA
└── python-analytics/ Future Python analytics service
```

---

## What SocietySphere Does

SocietySphere digitizes residential society operations through a secure multi-tenant platform.
It supports:

* Society registration and approval
* JWT authentication and role-based access control
* Society setup with towers and flats
* Resident management
* Visitor management with QR passes
* Complaint and helpdesk management
* Service management with work orders
* Maintenance billing
* Parking management
* Notice board
* Amenity booking
* Basic reports and in-app notifications
* Python-based analytics and predictions in a later phase

---

## Current Development Status

### Completed So Far

* Society registration and approval flow
* JWT authentication and RBAC
* Society setup wizard
* Resident onboarding and occupancy handling
* Security guard portal
* Visitor verification and QR workflow
* Visitor history and walk-in handling
* Complaint and helpdesk architecture planning
* WorkOrder-based service execution model

### In Progress

* Sprint 7: Complaint & Helpdesk Management

### Not Yet Introduced

* Python analytics service
* ETL pipeline
* Machine learning models
* Python prediction API
* Python-driven dashboards

---

## Technology Stack

### Current Operational Stack

* React.js
* Vite
* Tailwind CSS
* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### Future Python Layer

* Python
* Pandas
* NumPy
* Matplotlib
* Scikit-learn
* Joblib

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a strong JWT_SECRET
npm run dev
```

The API runs on `http://localhost:5000` by default.

Health check:

```http
GET /api/health
```

You need a running MongoDB instance, either:

* local: `mongodb://127.0.0.1:27017/societysphere`
* MongoDB Atlas: recommended if you do not want local installation

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

It expects the API at `http://localhost:5000/api`, configurable through `VITE_API_URL` in `frontend/.env`.

---

## Using the App

1. Go to `/register-society` and register a new society. This creates the society and the Society Admin account in one step, then logs you in.
2. As Society Admin, go to **Society Setup** and add at least one Tower and one Flat.
3. Go to **Residents** and invite a resident to that flat.
4. Use the auth endpoint `POST /api/auth/create-user` to create Security and Service Staff accounts for that society.
5. Log in as the resident to raise complaints, generate visitor QR passes, pay bills, and register vehicles.
6. Log in as security staff to verify QR codes and log entry/exit.
7. Log in as service staff to view assigned work orders and mark them complete.
8. A Super Admin account is not created automatically. Insert one directly into MongoDB with role `super_admin` and no `societyId` to access the platform dashboard at `/super-admin`.

---

## Current Architecture

### Operational Platform

```text
React Frontend
        │
        ▼
Node.js + Express API
        │
        ▼
MongoDB
```

### Planned Combined Architecture

```text
React Frontend
        │
        ▼
Node.js + Express API
        │
        ▼
MongoDB
        │
        ├──────────────► Python Analytics Service
        │                     │
        │                     ▼
        │              Pandas / Scikit-learn
        │
        ▼
Reports • Charts • Predictions
```

The Python layer will consume operational data after the core SocietySphere modules are stable.

---

## Module Map

### Completed / Built

* Authentication
* Platform Management
* Society Management
* Society Setup Wizard
* Resident Management
* Occupancy Management
* Visitor Management
* Security Guard Portal

### In Progress

* Complaint & Helpdesk Management

### Planned

* Billing & Payments
* Notices & Announcements
* Amenity Booking
* Service Dashboard
* Reports & Analytics
* Python Analytics Integration
* Machine Learning Predictions

---

## Python Integration Plan

Python is part of the combined project, but it will be introduced only after the operational workflow is stable.

### Planned Python Responsibilities

* Export operational records from MongoDB
* Load and clean data
* Perform exploratory analysis
* Generate charts and summaries
* Train prediction models
* Expose prediction endpoints later if needed

### Future Analytics Use Cases

* Complaint category prediction
* Complaint priority prediction
* Resolution time estimation
* Complaint trend analysis
* Staff workload analysis
* Monthly operational reporting

### Suggested Python Service Structure

```text
python-analytics/
├── data/
├── notebooks/
├── models/
├── scripts/
├── app/
└── requirements.txt
```

---

## Sprint Roadmap

### Sprint 1 — Authentication & Foundation

Completed

### Sprint 2 — Platform Administration

Completed

### Sprint 3 — Society Registration

Completed

### Sprint 4 — Society Setup Wizard

Completed

### Sprint 5 — Resident & Occupancy Management

Completed

### Sprint 6 — Security Guard & Visitor Management

Completed

### Sprint 7 — Complaint & Helpdesk Management

In Progress

### Sprint 8+ — Operational Expansion

Planned

### Python Analytics Integration

Planned after the core complaint and helpdesk workflow is stable

---

## Important Design Rules

* Every society is isolated by `societyId`.
* Residents can only access their own society data.
* Staff can only access assigned work.
* Complaint issues are stored separately from staff execution.
* WorkOrder is the execution layer; Complaint is the resident issue layer.
* Python is not part of the transactional workflow yet.
* Python will be added as a separate analytics layer after operational data is available.

---

## Out of Scope for Now

These are not part of the current implementation:

* Python integration
* ML model training
* Data pipelines
* Payment gateway
* Mobile app
* SMS/WhatsApp notifications
* Redis
* WebSockets
* CI/CD
* S3 storage
* 2FA

---

## Summary

SocietySphere is being built as a combined project with two parts:

1. A **full-stack society management platform** for daily operations
2. A **Python analytics layer** for later insights, reporting, and prediction

Right now, the project is focused on the operational platform. The Python module will be added after the complaint and helpdesk workflow is complete.
