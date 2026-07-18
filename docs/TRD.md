# TECHNICAL REQUIREMENTS DOCUMENT (TRD)

**Project Name:** SocietySphere – Multi-Tenant Smart Society Management Platform
**Version:** 1.0
**Document Type:** Technical Requirements Document
**Department:** Computer Science Engineering
**College:** Lok Jagruti University
**Academic Year:** 2026-27

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | DD/MM/YYYY | Project Team | Initial TRD |

---

## Table of Contents

1. Introduction
2. Technology Stack
3. System Architecture
4. Project Structure
5. Database Design
6. Authentication & Authorization Design
7. API Design
8. Module Technical Specifications
9. ML Module Design
10. Security Implementation
11. Error Handling
12. Deployment Architecture
13. Development Standards
14. Future Technical Enhancements

---

## Chapter 1 – Introduction

### 1.1 Purpose

This Technical Requirements Document (TRD) defines the complete technical design and implementation specifications for SocietySphere. It translates the functional requirements from the SRS into concrete technical decisions covering architecture, technology stack, database schema, API design, security implementation, and coding standards.

This document is intended for the development team, project reviewer, and future maintainers of the codebase.

### 1.2 Relationship to Other Documents

| Document | Role |
|----------|------|
| PRD | Defines what the product is and why it exists |
| SRS | Defines how the system should behave |
| TRD (this document) | Defines how the system will be implemented |

### 1.3 Scope

This TRD covers Version 1.0 of SocietySphere including all Must Have and Should Have modules. The ML module is documented as an optional enhancement.

---

## Chapter 2 – Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | 18.x | UI component framework |
| Vite | 5.x | Build tool and development server |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client for REST API calls |
| React Context API | Built-in | Global state (auth, user, society) |

### 2.2 Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.x LTS | JavaScript runtime |
| Express.js | 4.x | Web application framework |
| Mongoose | 8.x | MongoDB ODM |
| jsonwebtoken | 9.x | JWT generation and verification |
| bcryptjs | 2.x | Password hashing |
| cors | 2.x | Cross-origin resource sharing |
| dotenv | 16.x | Environment variable management |
| qrcode | 1.x | QR code generation |
| uuid | 9.x | Unique ID generation |
| morgan | 1.x | HTTP request logging |
| nodemon | 3.x | Dev auto-restart |

### 2.3 Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| MongoDB | 7.x | Primary NoSQL document database |
| Mongoose | 8.x | Schema definition, validation, and ORM |

### 2.4 Machine Learning (Optional Module)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11.x | ML runtime |
| Scikit-learn | 1.x | Model training and inference |
| Pandas | 2.x | Data manipulation |
| NumPy | 1.x | Numerical operations |
| Joblib | 1.x | Model serialization |
| Flask | 3.x | Lightweight REST API for ML service |

### 2.5 Development Tools

| Tool | Purpose |
|------|---------|
| Git / GitHub | Version control |
| VS Code | IDE |
| Postman | API testing |
| MongoDB Compass | Database management |
| ESLint | JavaScript linting |

---

## Chapter 3 – System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────┐
│        React Frontend (Vite)                │
│        http://localhost:5173 (dev)          │
└─────────────────┬───────────────────────────┘
                  │ HTTPS  (JSON / REST)
┌─────────────────▼───────────────────────────┐
│        Express.js Backend                   │
│        http://localhost:5000                │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐ │
│  │  Routes  │  │Controllers│  │Middleware│ │
│  └──────────┘  └───────────┘  └──────────┘ │
└────────────┬────────────────────┬───────────┘
             │                    │
┌────────────▼──────┐  ┌──────────▼──────────┐
│  MongoDB Atlas /  │  │  Python ML Service  │
│  Local MongoDB    │  │  http://localhost:   │
│  Port 27017       │  │  8001 (optional)    │
└───────────────────┘  └─────────────────────┘
```

### 3.2 Multi-Tenant Design

Every Mongoose document that stores society-specific data includes a mandatory `societyId` field:

```javascript
// Example in Complaint model
societyId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Society',
  required: true
}
```

Every controller filters queries by `societyId` extracted from the authenticated user's JWT:

```javascript
// Enforces tenant isolation in every query
const complaints = await Complaint.find({
  societyId: req.user.societyId
});
```

### 3.3 Request Lifecycle

```
HTTP Request
    │
    ▼
