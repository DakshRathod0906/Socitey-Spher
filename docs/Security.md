# Security Architecture

This document centralizes all security mechanisms, access controls, and multi-tenant data isolation strategies implemented in SocietySphere.

## 1. Authentication

SocietySphere uses JSON Web Tokens (JWT) for stateless authentication.
- **Login**: Upon successful login (via bcrypt password verification), the backend issues a signed JWT containing the `userId`, `role`, and `societyId`.
- **Token Transmission**: The token is passed in the `Authorization: Bearer <token>` header for all protected API requests.
- **Password Security**: All user passwords are salted and hashed using `bcryptjs` before storage in MongoDB.

## 2. Role-Based Access Control (RBAC)

Authorization is strictly enforced by the `roleMiddleware`. A user's token is decoded, and their role is verified against the route's permitted roles.

### Operational Roles
- **Super Admin**: Platform-wide management. Can view all societies.
- **Society Admin**: Full read/write access strictly within their own `societyId`.
- **Resident**: Can only access their own Flats, Complaints, Bills, and Visitors.
- **Security**: Limited access solely to the Visitor Management module for gate verification.
- **Service Staff**: (Electricians, Plumbers, etc.) Can only view and update Work Orders assigned to them.

## 3. Tenant Isolation Strategy

To prevent cross-tenant data leakage in this multi-tenant SaaS:
1. **Middleware Enforcement**: The `tenantMiddleware` runs on all requests (except Super Admin). It extracts `societyId` from the decoded JWT and attaches it to the request object (`req.societyId`).
2. **Query Level Security**: All controllers implicitly merge `{ societyId: req.societyId }` into MongoDB queries.
   ```javascript
   // Example controller query
   const complaints = await Complaint.find({ societyId: req.societyId });
   ```
3. **Index Level**: Compound unique indexes are scoped by `societyId` (e.g., `{ societyId: 1, flatNumber: 1 }`).

## 4. Input Validation & API Security

- **Validation**: All incoming payloads (`req.body`, `req.params`) are validated using `Joi` or `Zod` before reaching the controllers to prevent NoSQL injection or malformed data errors.
- **File Upload Security**: Uploads (via `Multer`) are strictly typed to allow only specific MIME types (e.g., images for complaints, PDFs for notices).
- **CORS**: Cross-Origin Resource Sharing is restricted via environment variables (`CLIENT_URL`) to ensure the Node API only accepts traffic from the trusted React frontend.

## 5. Machine Learning Service Communication

The Python Analytics API (`http://localhost:8000`) operates internally.
- The Node.js backend communicates with the Python service over a secure internal network.
- The React frontend requests analytics directly, but access is gated by the same JWT logic, verified either via a proxy in Node or shared secret validation in Python.
