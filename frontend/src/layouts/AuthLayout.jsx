import { Outlet, Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function AuthLayout({ title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6 text-primary hover:opacity-80 transition-opacity">
          <Building2 size={32} />
          <span className="text-2xl font-bold">SocietySphere</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-text">
          {title || "Welcome back"}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-muted">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-card py-8 px-4 shadow-sm border border-border sm:rounded-xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
