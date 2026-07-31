# Frontend Documentation

The SocietySphere frontend is a Single Page Application (SPA) built with React, Vite, and Tailwind CSS. 

## 1. Folder Structure

```text
frontend/src/
├── app/            # Global app configuration (Redux store, if applicable)
├── assets/         # Static assets (images, icons)
├── components/     # Shared, reusable UI components
│   ├── ui/         # Buttons, inputs, modals (Tailwind-styled)
│   ├── layout/     # Sidebar, Navbar, Footer
│   └── shared/     # Domain-agnostic components
├── contexts/       # React Context providers (AuthContext, ThemeContext)
├── features/       # Feature-based module architecture
├── hooks/          # Global custom React hooks
├── layouts/        # Layout wrappers (e.g., AuthLayout, DashboardLayout)
├── routes/         # React Router definitions and protection logic
├── services/       # Global API clients (Axios instances)
├── utils/          # Helper functions (date formatting, validators)
├── App.jsx         # Root component
└── main.jsx        # React DOM render entry
```

## 2. Feature-Based Architecture

Instead of grouping files by type (e.g., all components together, all hooks together), SocietySphere uses a feature-based structure inside `src/features/`.

Example for the `complaints/` feature:
```text
features/complaints/
├── api/            # Complaint-specific API calls (Axios wrapper)
├── components/     # Complaint forms, lists, detail views
├── hooks/          # Custom hooks (useComplaints, useCreateComplaint)
├── pages/          # Full page views (ComplaintsList, ComplaintDetail)
└── utils/          # Specific helpers for complaints
```

### Key Features Discovered
`admin`, `amenities`, `analytics`, `auth`, `billing`, `complaints`, `dashboard`, `expenses`, `notices`, `parking`, `reports`, `residents`, `security`, `service`, `settings`, `setup`, `super-admin`, `visitors`, `workOrders`.

## 3. Routing & Protection

Routing is managed via `react-router-dom`.
- **Public Routes**: `/login`, `/register-society`
- **Protected Routes**: Wrapped by an `<AuthGuard>` or `<RoleGuard>` component that checks the user's JWT and role before rendering the underlying component. Redirects to `/login` if unauthorized.

## 4. State Management & Data Fetching

- **Global State**: Managed via React Context (e.g., `AuthContext` for user session and role).
- **Server State / API Caching**: (If utilized) React Query / SWR is used to fetch, cache, and synchronize data from the Express and Python APIs.
- **Form State**: Managed via `React Hook Form` and validated against `Zod` or `Yup` schemas.

## 5. Styling

Styling is achieved strictly through **Tailwind CSS**. Custom themes, colors, and fonts are defined in `tailwind.config.js`.
