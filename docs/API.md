# API DOCUMENTATION

**Project:** SocietySphere – Multi-Tenant Smart Society Management Platform
**Version:** 1.0
**Base URL:** `http://localhost:8000/api/v1/`
**Authentication:** JWT Bearer Token

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Standard Response Formats

### Success List Response
```json
{
  "count": 25,
  "next": "http://localhost:8000/api/v1/complaints/?page=2",
  "previous": null,
  "results": [...]
}
```

### Error Response
```json
{
  "error": "Short description",
  "detail": {
    "field_name": ["Validation message"]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | Deleted (No Content) |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource Not Found |
| 409 | Conflict (e.g., duplicate bill) |
| 500 | Internal Server Error |

---

## 1. Authentication

### POST `/auth/register/`
Register a new society and its admin account.

**Auth:** Not required

**Request Body:**
```json
{
  "society_name": "Green Valley Residency",
  "address": "123 Main Road",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380001",
  "admin_name": "Priya Shah",
  "email": "priya@greenvalley.com",
  "password": "SecurePass@123"
}
```

**Success Response (201):**
```json
{
  "message": "Society registered successfully. Please verify your email.",
  "society_id": 3
}
```

---

### POST `/auth/login/`
Authenticate and receive JWT tokens.

**Auth:** Not required

**Request Body:**
```json
{
  "email": "priya@greenvalley.com",
  "password": "SecurePass@123"
}
```

**Success Response (200):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "full_name": "Priya Shah",
    "email": "priya@greenvalley.com",
    "role": "societyadmin",
    "society_id": 3
  }
}
```

---

### POST `/auth/token/refresh/`
Get a new access token using a refresh token.

