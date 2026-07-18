import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, TopHeader, Breadcrumbs } from "../components/layout";

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <TopHeader onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <Breadcrumbs />
            </div>
            
            {/* The actual page content is rendered here via nested routes */}
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
