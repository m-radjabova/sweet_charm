import { Outlet } from "react-router-dom";

export default function MainLayout() {
 
  return (
    <div className="public-theme min-h-screen bg-white text-slate-950">
      <Outlet />
    </div>
  );
}
