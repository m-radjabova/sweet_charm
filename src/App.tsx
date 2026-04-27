import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import AuthLayout from "./layout/AuthLayout";
import AdminLayout from "./layout/AdminLayout";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import IsLoading from "./components/IsLoading";
import NotFound from "./components/NotFound";
import useLoading from "./hooks/useLoading";
import HelloAdmin from "./pages/admin/HelloAdmin";
import AdminBarbers from "./pages/admin/AdminBarbers";
import AdminBookings from "./pages/admin/AdminBookings";
import BookingDetails from "./pages/home/BookingDetails";
import BookingSuccess from "./pages/home/BookingSuccess";
import Home from "./pages/home/Home";
import SelectTime from "./pages/home/SelectTime";
import AccountSettings from "./pages/settings/AccountSettings";

import Login from "./pages/login/Login";
import useContextPro from "./hooks/useContextPro";

import { getDefaultRouteForRole, hasAnyRole } from "./utils/roles";
import BarberDashboard from "./pages/barber/BarberDashboard";
import BarberSchedule from "./pages/barber/BarberSchedule";

function AdminIndexRoute() {
  const {
    state: { user },
  } = useContextPro();

  if (hasAnyRole(user, ["admin"])) {
    return <HelloAdmin />;
  }

  return <Navigate to={getDefaultRouteForRole(user)} replace />;
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
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/book/:barberId" element={<SelectTime />} />
        <Route path="/book/:barberId/details" element={<BookingDetails />} />
        <Route path="/book/success/:bookingCode" element={<BookingSuccess />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Navigate to="/login" replace />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminIndexRoute />} />
        <Route path="barbers" element={<AdminBarbers />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      <Route
        path="/barber"
        element={
          <ProtectedRoute role={["barber"]}>
            <BarberDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/barber/schedule"
        element={
          <ProtectedRoute role={["barber"]}>
            <BarberSchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/barber/settings"
        element={
          <ProtectedRoute role={["barber"]}>
            <AccountSettings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