Express Router (routes/)
    │
    ▼
Auth Middleware (verifyToken)  ← validates JWT
    │
    ▼
Role Middleware (requireRole)  ← checks user role
    │
    ▼
Controller (controllers/)
    │
    ▼
Service Logic (inline or utils/)
    │
    ▼
Mongoose Model query
    │
    ▼
JSON Response
```

---

## Chapter 4 – Project Structure

### 4.1 Root Structure

```
societysphere/
├── frontend/          # React + Vite application
├── backend/           # Express.js + Node.js API
├── docs/              # PRD, SRS, TRD, API documentation
├── .gitignore
└── README.md
```

### 4.2 Frontend Structure

```
frontend/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── StatCard.jsx
│   │   └── StatusBadge.jsx
│   ├── pages/             # Page-level components per role
│   │   ├── auth/          # Login, Register, ForgotPassword
│   │   ├── admin/         # Society Admin pages
│   │   ├── resident/      # Resident pages
│   │   ├── security/      # Security staff pages
│   │   └── staff/         # Service staff pages
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/          # Axios API call modules
│   ├── utils/             # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

### 4.3 Backend Structure

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/               # Route handler functions
│   ├── authController.js
│   ├── societyController.js
│   ├── residentController.js
│   ├── visitorController.js
│   ├── complaintController.js
│   ├── billingController.js
│   ├── parkingController.js
│   ├── amenityController.js
│   ├── noticeController.js
│   ├── serviceController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js                # JWT verification
│   ├── tenant.js              # societyId injection
│   └── errorHandler.js        # Global error handler
├── models/                    # Mongoose schemas
│   ├── User.js
│   ├── Society.js
│   ├── Tower.js
│   ├── Flat.js
│   ├── Resident.js
│   ├── Visitor.js
│   ├── Complaint.js
│   ├── WorkOrder.js
│   ├── MaintenanceBill.js
│   ├── Expense.js
│   ├── ParkingSlot.js
│   ├── Vehicle.js
│   ├── Amenity.js
│   ├── Booking.js
│   ├── Notice.js
│   └── Notification.js
├── routes/                    # Express routers
│   ├── authRoutes.js
│   ├── societyRoutes.js
│   ├── residentRoutes.js
│   ├── visitorRoutes.js
│   ├── complaintRoutes.js
│   ├── billingRoutes.js
│   ├── parkingRoutes.js
│   ├── amenityRoutes.js
│   ├── noticeRoutes.js
│   ├── serviceRoutes.js
│   └── dashboardRoutes.js
├── utils/
│   ├── generateToken.js       # JWT generation
│   ├── idGenerator.js         # Custom ID generation
│   └── qrGenerator.js         # QR code generation
├── .env
├── .env.example
├── package.json
└── server.js                  # Entry point
```

---

## Chapter 5 – Database Design

### 5.1 Overview

SocietySphere uses **MongoDB** as its primary database. All schemas are defined using **Mongoose**. Every document that belongs to a specific society carries a `societyId` field for tenant isolation.

### 5.2 Entity Relationship Summary

```
Society
  ├── Tower → Flat → Resident → User
  ├── ParkingSlot ← Vehicle ← Resident
  ├── Amenity → Booking ← Resident
  ├── Notice
  ├── Visitor → (entry/exit log embedded)
  ├── Complaint → WorkOrder
  ├── MaintenanceBill → Payment (embedded)
  └── Expense
```

### 5.3 Mongoose Schema Definitions

#### Collection: societies

```javascript
const SocietySchema = new mongoose.Schema({
  name:         { type: String, required: true },
  address:      { type: String, required: true },
  city:         { type: String, required: true },
  state:        { type: String, required: true },
  pincode:      { type: String, required: true },
  status:       { type: String, enum: ['pending','active','suspended'], default: 'pending' },
  adminId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maintenanceAmount: { type: Number, default: 0 },
  lateFeeAmount: { type: Number, default: 0 }
}, { timestamps: true });
```

#### Collection: users

```javascript
const UserSchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  fullName:   { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },      // bcrypt hashed
  role:       { type: String, enum: ['superadmin','societyadmin','resident','security','servicestaff'], required: true },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });
