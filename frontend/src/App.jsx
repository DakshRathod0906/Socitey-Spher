import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./app/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { useOfflineDetection } from "./hooks/useOfflineDetection.jsx";

import { MainLayout, AuthLayout, PublicLayout } from "./layouts";
import { LoadingScreen } from "./components/feedback";

// Lazy Loaded Pages
const Landing = lazy(() => import("./app/Landing"));

// Auth
const Login = lazy(() => import("./features/auth/Login"));
const Register = lazy(() => import("./features/auth/Register"));
const VerifyEmail = lazy(() => import("./features/auth/VerifyEmail"));
const AcceptInvitation = lazy(() => import("./features/auth/AcceptInvitation"));

// Super Admin
const SuperAdminDashboard = lazy(() => import("./features/super-admin/SuperAdminDashboard"));
const SocietyDetails = lazy(() => import("./features/super-admin/SocietyDetails"));
const SocietyAdmins = lazy(() => import("./features/super-admin/SocietyAdmins"));

// Admin
const AdminDashboard = lazy(() => import("./features/dashboard/AdminDashboard"));
const SetupWizard = lazy(() => import("./features/setup/SetupWizard"));
const CreateSociety = lazy(() => import("./features/admin/CreateSociety"));
const PendingApproval = lazy(() => import("./features/admin/PendingApproval"));
const Residents = lazy(() => import("./features/residents/ResidentsLayout"));
const Visitors = lazy(() => import("./features/visitors/Visitors"));
const Complaints = lazy(() => import("./features/complaints/Complaints"));
const Billing = lazy(() => import("./features/billing/Billing"));
const Parking = lazy(() => import("./features/parking/Parking"));
const Notices = lazy(() => import("./features/notices/Notices"));
const AdminAmenities = lazy(() => import("./features/amenities/AdminAmenities"));
const Expenses = lazy(() => import("./features/expenses/Expenses"));

// Resident
const ResidentDashboard = lazy(() => import("./features/dashboard/ResidentDashboard"));
const ResidentProfile = lazy(() => import("./features/settings/ResidentProfile"));
const MyVisitors = lazy(() => import("./features/visitors/MyVisitors"));
const MyComplaints = lazy(() => import("./features/complaints/MyComplaints"));
const MyBills = lazy(() => import("./features/billing/MyBills"));
const MyParking = lazy(() => import("./features/parking/MyParking"));
const NoticesView = lazy(() => import("./features/notices/NoticesView"));
const MyAmenities = lazy(() => import("./features/amenities/MyAmenities"));

// Security & Service
const SecurityDashboard = lazy(() => import("./features/security/SecurityDashboard"));
const Scanner = lazy(() => import("./features/security/Scanner"));
const WalkInRequest = lazy(() => import("./features/security/WalkInRequest"));
const VisitorHistory = lazy(() => import("./features/security/VisitorHistory"));

const ServiceDashboard = lazy(() => import("./features/dashboard/ServiceDashboard"));

function App() {
  const { loading } = useAuth();
  useOfflineDetection(); // Activates global offline listener

  // Auth Bootstrap: Don't render routes until session validation finishes
  if (loading) {
    return <LoadingScreen fullScreen message="Authenticating..." />;
  }

  return (
    <Suspense fallback={<LoadingScreen fullScreen message="Loading page..." />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register-society" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/accept-invite" element={<AcceptInvitation />} />
        </Route>

        {/* Authenticated Routes with MainLayout App Shell */}
        <Route element={<MainLayout />}>
          {/* Super Admin */}
          <Route path="/super-admin">
            <Route index element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="societies" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="societies/:id" element={<ProtectedRoute allowedRoles={["super_admin"]}><SocietyDetails /></ProtectedRoute>} />
            <Route path="admins" element={<ProtectedRoute allowedRoles={["super_admin"]}><SocietyAdmins /></ProtectedRoute>} />
          </Route>

          {/* Society Admin */}
          <Route path="/admin">
            <Route index element={<ProtectedRoute allowedRoles={["society_admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="setup/*" element={<ProtectedRoute allowedRoles={["society_admin"]}><SetupWizard /></ProtectedRoute>} />
            <Route path="create-society" element={<ProtectedRoute allowedRoles={["society_admin"]}><CreateSociety /></ProtectedRoute>} />
            <Route path="pending-approval" element={<ProtectedRoute allowedRoles={["society_admin"]}><PendingApproval /></ProtectedRoute>} />
            <Route path="residents" element={<ProtectedRoute allowedRoles={["society_admin"]}><Residents /></ProtectedRoute>} />
            <Route path="visitors" element={<ProtectedRoute allowedRoles={["society_admin"]}><Visitors /></ProtectedRoute>} />
            <Route path="complaints" element={<ProtectedRoute allowedRoles={["society_admin"]}><Complaints /></ProtectedRoute>} />
            <Route path="billing" element={<ProtectedRoute allowedRoles={["society_admin"]}><Billing /></ProtectedRoute>} />
            <Route path="expenses" element={<ProtectedRoute allowedRoles={["society_admin"]}><Expenses /></ProtectedRoute>} />
            <Route path="parking" element={<ProtectedRoute allowedRoles={["society_admin"]}><Parking /></ProtectedRoute>} />
            <Route path="notices" element={<ProtectedRoute allowedRoles={["society_admin"]}><Notices /></ProtectedRoute>} />
            <Route path="amenities" element={<ProtectedRoute allowedRoles={["society_admin"]}><AdminAmenities /></ProtectedRoute>} />
          </Route>

          {/* Resident */}
          <Route path="/resident">
            <Route index element={<ProtectedRoute allowedRoles={["resident"]}><ResidentDashboard /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute allowedRoles={["resident"]}><ResidentProfile /></ProtectedRoute>} />
            <Route path="visitors" element={<ProtectedRoute allowedRoles={["resident"]}><MyVisitors /></ProtectedRoute>} />
            <Route path="complaints" element={<ProtectedRoute allowedRoles={["resident"]}><MyComplaints /></ProtectedRoute>} />
            <Route path="bills" element={<ProtectedRoute allowedRoles={["resident"]}><MyBills /></ProtectedRoute>} />
            <Route path="parking" element={<ProtectedRoute allowedRoles={["resident"]}><MyParking /></ProtectedRoute>} />
            <Route path="notices" element={<ProtectedRoute allowedRoles={["resident"]}><NoticesView /></ProtectedRoute>} />
            <Route path="amenities" element={<ProtectedRoute allowedRoles={["resident"]}><MyAmenities /></ProtectedRoute>} />
          </Route>

          {/* Security Staff */}
          <Route path="/security">
            <Route index element={<ProtectedRoute allowedRoles={["security"]}><SecurityDashboard /></ProtectedRoute>} />
            <Route path="scan" element={<ProtectedRoute allowedRoles={["security"]}><Scanner /></ProtectedRoute>} />
            <Route path="walk-in" element={<ProtectedRoute allowedRoles={["security"]}><WalkInRequest /></ProtectedRoute>} />
            <Route path="history" element={<ProtectedRoute allowedRoles={["security"]}><VisitorHistory /></ProtectedRoute>} />
          </Route>

          {/* Service Staff */}
          <Route path="/service">
            <Route index element={<ProtectedRoute allowedRoles={["service_staff"]}><ServiceDashboard /></ProtectedRoute>} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
