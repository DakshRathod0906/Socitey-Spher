# SocietySphere — Multi-Tenant Smart Society Management Platform

A MERN-stack scaffold implementing the Version 1.0 Must-Have features from the SocietySphere PRD/SRS:
Society Registration & Approval, JWT Authentication & RBAC, Society Setup (Towers/Flats), Resident
Management, Visitor Management (QR passes), Complaint Management, Service Management (work orders),
Maintenance Billing, Parking Management, Notice Board, plus Amenity Booking, basic Reports/Analytics,
and In-App Notifications.

## Project Structure

```
societysphere/
├── backend/          Express + MongoDB REST API
└── frontend/          React + Vite + Tailwind SPA
```

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a strong JWT_SECRET
npm run dev
```

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

You need a running MongoDB instance — either local (`mongodb://127.0.0.1:27017/societysphere`)
or a free MongoDB Atlas cluster (recommended if you don't want to install MongoDB locally).

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`. It expects the API at `http://localhost:5000/api`
(configurable via a `VITE_API_URL` env variable if you create a `.env` file in `frontend/`).

## 3. Using the App

1. Go to `/register-society` and register a new society — this creates the society **and**
   your Society Admin account in one step, then logs you in.
2. As Society Admin, go to **Society Setup** and add at least one Tower and one Flat.
3. Go to **Residents** and invite a resident to that flat (default password: `Welcome@123`
   unless you set one) — share the login with them, or log in separately in an incognito window.
4. Use **Auth → create-user** endpoint (or extend the UI) to create Security and Service Staff
   accounts for that society — the auth controller already supports this
   (`POST /api/auth/create-user`, Society Admin only).
5. Log in as the resident to raise complaints, generate visitor QR passes, pay bills, and
   register vehicles.
6. Log in as security staff to verify QR codes and log entry/exit.
7. Log in as service staff to view assigned work orders and mark them complete.
8. A Super Admin account isn't created automatically — insert one directly into MongoDB
   (role: `super_admin`, no `societyId`) to access the platform-level dashboard at `/super-admin`.

## Architecture Notes (matches the SRS)

- **Multi-tenancy**: every collection carries a `societyId`; the `enforceTenant` middleware
  plus per-query filters (`req.societyId`) keep each society's data isolated.
- **Auth**: JWT-based, role field embedded in the token payload; `protect` + `authorize(...)`
  middleware pair implement authentication + RBAC on every route.
- **Modules map directly to PRD Feature IDs**: F-001 Society Registration, F-002 Auth,
  F-003 Society Setup, F-004 Resident Management, F-005 Visitor Management, F-006 Complaint
  Management, F-007 Service Management, F-008 Maintenance Billing, F-009 Parking, F-010
  Amenity Booking, F-011 Notice Board, F-012 Reports (basic dashboard analytics), F-013
  Notifications (in-app only, per your scoped-down decision).

## What's Intentionally Left Out (per your scope)

Machine learning services (F-014), payment gateway integration, mobile apps, SMS/WhatsApp,
2FA, Redis, WebSockets, CI/CD, audit logs, and S3 — all excluded to match your "Must Have"
MVP scope and 2–4 week submission timeline. The architecture (societyId isolation, modular
controllers/routes) leaves room to bolt these on later without a rewrite.

## Suggested Next Steps for Your Capstone

1. Seed a Super Admin manually and demo the approval workflow.
2. Add simple form-based UI for creating Security/Service Staff accounts (currently API-only).
3. Wire up a real file upload for work-order completion photos (currently a placeholder string).
4. Add basic trend charts (e.g., a small charting library) on top of the `/api/dashboard/admin`
   aggregation data that's already returned (complaint categories, revenue trend).
5. Write a handful of Postman/Jest tests against the acceptance criteria in your SRS Chapter 12.