```

#### Collection: towers

```javascript
const TowerSchema = new mongoose.Schema({
  societyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  name:         { type: String, required: true },
  totalFloors:  { type: Number, required: true }
}, { timestamps: true });
```

#### Collection: flats

```javascript
const FlatSchema = new mongoose.Schema({
  societyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  towerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Tower', required: true },
  floorNumber:  { type: Number, required: true },
  flatNumber:   { type: String, required: true },   // e.g., "A-301"
  flatType:     { type: String },                   // 1BHK / 2BHK / 3BHK
  isOccupied:   { type: Boolean, default: false }
}, { timestamps: true });
```

#### Collection: residents

```javascript
const ResidentSchema = new mongoose.Schema({
  societyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flatId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
  residentType: { type: String, enum: ['owner','tenant'], default: 'owner' },
  phone:        { type: String },
  moveInDate:   { type: Date }
}, { timestamps: true });
```

#### Collection: visitors

```javascript
const VisitorSchema = new mongoose.Schema({
  societyId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  residentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  visitorName:     { type: String, required: true },
  purpose:         { type: String },
  expectedArrival: { type: Date, required: true },
  qrCode:          { type: String, unique: true, required: true },
  qrImagePath:     { type: String },
  status:          { type: String, enum: ['pending','approved','inside','exited','expired'], default: 'pending' },
  entryTime:       { type: Date },
  exitTime:        { type: Date }
}, { timestamps: true });
```

#### Collection: complaints

```javascript
const ComplaintSchema = new mongoose.Schema({
  societyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  residentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  complaintId:  { type: String, unique: true },     // e.g., CMP-2026-0042
  title:        { type: String, required: true },
  description:  { type: String, required: true },
  category:     { type: String },
  priority:     { type: String, enum: ['low','medium','high'], default: 'medium' },
  status:       { type: String, enum: ['open','assigned','in_progress','resolved','closed'], default: 'open' },
  photo:        { type: String },
  mlCategory:   { type: String },
  mlPriority:   { type: String },
  rating:       { type: Number, min: 1, max: 5 },
  feedback:     { type: String }
}, { timestamps: true });
```

#### Collection: workorders

```javascript
const WorkOrderSchema = new mongoose.Schema({
  societyId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  complaintId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
  assignedTo:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:         { type: String, enum: ['assigned','in_progress','resolved'], default: 'assigned' },
  notes:          { type: String },
  completionPhoto:{ type: String },
  assignedAt:     { type: Date, default: Date.now },
  completedAt:    { type: Date }
}, { timestamps: true });
```

#### Collection: maintenancebills

```javascript
const MaintenanceBillSchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  flatId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true },
  month:      { type: Number, required: true, min: 1, max: 12 },
  year:       { type: Number, required: true },
  amount:     { type: Number, required: true },
  lateFee:    { type: Number, default: 0 },
  dueDate:    { type: Date, required: true },
  status:     { type: String, enum: ['pending','paid','overdue'], default: 'pending' },
  paidAt:     { type: Date },
  paidAmount: { type: Number },
  paymentMode:{ type: String },
  receiptNumber: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// Prevent duplicate bills per flat per month/year
