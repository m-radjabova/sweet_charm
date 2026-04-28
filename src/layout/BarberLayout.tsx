import { Outlet } from "react-router-dom";

export default function BarberLayout() {
  return (
    <div className="barber-theme min-h-screen bg-white text-slate-950">
      <Outlet />
    </div>
  );
}