**Request Body:**
```json
{ "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Response (200):**
```json
{ "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

---

### POST `/auth/logout/`
Blacklist the refresh token.

**Auth:** Required

**Request Body:**
```json
{ "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Response (204):** No content

---

### POST `/auth/password/reset/`
Request a password reset email.

**Request Body:**
```json
{ "email": "priya@greenvalley.com" }
```

**Response (200):**
```json
{ "message": "Password reset email sent." }
```

---

## 2. Society Management

### GET `/societies/me/`
Get the authenticated user's society details.

**Auth:** Required | **Role:** Society Admin

**Response (200):**
```json
{
  "id": 3,
  "name": "Green Valley Residency",
  "address": "123 Main Road",
  "city": "Ahmedabad",
  "state": "Gujarat",
  "pincode": "380001",
  "status": "active",
  "total_towers": 4,
  "total_flats": 200
}
```

---

### GET `/societies/`
List all registered societies.

**Auth:** Required | **Role:** Super Admin

**Query Params:** `?status=active&page=1`

---

### PATCH `/societies/{id}/approve/`
Approve a pending society.

**Auth:** Required | **Role:** Super Admin

**Response (200):**
```json
{ "message": "Society approved successfully." }
```

---

## 3. Towers & Flats

### GET `/towers/`
List towers in the current society.

**Auth:** Required | **Role:** Society Admin

### POST `/towers/`
Create a new tower.

**Request Body:**
```json
{
  "name": "Tower A",
  "total_floors": 10
}
```

---

### POST `/flats/generate/`
Auto-generate flats for a tower.

**Auth:** Required | **Role:** Society Admin

**Request Body:**
```json
{
  "tower_id": 1,
  "flats_per_floor": 4,
  "flat_type": "2BHK",
  "prefix": "A"
}
```

**Response (201):**
```json
{ "message": "40 flats created successfully." }
```

---

## 4. Resident Management

### POST `/residents/invite/`
Invite a resident by email.

**Auth:** Required | **Role:** Society Admin

**Request Body:**
```json
{
  "full_name": "Neha Patel",
  "email": "neha@example.com",
  "flat_id": 12,
  "resident_type": "owner",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{ "message": "Invitation sent to neha@example.com" }
```

---

### POST `/residents/activate/`
Activate a resident account via invitation token.

**Auth:** Not required

**Request Body:**
```json
{
  "token": "activation-token-from-email",
  "password": "NewPassword@123"
}
```

---

### GET `/residents/`
List all residents in the society.

**Auth:** Required | **Role:** Society Admin

**Query Params:** `?tower=A&status=active&page=1`

---

### GET `/residents/me/`
Get the current resident's profile.

**Auth:** Required | **Role:** Resident

---

### PUT `/residents/me/`
Update current resident's profile.

**Auth:** Required | **Role:** Resident

**Request Body:**
```json
{
  "full_name": "Neha Patel",
  "phone": "9876543210"
}
```

---

## 5. Visitor Management

### POST `/visitors/`
Create a visitor request and generate QR pass.

**Auth:** Required | **Role:** Resident

**Request Body:**
```json
{
  "visitor_name": "Amit Sharma",
  "purpose": "Family Visit",
  "expected_arrival": "2026-07-10T15:00:00Z"
}
```

**Response (201):**
```json
{
  "id": 88,
  "visitor_name": "Amit Sharma",
  "qr_code": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "qr_image_url": "/media/qr_codes/a1b2c3d4-e5f6-7890-abcd-ef1234567890.png",
  "status": "pending"
}
```

---

### GET `/visitors/verify/{qr_code}/`
Verify a visitor's QR code before entry.

**Auth:** Required | **Role:** Security Staff

**Response (200):**
```json
{
  "id": 88,
  "visitor_name": "Amit Sharma",
  "purpose": "Family Visit",
  "resident": "Neha Patel — Flat A-301",
  "status": "pending",
  "is_valid": true
}
```

---

### POST `/visitors/{id}/checkin/`
Record visitor entry.

**Auth:** Required | **Role:** Security Staff

**Response (200):**
```json
{
  "message": "Visitor checked in.",
  "entry_time": "2026-07-10T15:03:42Z"
}
```

---

### POST `/visitors/{id}/checkout/`
Record visitor exit.

**Auth:** Required | **Role:** Security Staff

**Response (200):**
```json
{
  "message": "Visitor checked out.",
  "exit_time": "2026-07-10T17:45:00Z"
}
```

---

## 6. Complaint Management

### POST `/complaints/`
Submit a new complaint.

**Auth:** Required | **Role:** Resident

**Request Body:**
```json
{
  "title": "Water Leakage in Corridor",
  "description": "Water is leaking from the pipeline near the B-Block staircase.",
  "category": "Plumbing",
  "photo": "<file upload — multipart/form-data>"
}
```

**Response (201):**
```json
{
  "id": 42,
  "complaint_id": "CMP-2026-0042",
  "title": "Water Leakage in Corridor",
  "status": "open",
  "ml_category": "Plumbing",
  "ml_priority": "high",
  "created_at": "2026-07-08T10:30:00Z"
}
```

---

### GET `/complaints/`
List complaints (scoped by role).

**Auth:** Required | **Roles:** Society Admin (all), Resident (own), Service Staff (assigned)

**Query Params:** `?status=open&category=Plumbing&date_from=2026-07-01`

---

### PATCH `/complaints/{id}/assign/`
Assign a complaint to service staff.

**Auth:** Required | **Role:** Society Admin

**Request Body:**
```json
{
  "assigned_to_id": 15,
  "notes": "Please inspect the pipeline on floor 3."
}
```

---

### PATCH `/complaints/{id}/update-status/`
Update complaint status and optionally upload a completion photo.

**Auth:** Required | **Role:** Service Staff

**Request Body (multipart/form-data):**
```
status: in_progress | resolved
notes: Work is in progress.
completion_photo: <file>
```

---

### PATCH `/complaints/{id}/feedback/`
Submit resident rating after complaint is resolved.

**Auth:** Required | **Role:** Resident

**Request Body:**
```json
{
  "rating": 4,
  "feedback": "Issue was resolved promptly."
}
```

---

## 7. Maintenance Billing

### POST `/bills/generate/`
Generate monthly maintenance bills for all occupied flats.

**Auth:** Required | **Role:** Society Admin

**Request Body:**
```json
{
  "month": 7,
  "year": 2026,
  "amount": 2500.00,
  "due_date": "2026-07-25"
}
```

**Response (201):**
```json
{
  "message": "Bills generated successfully.",
  "bills_created": 185,
  "skipped_duplicates": 3
}
```

---

### GET `/bills/`
List bills.

**Auth:** Required | **Roles:** Society Admin (all), Resident (own)

**Query Params:** `?month=7&year=2026&status=pending`

---

### POST `/bills/{id}/pay/`
Mark a bill as paid.

**Auth:** Required | **Role:** Resident

**Request Body:**
```json
{
  "amount_paid": 2500.00,
  "payment_mode": "online"
}
```

**Response (200):**
```json
{
  "message": "Payment recorded.",
  "receipt_number": "RCP-2026-00185",
  "payment_date": "2026-07-08T11:20:00Z"
}
```

---

### GET `/bills/{id}/receipt/`
Download payment receipt.

**Auth:** Required | **Roles:** Society Admin, Resident

**Response:** PDF file download

---

## 8. Parking Management

### GET `/parking/slots/`
List all parking slots with availability status.

**Auth:** Required | **Roles:** Society Admin, Security Staff

**Response includes:** slot_number, slot_type, is_occupied, resident name (if assigned)

---

### POST `/parking/slots/allocate/`
Assign a parking slot to a resident.

**Auth:** Required | **Role:** Society Admin

**Request Body:**
```json
{
  "slot_id": 12,
  "resident_id": 8
}
```

---

### POST `/parking/slots/visitor/`
Allocate visitor parking on entry.

**Auth:** Required | **Role:** Security Staff

**Request Body:**
```json
{
  "visitor_id": 88,
  "slot_id": 45
}
```

---

### POST `/vehicles/`
Register a vehicle.

**Auth:** Required | **Role:** Resident

**Request Body:**
```json
{
  "registration_number": "GJ01AB1234",
  "vehicle_type": "car",
  "model": "Maruti Swift",
  "color": "White"
}
```

---

## 9. Amenity Booking

### GET `/amenities/`
List all amenities in the society.

**Auth:** Required | **All roles**

---

### POST `/bookings/`
Book an amenity.

**Auth:** Required | **Role:** Resident

**Request Body:**
```json
{
  "amenity_id": 2,
  "booking_date": "2026-07-12",
  "start_time": "07:00:00",
  "end_time": "08:00:00"
}
```

**Response (201):**
```json
{
  "id": 33,
  "reference": "BKG-2026-0033",
  "amenity": "Gymnasium",
  "booking_date": "2026-07-12",
  "start_time": "07:00:00",
  "end_time": "08:00:00",
  "status": "confirmed"
}
```

**Conflict Response (409):**
```json
{
  "error": "This slot is already booked.",
  "detail": "Please choose a different time."
}
```

---

### DELETE `/bookings/{id}/`
Cancel a booking.

**Auth:** Required | **Role:** Resident (own bookings only)

**Response (204):** No content

---

## 10. Notice Board

### POST `/notices/`
Create a notice.

**Auth:** Required | **Role:** Society Admin

**Request Body (multipart/form-data):**
```
title: Water Supply Shutdown
body: Water supply will be unavailable on 10th July from 10am to 2pm.
attachment: <optional PDF file>
is_pinned: false
```

---

### GET `/notices/`
List notices.

**Auth:** Required | **All roles**

**Query Params:** `?is_pinned=true&page=1`

---

## 11. Reports

### GET `/reports/dashboard/`
Society Admin summary dashboard.

**Auth:** Required | **Role:** Society Admin

**Response (200):**
```json
{
  "total_residents": 185,
  "total_flats": 200,
  "occupied_flats": 185,
  "open_complaints": 12,
  "pending_bills": 34,
  "visitors_today": 7,
  "collection_this_month": 462500.00
}
```

---

### GET `/reports/complaints/`
Complaint analytics report.

**Auth:** Required | **Role:** Society Admin

**Query Params:** `?date_from=2026-07-01&date_to=2026-07-31`

**Response includes:** total, by_status (open/assigned/in_progress/resolved/closed), by_category, avg_resolution_days

---

### GET `/reports/billing/`
Billing collection report.

**Query Params:** `?month=7&year=2026`

**Response includes:** total_generated, total_collected, total_pending, total_overdue

---

### GET `/reports/visitors/`
Visitor activity report.

**Query Params:** `?date_from=2026-07-01&date_to=2026-07-31`

**Response includes:** total_visitors, daily_counts, top_purposes

---

## 12. Notifications

### GET `/notifications/`
List notifications for the current user.

**Auth:** Required | **All roles**

**Response:**
```json
{
  "count": 5,
  "unread_count": 2,
  "results": [
    {
      "id": 101,
      "title": "New Visitor Arrived",
      "message": "Amit Sharma has entered the society.",
      "type": "visitor",
      "is_read": false,
      "created_at": "2026-07-08T15:03:00Z"
    }
  ]
}
```

---

### PATCH `/notifications/{id}/read/`
Mark a notification as read.

**Auth:** Required

**Response (200):**
```json
{ "message": "Notification marked as read." }
```

---

## 13. ML Predictions (Optional)

### POST `/ai/category/`
Predict complaint category from description.

**Auth:** Required | **Role:** Society Admin, Resident

**Request Body:**
```json
{ "description": "Water is leaking from the pipeline on the third floor." }
```

**Response (200):**
```json
{
  "category": "Plumbing",
  "confidence": 0.87
}
```

---

### POST `/ai/priority/`
Predict complaint priority from description.

**Auth:** Required

**Request Body:**
```json
{ "description": "There was an electric spark near the lift on B block." }
```

**Response (200):**
```json
{
  "priority": "high",
  "confidence": 0.92
}
```

---

## Appendix: Role Access Matrix

| Endpoint Group | Super Admin | Society Admin | Resident | Security | Service Staff |
|---------------|:-----------:|:-------------:|:--------:|:--------:|:-------------:|
| Auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| Society Management | ✅ (all) | ✅ (own) | ❌ | ❌ | ❌ |
| Residents | ❌ | ✅ | Own only | ❌ | ❌ |
| Visitors | View all | View all | Create/own | Verify/check-in | ❌ |
| Complaints | ❌ | Manage all | Create/own | View | Assigned only |
| Billing | ❌ | Generate/view | Own bills | ❌ | ❌ |
| Parking | ❌ | Allocate | Register vehicle | Visitor parking | ❌ |
| Amenities | ❌ | Manage | Book | ❌ | ❌ |
| Notices | ❌ | Create/manage | View | View | View |
| Reports | Platform | Society | ❌ | ❌ | ❌ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| ML Predictions | ❌ | ✅ | ✅ | ❌ | ❌ |

---

*API Documentation v1.0 — SocietySphere — Lok Jagruti University — Academic Year 2026-27*
