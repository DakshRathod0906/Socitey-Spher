# Backend Documentation

The SocietySphere backend is built using Node.js, Express, and MongoDB (via Mongoose). It serves as the primary operational API for the platform.

## 1. Folder Structure

```text
backend/
├── config/         # Database and environment configurations
├── constants/      # Shared enums and hardcoded values (e.g., statuses)
├── controllers/    # Request handling and response formatting
├── events/         # Event emitters/listeners
├── middleware/     # Auth, RBAC, Tenant isolation, and Error handling
├── models/         # Mongoose schemas
├── routes/         # Express route definitions
├── scripts/        # Utility scripts (seeders, DB fixes, admin creation)
├── services/       # Core business logic (keeps controllers thin)
├── tests/          # Automated testing (Unit, E2E)
├── uploads/        # Local file storage for attachments (complaints, etc.)
├── utils/          # Helper functions (hashing, formatting)
├── app.js          # Express app initialization
└── server.js       # Entry point (Server listen)
```

## 2. Middleware Architecture

The backend heavily utilizes Express middleware for security and request formatting.
*(Note: For an in-depth breakdown of Auth, RBAC, and Tenant Isolation, see `Security.md`)*

- **Auth & RBAC**: Decodes JWT and validates roles.
- **Tenant Isolation**: Injects `req.societyId` for secure querying.
- **Error Handling**: Catches all unhandled exceptions, formatting them into a standard JSON response (`{ success: false, message: "...", errors: [] }`).

## 3. Controllers & Services

We adhere to a strict separation of concerns:
- **Routes** map HTTP methods to Controllers.
- **Controllers** extract `req.body`, `req.params`, and `req.user`, validate input, and call the appropriate Service function.
- **Services** execute business logic, database transactions, and cross-model interactions, returning the result to the Controller.

## 4. File Uploads

File uploads (e.g., Complaint attachments, Notice documents, Resident photos) are handled using `Multer`. Files are temporarily stored in `backend/uploads/` and served statically, or pushed to cloud storage in a production environment.

## 5. Validation

Input validation is performed at two layers:
1. **Mongoose Schema**: Enforces strict types, required fields, and enums.
2. **Controller/Service**: Enforces complex business rules (e.g., a WorkOrder cannot be closed if the Complaint is already closed).
