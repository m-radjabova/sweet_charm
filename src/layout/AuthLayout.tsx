import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="public-theme auth-layout min-h-screen bg-white text-slate-950">
      <Outlet />
    </div>
  );
}
