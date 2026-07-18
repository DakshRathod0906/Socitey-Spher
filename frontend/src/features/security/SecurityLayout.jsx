import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/layout";

export default function SecurityLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role="security" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