MaintenanceBillSchema.index({ flatId: 1, month: 1, year: 1 }, { unique: true });
```

#### Collection: parkingslots

```javascript
const ParkingSlotSchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  slotNumber: { type: String, required: true },
  slotType:   { type: String, enum: ['resident','visitor','ev'], default: 'resident' },
  isOccupied: { type: Boolean, default: false },
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', default: null }
}, { timestamps: true });
```

#### Collection: amenities

```javascript
const AmenitySchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  name:       { type: String, required: true },
  capacity:   { type: Number },
  openTime:   { type: String },   // "06:00"
  closeTime:  { type: String },   // "22:00"
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });
```

#### Collection: bookings

```javascript
const BookingSchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  amenityId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Amenity', required: true },
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  bookingDate:{ type: Date, required: true },
  startTime:  { type: String, required: true },
  endTime:    { type: String, required: true },
  status:     { type: String, enum: ['confirmed','cancelled'], default: 'confirmed' },
  reference:  { type: String, unique: true }
}, { timestamps: true });
```

#### Collection: notices

```javascript
const NoticeSchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  title:      { type: String, required: true },
  body:       { type: String, required: true },
  attachment: { type: String },
  isPinned:   { type: Boolean, default: false },
  publishedAt:{ type: Date, default: Date.now }
}, { timestamps: true });
```

#### Collection: notifications

```javascript
const NotificationSchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  type:       { type: String, enum: ['visitor','complaint','bill','notice','booking'] },
  isRead:     { type: Boolean, default: false }
}, { timestamps: true });
```

### 5.4 Database Indexes

| Collection | Index | Purpose |
|-----------|-------|---------|
| users | `{ email: 1 }` unique | Fast login lookup |
| complaints | `{ societyId: 1, status: 1 }` | Filtered complaint lists |
| maintenancebills | `{ flatId: 1, month: 1, year: 1 }` unique | Prevent duplicate bills |
| visitors | `{ societyId: 1, status: 1 }` | Active visitor tracking |
| notifications | `{ userId: 1, isRead: 1 }` | Unread notification count |
| parkingslots | `{ societyId: 1, isOccupied: 1 }` | Available slot queries |

---

## Chapter 6 – Authentication & Authorization Design

### 6.1 Authentication Flow

```
POST /api/auth/login
    │
    ▼
Validate email + password against DB
    │
    ▼
bcryptjs.compare(password, hashedPassword)
    │
    ▼
jwt.sign({ id, role, societyId }, JWT_SECRET, { expiresIn: '24h' })
    │
    ▼
Return { token, user: { id, fullName, role, societyId } }
    │
    ▼
Frontend: store token in localStorage
    │
    ▼
All subsequent requests: Authorization: Bearer <token>
```

### 6.2 JWT Token Generation (utils/generateToken.js)

```javascript
import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      societyId: user.societyId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};
```

### 6.3 Auth Middleware (middleware/auth.js)

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### 6.4 Role Authorization Middleware

```javascript
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        detail: `Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};
```

### 6.5 Usage in Routes

```javascript
// routes/complaintRoutes.js
import { protect, requireRole } from '../middleware/auth.js';

router.post('/', protect, requireRole('resident'), createComplaint);
router.patch('/:id/assign', protect, requireRole('societyadmin'), assignComplaint);
router.patch('/:id/update-status', protect, requireRole('servicestaff'), updateStatus);
```

---

## Chapter 7 – API Design

### 7.1 Conventions

- Base URL: `/api/`
- Authentication: `Authorization: Bearer <token>`
- All request/response bodies: JSON
- Standard HTTP verbs: GET, POST, PUT, PATCH, DELETE
- Error format: `{ "error": "message", "detail": "..." }`

### 7.2 server.js Entry Point Structure

```javascript
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
// ... all other route imports

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

app.listen(process.env.PORT || 5000);
```

### 7.3 Controller Pattern

Every controller follows this pattern:

```javascript
// controllers/complaintController.js
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const complaint = await Complaint.create({
      societyId: req.user.societyId,   // Always from JWT — never from request body
      residentId: req.user.residentId,
      title,
      description,
      category,
      complaintId: generateComplaintId()
    });
    res.status(201).json(complaint);
  } catch (err) {
    next(err);  // Passed to global error handler
  }
};
```

### 7.4 API Route Summary

#### Auth Routes (`/api/auth`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/register` | No | — | Register society + admin |
| POST | `/login` | No | — | Login, receive JWT |
| POST | `/forgot-password` | No | — | Request reset email |
| POST | `/reset-password` | No | — | Confirm password reset |

#### Society Routes (`/api/societies`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/me` | Yes | societyadmin | Get own society |
| PUT | `/me` | Yes | societyadmin | Update society |
| GET | `/` | Yes | superadmin | List all societies |
| PATCH | `/:id/approve` | Yes | superadmin | Approve society |
| PATCH | `/:id/suspend` | Yes | superadmin | Suspend society |

#### Resident Routes (`/api/residents`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/invite` | Yes | societyadmin | Invite resident |
| POST | `/activate` | No | — | Activate account |
| GET | `/` | Yes | societyadmin | List residents |
| GET | `/me` | Yes | resident | Own profile |
| PUT | `/me` | Yes | resident | Update own profile |
| GET | `/:id` | Yes | societyadmin | Resident detail |
| DELETE | `/:id` | Yes | societyadmin | Deactivate resident |

