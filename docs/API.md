# SocietySphere API Documentation

This document provides a comprehensive overview of the SocietySphere backend and Python analytics APIs.

## Base URLs

- **Node.js Operational API**: `http://localhost:5000/api`
- **Python Analytics API**: `http://localhost:8000/api/v1`

## Authentication & Authorization

All protected endpoints require a valid JWT passed in the `Authorization` header as a Bearer token.
`Authorization: Bearer <your_jwt_token>`

Role-based access control (RBAC) is enforced. Endpoints denote which roles have access:
`[SA]` Super Admin | `[A]` Society Admin | `[R]` Resident | `[G]` Security Guard | `[S]` Service Staff

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register a new society and its admin |
| POST | `/login` | Public | Authenticate user and receive JWT |
| GET | `/me` | Any | Get current logged-in user profile |
| POST | `/create-staff` | `[A]` | Admin creates security/service staff accounts |

---

## 2. Society Setup (`/api/setup`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/towers` | `[A]` | Add new towers to the society |
| POST | `/flats/generate` | `[A]` | Bulk generate flats for a tower |
| GET | `/progress` | `[A]` | Get society setup completion status |

---

## 3. Residents & Occupancy (`/api/residents`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/invite` | `[A]` | Send an invitation to a new resident |
| GET | `/` | `[A, R]` | List residents in the society |
| GET | `/:id` | `[A, R]` | Get resident profile |

---

## 4. Visitor Management (`/api/visitors`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | `[R]` | Pre-approve a visitor (Generates QR) |
| GET | `/` | `[A, R, G]`| List visitors (Scoped to role) |
| POST | `/verify` | `[G]` | Verify QR code at the gate |
| PUT | `/:id/status` | `[G]` | Update visitor status (ENTERED, EXITED) |

---

## 5. Helpdesk (Complaints & Work Orders)

**Complaints (`/api/complaints`)**
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | `[R]` | Resident logs a new complaint |
| GET | `/` | `[A, R]` | List complaints |
| PUT | `/:id/status`| `[A]` | Change complaint status (Resolved/Closed) |

**Work Orders (`/api/workOrders`)**
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | `[A]` | Assign a complaint to service staff |
| GET | `/` | `[A, S]` | List assigned work orders |
| PUT | `/:id/status`| `[S]` | Update progress on work order |

---

## 6. Financials (Billing & Expenses)

**Billing (`/api/bills`)**
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/generate` | `[A]` | Generate monthly maintenance bills |
| GET | `/` | `[A, R]` | List bills |
| POST | `/:id/pay` | `[R]` | Mark a bill as paid |

**Expenses (`/api/expenses`)**
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | `[A]` | Record a society expense |
| GET | `/` | `[A]` | List society expenses |

---

## 7. Facilities (`/api/amenities`, `/api/parking`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/amenities/book` | `[R]` | Book an amenity |
| GET | `/parking` | `[A, R]` | List parking slots |

---

## 8. Dashboard (`/api/dashboard`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin` | `[A]` | Aggregated stats for society admin |
| GET | `/resident` | `[R]` | Resident's active complaints, bills, visitors |
| GET | `/super-admin` | `[SA]` | Platform-wide society statistics |

---

## 9. Python Analytics API (`http://localhost:8000/api/v1`)

The frontend interacts with the Python API for predictive analytics and deep insights.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | ML-driven dashboard metrics |
| GET | `/pipeline` | ETL pipeline execution status |
| GET | `/complaints/summary` | Predictive insights on complaints |
| GET | `/expenses/summary` | Financial forecasting and trends |
| GET | `/visitors/summary` | Peak traffic predictions |

## Standard API Responses

**Success Response (200/201)**
```json
{
  "success": true,
  "message": "Resource successfully fetched",
  "data": { ... }
}
```

**Error Response (4xx/5xx)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Email is required", "Invalid status"]
}
```
