import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleLabels = {
  super_admin: "Super Admin",
  society_admin: "Society Admin",
  resident: "Resident",
  security: "Security Staff",
  service_staff: "Service Staff",
};

const DashboardLayout = ({ navItems, children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="text-lg font-bold tracking-tight">SocietySphere</div>
          <div className="text-xs text-brand-100/70 mt-0.5">{roleLabels[user?.role]}</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? "bg-white/15 text-white" : "text-brand-100/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-sm text-brand-100/70 truncate">{user?.name}</div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-brand-100/80 hover:bg-white/10 hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
