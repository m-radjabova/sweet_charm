import { Outlet } from "react-router-dom";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function AuthLayout() {
  return (
    <div className="public-theme auth-layout min-h-screen bg-white text-slate-950">
      <div className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:right-6 sm:top-5">
        <LanguageSwitcher />
      </div>
      <Outlet />
    </div>
  );
}
