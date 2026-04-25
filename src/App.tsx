import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import AuthLayout from "./layout/AuthLayout";
import AdminLayout from "./layout/AdminLayout";
import StudentLayout from "./layout/StudentLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import IsLoading from "./components/IsLoading";
import NotFound from "./components/NotFound";
import useLoading from "./hooks/useLoading";
import HelloAdmin from "./pages/admin/HelloAdmin";
import AdminCourses from "./pages/admin/courses/AdminCourses";
import AdminGroups from "./pages/admin/groups/AdminGroups";
import AdminGroupStudents from "./pages/admin/groups/AdminGroupStudents";
import AdminPayments from "./pages/admin/payments/AdminPayments";
import AdminSettings from "./pages/admin/settings/AdminSettings";
import AdminStudents from "./pages/admin/students/AdminStudents";
import AdminTeachers from "./pages/admin/teachers/AdminTeachers";
import Login from "./pages/login/Login";
import useContextPro from "./hooks/useContextPro";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentLessons from "./pages/student/StudentLessons";
import StudentPayments from "./pages/student/StudentPayments";
import StudentSettings from "./pages/student/StudentSettings";
import SuperAdminAdmins from "./pages/super-admin/SuperAdminAdmins";
import { getDefaultRouteForRole, hasAnyRole } from "./utils/roles";

function AdminIndexRoute() {
  const {
    state: { user },
  } = useContextPro();

  if (hasAnyRole(user, ["admin"])) {
    return <HelloAdmin />;
  }

  return <Navigate to={getDefaultRouteForRole(user)} replace />;
}

function SuperAdminIndexRoute() {
  return <SuperAdminAdmins />;
}

function App() {
  const { loading } = useLoading();

  useEffect(() => {
    AOS.init({ duration: 700, once: true });
  }, []);

  if (loading) {
    return <IsLoading />;
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Navigate to="/login" replace />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role={["admin", "teacher"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminIndexRoute />} />
        <Route
          path="students"
          element={
            <ProtectedRoute role="admin">
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="teachers"
          element={
            <ProtectedRoute role="admin">
              <AdminTeachers />
            </ProtectedRoute>
          }
        />
        <Route path="groups" element={<AdminGroups />} />
        <Route path="groups/:groupId" element={<AdminGroupStudents />} />
        <Route
          path="courses"
          element={
            <ProtectedRoute role="admin">
              <AdminCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute role="admin">
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute role={["admin", "teacher"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/super-admin"
        element={
          <ProtectedRoute role="super_admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminIndexRoute />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="lessons" element={<StudentLessons />} />
        <Route path="payments" element={<StudentPayments />} />
        <Route path="settings" element={<StudentSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
