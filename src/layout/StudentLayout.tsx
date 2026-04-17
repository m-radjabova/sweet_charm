import { Outlet } from "react-router-dom";
import StudentSidebar from "../pages/student/StudentSidebar";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_30%),linear-gradient(180deg,#f6fffb_0%,#eff9f7_45%,#f8fafc_100%)]">
      <div className="flex min-h-screen">
        <StudentSidebar />
        <main className="min-w-0 flex-1 pt-20 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
