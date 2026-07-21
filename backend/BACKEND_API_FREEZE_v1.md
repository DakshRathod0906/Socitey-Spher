# SocietySphere Backend API Specification v1.0.0 (Frozen)

This document serves as the official, frozen contract for the operational backend. The React frontend team should build against these specifications.

## 1. Authentication Flow
- All endpoints (except public Auth/Setup/Webhooks) require a JWT Bearer token in the `Authorization` header.
- Token format: `Authorization: Bearer <token>`
- **Tenant Isolation**: The user's JWT contains their `societyId`. The `enforceTenant` middleware automatically scopes all queries and mutations to this `societyId`. The frontend **does not** need to explicitly pass `societyId` in requests.

## 2. Standard API Response Format
All operational endpoints follow a strict, standardized response structure:

**Success Response**
```json
{
  "success": true,
  "message": "Resource processed successfully.",
  "data": { ... }
}
```

**Error Response**
```json
{
  "success": false,
  "message": "Human readable error description.",
  "errors": []
}
```

## 3. HTTP Status Codes
| Status | Meaning |
| :--- | :--- |
| `200` | Success |
| `201` | Resource created |
| `400` | Validation error / Bad request |
| `401` | Authentication required / Invalid Token |
| `403` | Permission denied (RBAC check failed) |
| `404` | Resource not found |
| `409` | Business rule conflict (duplicate bill, duplicate vehicle, overbooking, etc.) |
| `500` | Internal server error |

## 4. Common Standards

### Pagination
For list endpoints, the following query parameters are globally supported:
- `?page=1`
- `?limit=20`
- `?search=xyz`
- `?sortBy=createdAt`
- `?order=desc`

### Date & Time Formats
- **Date**: `YYYY-MM-DD`
- **Time**: `HH:mm` (24-hour)
- **Timestamp**: ISO 8601 UTC (e.g. `2030-01-01T12:00:00.000Z`)

### Soft Delete Policy
Records in the operational database are generally **not physically deleted** to maintain audit trails and analytics integrity.
- Residents: Marked as `inactive` (Occupancy status update)
- Amenities: `isActive = false`
- Parking Slots: `DISABLED`
- Bills: `CANCELLED`
- Bookings: `CANCELLED`

## 5. Core Entities & Status Enums

| Entity | Status Enums |
| :--- | :--- |
| **Society** | `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `ACTIVE`, `REJECTED`, `SUSPENDED`, `ARCHIVED` |
| **User (Role)** | `super_admin`, `society_admin`, `resident`, `security_guard`, `staff` |
| **Occupancy** | `ACTIVE`, `INACTIVE`, `PENDING`, `REJECTED` |
| **Complaint** | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `REJECTED` |
| **Visitor** | `PENDING`, `APPROVED`, `REJECTED`, `CHECKED_IN`, `CHECKED_OUT` |
| **Bill** | `PENDING`, `PARTIAL`, `PAID`, `CANCELLED` |
| **Booking** | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| **ParkingSlot**| `AVAILABLE`, `ALLOCATED`, `MAINTENANCE`, `DISABLED` |
| **Vehicle** | `ACTIVE`, `INACTIVE` |

## 6. High-Level REST Endpoints

### Auth
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Authenticate & get JWT
- `GET /api/auth/me` - Get current user profile

### Society Setup & Management
- `POST /api/setup/initialize` - Initialize society and admin
- `GET /api/societies` - List societies (Super Admin)
- `GET /api/societies/:id` - Society details

### Residents
- `GET /api/residents` - List residents
- `POST /api/residents` - Add resident
- `PATCH /api/residents/:id/deactivate` - Soft-delete resident

### Security & Visitors
- `POST /api/visitors` - Pre-approve visitor (Resident)
- `PATCH /api/visitors/:id/status` - Update visitor status (Security/Resident)
- `GET /api/visitors` - List visitors

### Complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - List complaints (filtered by role)
- `PATCH /api/complaints/:id/status` - Update status (Admin)

### Billing & Payments
- `POST /api/billing/generate` - Bulk generate monthly maintenance bills
- `GET /api/billing/bills` - List bills
- `POST /api/billing/payments` - Record payment
- `POST /api/billing/expenses` - Record society expense
- `GET /api/billing/dashboard` - Get billing aggregates (billed, collected, outstanding, net)

### Amenities
- `POST /api/amenities` - Create amenity (Admin)
- `GET /api/amenities` - List amenities
- `POST /api/amenities/bookings` - Create booking
- `GET /api/amenities/bookings` - List bookings
- `PUT /api/amenities/bookings/:id/cancel` - Cancel booking

### Parking
- `POST /api/parking/vehicles` - Register vehicle (License plate normalized automatically)
- `POST /api/parking/slots` - Create slot (Admin)
- `POST /api/parking/slots/:id/allocate` - Assign slot to vehicle/user
- `PUT /api/parking/slots/:id/occupancy` - Update physical presence (isOccupied)
- `GET /api/parking/slots` - List slots

## 7. Frozen Business Rules
1. **Duplicate Prevention**: 
   - Bills: Cannot generate bills twice for the same flat in the same billing cycle.
   - Vehicles: Cannot register the same normalized license plate in the same society.
   - Parking: A vehicle can only have one active slot allocation.
2. **Payment Protection**:
   - Cannot pay a CANCELLED bill.
   - Cannot overpay a bill (amountPaid + newAmount <= totalAmount).
3. **Amenity Capacity**:
   - `capacity` represents the maximum allowed *concurrently overlapping* bookings. Overlaps exceeding capacity are rejected atomically.
4. **Tenant Isolation**:
   - Enforced aggressively at the API layer. Residents/Admins from Society A cannot read/write data in Society B under any circumstances.

## 8. Operational Boundary & Versioning Strategy
**Operational Boundary**:
The Express.js backend is the source of truth for operational data. The Django analytics platform consumes this data through ETL processes and performs read-only analytics. Analytics services never modify operational records.

**Versioning Strategy**:
From v1.0.0, this architecture is **STABLE**. 
- **Major (2.0.0)**: Breaking API changes.
- **Minor (1.1.0)**: New endpoints or optional fields.
- **Patch (1.0.1)**: Bug fixes only.
Any required additions going forward will be strictly additive.