#### Visitor Routes (`/api/visitors`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | resident | Create visitor + QR |
| GET | `/` | Yes | admin/resident | List visitors (scoped) |
| GET | `/verify/:qrCode` | Yes | security | Verify QR code |
| POST | `/:id/checkin` | Yes | security | Record entry |
| POST | `/:id/checkout` | Yes | security | Record exit |

#### Complaint Routes (`/api/complaints`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | Yes | resident | Create complaint |
| GET | `/` | Yes | admin/resident/staff | List (scoped) |
| GET | `/:id` | Yes | relevant roles | Complaint detail |
| PATCH | `/:id/assign` | Yes | societyadmin | Assign to staff |
| PATCH | `/:id/status` | Yes | servicestaff | Update status |
| PATCH | `/:id/feedback` | Yes | resident | Submit rating |

#### Billing Routes (`/api/billing`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/generate` | Yes | societyadmin | Generate monthly bills |
| GET | `/` | Yes | admin/resident | List bills (scoped) |
| POST | `/:id/pay` | Yes | resident | Mark as paid |
| GET | `/:id/receipt` | Yes | admin/resident | Download receipt |
| GET/POST | `/expenses` | Yes | societyadmin | Manage expenses |

#### Parking Routes (`/api/parking`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/slots` | Yes | admin/security | List slots |
| POST | `/slots/allocate` | Yes | societyadmin | Assign to resident |
| POST | `/slots/visitor` | Yes | security | Assign visitor parking |
| POST | `/slots/release` | Yes | security | Release visitor parking |
| GET/POST | `/vehicles` | Yes | admin/resident | Manage vehicles |

#### Amenity Routes (`/api/amenities`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Yes | all | List amenities |
| POST | `/` | Yes | societyadmin | Create amenity |
| GET | `/bookings` | Yes | admin/resident | List bookings |
| POST | `/bookings` | Yes | resident | Create booking |
| DELETE | `/bookings/:id` | Yes | resident | Cancel booking |

#### Notice Routes (`/api/notices`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Yes | all | List notices |
| POST | `/` | Yes | societyadmin | Create notice |
| PUT | `/:id` | Yes | societyadmin | Update notice |
| DELETE | `/:id` | Yes | societyadmin | Delete notice |
| PATCH | `/:id/pin` | Yes | societyadmin | Pin/unpin notice |

#### Dashboard Routes (`/api/dashboard`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | Yes | societyadmin | Summary statistics |

---

## Chapter 8 – Module Technical Specifications

### 8.1 Visitor QR System (utils/qrGenerator.js)

```javascript
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const generateVisitorQR = async () => {
  const token = uuidv4();
  const filePath = path.join('uploads', 'qr', `${token}.png`);
  await QRCode.toFile(filePath, token);
  return { token, filePath };
};
```

The QR code encodes a unique UUID. Security staff call `GET /api/visitors/verify/:qrCode` to validate and record entry. The system checks that `status === 'pending'` before allowing entry — preventing reuse.

### 8.2 Maintenance Bill Generation

```javascript
// controllers/billingController.js
export const generateBills = async (req, res, next) => {
  try {
    const { month, year, amount, dueDate } = req.body;
    const societyId = req.user.societyId;

    const occupiedFlats = await Flat.find({ societyId, isOccupied: true });
    const results = { created: 0, skipped: 0 };

    for (const flat of occupiedFlats) {
      const exists = await MaintenanceBill.findOne({ flatId: flat._id, month, year });
      if (exists) { results.skipped++; continue; }

      await MaintenanceBill.create({ societyId, flatId: flat._id, month, year, amount, dueDate });
      results.created++;
      // Send in-app notification to resident
    }
    res.status(201).json({ message: 'Bills generated', ...results });
  } catch (err) {
    next(err);
  }
};
```

### 8.3 Complaint Status Transitions

Valid forward-only transitions:

```javascript
const VALID_TRANSITIONS = {
  'open':        ['assigned'],
  'assigned':    ['in_progress'],
  'in_progress': ['resolved'],
  'resolved':    ['closed'],
  'closed':      []
};

export const validateTransition = (currentStatus, newStatus) => {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
};
```

### 8.4 Amenity Double-Booking Prevention

