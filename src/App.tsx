import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import AuthLayout from "./layout/AuthLayout";
import AdminLayout from "./layout/AdminLayout";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import IsLoading from "./components/IsLoading";
import NotFound from "./pages/notFound/NotFound";
import ForbiddenPage from "./pages/errors/ForbiddenPage";
import ServerErrorPage from "./pages/errors/ServerErrorPage";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import ProfilePage from "./pages/account/ProfilePage";
import DessertDetailPage from "./pages/dessert/DessertDetailPage";
import DessertsPage from "./pages/dessert/DessertsPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import ScrollToTop from "./components/ScrollToTop";
const AdminDashboardPage = lazy(() => import("./pages/admin/dashboard/AdminDashboardPage"));
const AdminDessertsPage = lazy(() => import("./pages/admin/desserts/AdminDessertsPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/categories/AdminCategoriesPage"));
const AdminGalleryImagesPage = lazy(() => import("./pages/admin/gallery-images/AdminGalleryImagesPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/orders/AdminOrdersPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/reviews/AdminReviewsPage"));
const AdminCustomersPage = lazy(() => import("./pages/admin/customers/AdminCustomersPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/coupons/AdminCouponsPage"));
const AdminRewardsPage = lazy(() => import("./pages/admin/rewards/AdminRewardsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/settings/AdminSettingsPage"));


function App() {
  useEffect(() => {
    AOS.init({ duration: 700, once: true });
  }, []);

  return (
    <>
    <ScrollToTop />

    <Suspense fallback={<IsLoading />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/desserts" element={<DessertsPage />} />
          <Route path="/desserts/:slug" element={<DessertDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<Login />} />
           </Route>

        <Route
          path="/account/profile"
          element={
            <ProtectedRoute role={["user", "admin"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute role={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<AdminDashboardPage />} />
          <Route path="/dashboard/desserts" element={<AdminDessertsPage />} />
          <Route path="/dashboard/categories" element={<AdminCategoriesPage />} />
          <Route path="/dashboard/gallery-images" element={<AdminGalleryImagesPage />} />
          <Route path="/dashboard/orders" element={<AdminOrdersPage />} />
          <Route path="/dashboard/reviews" element={<AdminReviewsPage />} />
          <Route path="/dashboard/customers" element={<AdminCustomersPage />} />
          <Route path="/dashboard/coupons" element={<AdminCouponsPage />} />
          <Route path="/dashboard/rewards" element={<AdminRewardsPage />} />
          <Route path="/dashboard/settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin/desserts" element={<Navigate to="/dashboard/desserts" replace />} />
        <Route path="/admin/categories" element={<Navigate to="/dashboard/categories" replace />} />
        <Route path="/admin/gallery-images" element={<Navigate to="/dashboard/gallery-images" replace />} />
        <Route path="/admin/orders" element={<Navigate to="/dashboard/orders" replace />} />
        <Route path="/admin/reviews" element={<Navigate to="/dashboard/reviews" replace />} />
        <Route path="/admin/customers" element={<Navigate to="/dashboard/customers" replace />} />
        <Route path="/admin/coupons" element={<Navigate to="/dashboard/coupons" replace />} />
        <Route path="/admin/rewards" element={<Navigate to="/dashboard/rewards" replace />} />
        <Route path="/admin/settings" element={<Navigate to="/dashboard/settings" replace />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </>
  );
}

export default App;
