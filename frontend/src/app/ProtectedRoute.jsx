import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoadingScreen } from "../components/feedback";

const getRedirectForTenantStatus = (status, pathname) => {
  const isSetupPath = pathname.startsWith("/admin/setup");
  
  switch (status) {
    case "DRAFT":
      if (pathname !== "/admin/create-society") return "/admin/create-society";
      break;
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "REJECTED":
      if (pathname !== "/admin/pending-approval") return "/admin/pending-approval";
      break;
    case "APPROVED":
      if (!isSetupPath) return "/admin/setup";
      break;
    case "ACTIVE":
      if (pathname === "/admin/create-society" || pathname === "/admin/pending-approval" || isSetupPath) {
        return "/admin";
      }
      break;
    case "SUSPENDED":
      if (pathname !== "/admin/suspended") return "/admin/suspended";
      break;
    default:
      return null;
  }
  return null;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, tenant, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen fullScreen={true} message="Authenticating..." />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const rolePaths = {
      super_admin: "/super-admin",
      society_admin: "/admin",
      resident: "/resident",
      security: "/security",
      service_staff: "/service",
    };
    return <Navigate to={rolePaths[user.role] || "/login"} replace />;
  }

  // Routing Guards for Society Admin Onboarding
  if (user.role === "society_admin" && tenant) {
    const redirectPath = getRedirectForTenantStatus(tenant.status, location.pathname);
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