```javascript
export const checkBookingConflict = async (amenityId, bookingDate, startTime, endTime) => {
  return await Booking.findOne({
    amenityId,
    bookingDate,
    status: 'confirmed',
    startTime: { $lt: endTime },
    endTime:   { $gt: startTime }
  });
};
```

### 8.5 Custom ID Generation (utils/idGenerator.js)

```javascript
export const generateComplaintId = async () => {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  return `CMP-${year}-${String(count + 1).padStart(4, '0')}`;
};

export const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const count = await MaintenanceBill.countDocuments({ status: 'paid' });
  return `RCP-${year}-${String(count + 1).padStart(5, '0')}`;
};
```

---

## Chapter 9 – ML Module Design

### 9.1 Architecture

The ML module runs as a lightweight **Flask** REST API, separate from the Node.js backend. The Express backend calls it via HTTP when a complaint is created.

```
Express Backend
    │
    │  POST /predict/category  { description: "..." }
    ▼
Flask ML Service (localhost:8001)
    │
    ▼
Joblib model → prediction
    │
    ▼
{ category: "Plumbing", priority: "high" }
    │
    ▼
Express saves mlCategory / mlPriority to Complaint document
```

### 9.2 Model Training (ml/train.py)

```python
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

df = pd.read_csv('data/complaints.csv')
# Expected columns: description, category, priority

for target in ['category', 'priority']:
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=5000)),
        ('clf',   LogisticRegression(max_iter=300, C=1.0))
    ])
    pipeline.fit(df['description'], df[target])
    joblib.dump(pipeline, f'models/{target}_model.joblib')
    print(f"{target} model saved.")
```

### 9.3 Flask Prediction Service (ml/app.py)

```python
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
category_model = joblib.load('models/category_model.joblib')
priority_model  = joblib.load('models/priority_model.joblib')

@app.route('/predict/category', methods=['POST'])
def predict_category():
    data = request.get_json()
    description = data.get('description', '')
    if not description:
        return jsonify({'error': 'description required'}), 400
    pred = category_model.predict([description])[0]
    return jsonify({'category': pred})

@app.route('/predict/priority', methods=['POST'])
def predict_priority():
    data = request.get_json()
    description = data.get('description', '')
    if not description:
        return jsonify({'error': 'description required'}), 400
    pred = priority_model.predict([description])[0]
    return jsonify({'priority': pred})

if __name__ == '__main__':
    app.run(port=8001)
```

### 9.4 Complaint Categories

| Category | Example Keywords |
|----------|----------------|
| Plumbing | water leak, pipe burst, drainage blocked |
| Electrical | power cut, short circuit, light not working, sparks |
| Lift | lift stuck, elevator not responding |
| Cleaning | garbage not collected, common area dirty |
| Security | suspicious person, gate broken, CCTV issue |
| Parking | unauthorized vehicle, parking blocked |
| General | noise complaint, other issues |

### 9.5 Graceful Fallback

```javascript
// In complaint controller — ML call is non-blocking
const callMLService = async (description) => {
  try {
    const response = await axios.post(`${process.env.ML_SERVICE_URL}/predict/category`,
      { description }, { timeout: 3000 });
    return response.data;
  } catch {
    return { category: null, priority: null };  // Silent fallback
  }
};
```

---

## Chapter 10 – Security Implementation

### 10.1 Password Hashing

```javascript
import bcrypt from 'bcryptjs';

// On registration
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(password, salt);

// On login
const isMatch = await bcrypt.compare(plainPassword, user.password);
```

### 10.2 Environment Variables (.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/societysphere
JWT_SECRET=your-secure-random-secret-key
JWT_EXPIRES_IN=24h
ML_SERVICE_URL=http://localhost:8001
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
UPLOAD_PATH=./uploads
```

### 10.3 societyId Enforcement

The `societyId` is **always taken from the JWT**, never from the request body:

```javascript
// CORRECT
const complaints = await Complaint.find({ societyId: req.user.societyId });

