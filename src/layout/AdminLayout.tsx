import { Outlet } from "react-router-dom";
import AdminSidebar from "../pages/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#f8fbff_45%,#f1f5f9_100%)]">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="min-w-0 flex-1 pt-20 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
