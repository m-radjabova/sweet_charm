import { Outlet } from "react-router-dom";
import BarberSidebar from "../pages/barber/BarberSidebar";

export default function BarberLayout() {
  return (
    <div className="dashboard-theme min-h-screen bg-[#f7f7f5] text-slate-950">
      <div className="flex min-h-screen">
        <BarberSidebar />
        <main className="min-w-0 flex-1 pt-20 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
