# Technical Requirement Document (TRD)

**Project Name**: SocietySphere
**Version**: 2.0 (Final Implementation)

## 1. Overview
This document outlines the technical constraints, core stack, and non-functional requirements of SocietySphere. For detailed architectural layout, refer to `Architecture.md`. For security policies, refer to `Security.md`.

## 2. Technology Stack
- **Client Presentation**: React 18, Vite, Tailwind CSS, Axios, React Router Dom.
- **Operational Server**: Node.js, Express, Mongoose, Multer (file handling).
- **Primary Database**: MongoDB (Atlas or Local).
- **Analytics Service**: Python 3.x, Pandas, Scikit-Learn, Joblib, FastAPI/Flask (for API serving).

## 3. Non-Functional Requirements (NFR)

### 3.1 Scalability & Decoupling
- The operational Node.js server and the Python Analytics engine must operate as fully decoupled microservices.
- Heavy data processing, synthetic generation, and machine learning inference must not block the Event Loop of the Node.js API.

### 3.2 Performance
- Transactional API responses (CRUD operations) should resolve within 200ms.
- Model predictions via the Python API should leverage pre-loaded `.joblib` models to minimize inference latency.

### 3.3 Usability & Client Support
- The frontend UI must be fully responsive, ensuring accessibility across mobile and desktop viewports using utility-first CSS (Tailwind).
- The client must handle JWT token storage securely and gracefully handle session expiration.

## 4. Reference Documents
To prevent documentation redundancy, specific technical implementations have been isolated:
- **System Architecture**: See `docs/Architecture.md`
- **Security & Authorization**: See `docs/Security.md`
- **Database Schemas**: See `docs/Database.md`
- **API Contracts**: See `docs/API.md`