// NEVER do this — would allow cross-tenant access
const complaints = await Complaint.find({ societyId: req.body.societyId });
```

### 10.4 Global Error Handler (middleware/errorHandler.js)

```javascript
export const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', detail: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate entry', detail: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
};
```

### 10.5 File Upload Validation

```javascript
import multer from 'multer';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});
```

---

## Chapter 11 – Deployment Architecture

### 11.1 Development Environment

```
Developer Machine
├── Frontend:  npm run dev     → http://localhost:5173
├── Backend:   npm run dev     → http://localhost:5000
├── Database:  MongoDB         → mongodb://localhost:27017
└── ML:        python app.py   → http://localhost:8001
```

### 11.2 Production Architecture (Reference)

```
Internet
    │
    ▼
Nginx (reverse proxy)
    ├── / → React build (static)
    └── /api/* → Node.js (pm2)
                    │
           ┌────────┴────────┐
           │                 │
       MongoDB Atlas     ML Service
       (cloud)          (optional)
```

### 11.3 Environment Configuration

| Setting | Development | Production |
|---------|-------------|------------|
| PORT | 5000 | 80 / 443 |
| MONGO_URI | localhost | MongoDB Atlas |
| JWT_SECRET | dev-secret | Strong random string |
| CORS origin | localhost:5173 | production domain |
| NODE_ENV | development | production |

---

## Chapter 12 – Development Standards

### 12.1 Backend Standards

| Rule | Detail |
|------|--------|
| ES Modules | Use `import/export` (not `require`) — `"type": "module"` in package.json |
| Async/await | Use `try/catch` + `next(err)` for all async controller functions |
| societyId | Always from `req.user.societyId`, never from request body |
| Passwords | Never log, never return in API responses |
| Validation | Validate required fields before database calls |
| Constants | Store magic values (roles, statuses) in constants files |
| Error propagation | Use `next(err)` to pass errors to the global error handler |

### 12.2 Frontend Standards

| Rule | Detail |
|------|--------|
| Components | Functional + hooks only |
| API calls | Centralised in `src/services/` — no inline Axios calls in components |
| Auth state | Managed via `AuthContext` — never stored manually |
| Route protection | `ProtectedRoute` wrapper checks auth before rendering |
| Error display | User-friendly messages from Axios error responses |
| Loading state | Show spinner/skeleton during API requests |
| Tailwind | Utility classes only — no inline styles |

### 12.3 Database Standards

| Rule | Detail |
|------|--------|
| Indexes | Add indexes on all frequently queried fields |
| societyId | Present on every society-scoped collection |
| Timestamps | Enable `{ timestamps: true }` on every Mongoose schema |
| Soft delete | Use `isActive: false` for users and residents, not hard delete |
| Unique constraints | Use `unique: true` or compound indexes for business uniqueness rules |

---

## Chapter 13 – Future Technical Enhancements

| Enhancement | Technical Approach |
|------------|-------------------|
| Mobile App | React Native — same REST API, add push notification endpoints |
| Payment Gateway | Razorpay Node.js SDK + webhook route for payment confirmation |
| Real-time Notifications | Socket.io integrated into the Express server |
| Email Queue | Nodemailer + Bull queue with Redis for async delivery |
| Cloud File Storage | AWS S3 / Cloudinary for uploaded images and attachments |
| Caching | Redis cache layer for dashboard aggregation queries |
| Containerization | Docker + Docker Compose for consistent local and production setup |
| CI/CD | GitHub Actions — lint, test, and deploy on push to main |
| Multi-language | i18next in React frontend |
| IoT Integration | MQTT broker for smart meter data ingestion |

---

## Appendix A – Technology Version Summary

| Technology | Version | License |
|-----------|---------|---------|
| Node.js | 20.x LTS | MIT |
| Express.js | 4.x | MIT |
| Mongoose | 8.x | MIT |
| React | 18.x | MIT |
| Vite | 5.x | MIT |
| Tailwind CSS | 3.x | MIT |
| MongoDB | 7.x | SSPL |
| Python | 3.11.x | PSF |
| Scikit-learn | 1.x | BSD |
| Flask | 3.x | BSD |

## Appendix B – Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 24h) |
| `ML_SERVICE_URL` | No | ML Flask service URL |
| `EMAIL_HOST` | No | SMTP host for notifications |
| `EMAIL_PORT` | No | SMTP port |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password / app password |
| `UPLOAD_PATH` | No | File upload directory path |

---

*TRD Version 1.0 — SocietySphere — Lok Jagruti University — Academic Year 2026-27*
