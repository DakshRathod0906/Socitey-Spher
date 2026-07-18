import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../../lib/utils";

export default function Breadcrumbs({ className }) {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className={cn("flex items-center text-sm", className)}>
      <Link
        to="/"
        className="text-muted hover:text-text transition-colors flex items-center"
      >
        <Home size={14} className="mr-1" />
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const title = value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ");

        return (
          <div key={to} className="flex items-center">
            <ChevronRight size={14} className="mx-1 text-muted" />
            {last ? (
              <span className="font-medium text-text">{title}</span>
            ) : (
              <Link
                to={to}
                className="text-muted hover:text-text transition-colors"
              >
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
