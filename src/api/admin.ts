import apiClient from "../apiClient/apiClient";

export interface AdminMetricPoint {
  label: string;
  value: number;
}

export interface AdminSeriesGroup {
  daily: AdminMetricPoint[];
  weekly: AdminMetricPoint[];
  monthly: AdminMetricPoint[];
}

export interface AdminBreakdownItem {
  key: string;
  label: string;
  value: number;
}

export interface AdminTopDessertItem {
  dessert_id?: string | null;
  dessert_name: string;
  orders_count: number;
  revenue: string;
}

export interface AdminRecentOrderItem {
  id: string;
  customer_name: string;
  total_price: string;
  status: string;
  created_at: string;
}

export interface AdminLowStockItem {
  id: string;
  name: string;
  slug: string;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  category_name?: string | null;
}

export interface AdminHeatmapCell {
  time: string;
  value: number;
}

export interface AdminHeatmapRow {
  day: string;
  slots: AdminHeatmapCell[];
}

export interface AdminDashboardData {
  total_revenue: string;
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  low_stock_count: number;
  pending_reviews: number;
  approved_reviews: number;
  total_desserts: number;
  total_categories: number;
  active_users: number;
  average_rating: number;
  sales_overview: AdminSeriesGroup;
  new_customers_growth: AdminSeriesGroup;
  orders_timeline: AdminMetricPoint[];
  revenue_timeline: AdminMetricPoint[];
  order_status_breakdown: AdminBreakdownItem[];
  payment_method_breakdown: AdminBreakdownItem[];
  review_rating_breakdown: AdminBreakdownItem[];
  category_distribution: AdminBreakdownItem[];
  revenue_by_category: AdminBreakdownItem[];
  orders_by_time: AdminHeatmapRow[];
  top_desserts: AdminTopDessertItem[];
  recent_orders: AdminRecentOrderItem[];
  low_stock_items: AdminLowStockItem[];
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  desserts_count: number;
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface AdminCategoryStats {
  total: number;
  active: number;
  hidden: number;
}

export interface AdminCategoryListResponse {
  items: AdminCategory[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: AdminCategoryStats;
}

export interface AdminCategoryPayload {
  name: string;
  slug?: string | null;
  image?: string | null;
  description?: string | null;
  is_active: boolean;
}

export interface AdminDessert {
  id: string;
  category_id: string;
  category_name?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  ingredients?: string | null;
  price: string;
  old_price?: string | null;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  is_featured: boolean;
  is_best_seller: boolean;
  is_chef_choice: boolean;
  rating_avg: string;
  reviews_count: number;
  image_url?: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface AdminDessertPayload {
  category_id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  ingredients?: string | null;
  price: number;
  old_price?: number | null;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  is_featured: boolean;
  is_best_seller: boolean;
  is_chef_choice: boolean;
  image_url?: string | null;
  image_urls: string[];
}

export interface AdminDessertStats {
  total: number;
  active: number;
  inactive: number;
  out_of_stock: number;
}

export interface AdminDessertListResponse {
  items: AdminDessert[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: AdminDessertStats;
}

export interface AdminGalleryImage {
  id: string;
  title?: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminGalleryImagePayload {
  title?: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface AdminGalleryImageStats {
  total: number;
  active: number;
  hidden: number;
}

export interface AdminGalleryImageListResponse {
  items: AdminGalleryImage[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: AdminGalleryImageStats;
}

export interface AdminOrderItem {
  id: string;
  dessert_id?: string | null;
  dessert_name: string;
  quantity: number;
  price: string;
  total_price: string;
}

export interface AdminOrder {
  id: string;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string | null;
  address: string;
  delivery_date?: string | null;
  delivery_time?: string | null;
  payment_method: "cash" | "card";
  payment_status: "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";
  subtotal: string;
  delivery_price: string;
  total_price: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  items: AdminOrderItem[];
}

export interface AdminOrderUpdatePayload {
  status?: AdminOrder["status"];
  payment_status?: AdminOrder["payment_status"];
  delivery_price?: number;
  note?: string | null;
}

export interface AdminOrderStats {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  cancelled: number;
}

export interface AdminOrderListResponse {
  items: AdminOrder[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: AdminOrderStats;
}

export interface AdminReview {
  id: string;
  dessert_id: string;
  dessert_name?: string | null;
  user_id: string;
  customer_name: string;
  customer_email?: string | null;
  avatar?: string | null;
  rating: number;
  text?: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface AdminReviewStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  average_rating: number;
}

export interface AdminReviewListResponse {
  items: AdminReview[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: AdminReviewStats;
}

export interface AdminCustomer {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: "admin" | "user";
  is_active: boolean;
  birthday?: string | null;
  bio?: string | null;
  orders_count: number;
  reviews_count: number;
  created_at: string;
}

export interface AdminCustomerStats {
  total: number;
  active: number;
  inactive: number;
  new_this_month: number;
}

export interface AdminCustomerListResponse {
  items: AdminCustomer[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: AdminCustomerStats;
}

export type CouponType = "percentage" | "fixed" | "free_shipping";
export type CouponStatus = "active" | "inactive";

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  minimum_order: string;
  usage_limit?: number | null;
  usage_count: number;
  start_date: string;
  end_date: string;
  status: CouponStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminCouponPayload {
  code: string;
  type: CouponType;
  value: number;
  minimum_order: number;
  usage_limit?: number | null;
  start_date: string;
  end_date: string;
  status: CouponStatus;
}

export interface AdminCouponListResponse {
  items: AdminCoupon[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  total_active: number;
}

export type AdminRewardStatus = "used" | "unused" | "expired";

export interface AdminReward {
  id: string;
  customer_name: string;
  reward: string;
  code: string;
  issued_date: string;
  expire_date: string;
  status: AdminRewardStatus;
  value: string;
  usage_count: number;
}

export interface AdminRewardStats {
  total_rewards: number;
  used_rewards: number;
  unused_rewards: number;
  expired_rewards: number;
}

export interface AdminRewardListResponse {
  items: AdminReward[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  stats: AdminRewardStats;
}

export interface AdminListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export async function getAdminDashboard() {
  const { data } = await apiClient.get<AdminDashboardData>("/admin/dashboard");
  return data;
}

export async function getAdminCategoryOptions() {
  const { data } = await apiClient.get<AdminCategoryOption[]>("/categories/options");
  return data;
}

export async function getAdminCategories(
  params?: AdminListParams & { status?: "all" | "active" | "hidden" }
) {
  const { data } = await apiClient.get<AdminCategoryListResponse>("/categories", { params });
  return data;
}

export async function createAdminCategory(payload: AdminCategoryPayload) {
  const { data } = await apiClient.post<AdminCategory>("/categories", payload);
  return data;
}

export async function updateAdminCategory(categoryId: string, payload: Partial<AdminCategoryPayload>) {
  const { data } = await apiClient.patch<AdminCategory>(`/categories/${categoryId}`, payload);
  return data;
}

export async function deleteAdminCategory(categoryId: string) {
  await apiClient.delete(`/categories/${categoryId}`);
}

export async function uploadAdminImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<{ url: string; file_id: string | null }>(
    "/uploads/images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function uploadAdminGalleryImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<{ url: string; file_id: string | null }>(
    "/gallery-images/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function uploadAdminCategoryImage(categoryId: string, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<AdminCategory>(
    `/categories/${categoryId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function getAdminDesserts(
  params?: AdminListParams & { status?: "all" | AdminDessert["status"]; category_id?: string }
) {
  const { data } = await apiClient.get<AdminDessertListResponse>("/desserts/manage", { params });
  return data;
}

export async function createAdminDessert(payload: AdminDessertPayload) {
  const { data } = await apiClient.post<AdminDessert>("/desserts", payload);
  return data;
}

export async function updateAdminDessert(dessertId: string, payload: Partial<AdminDessertPayload>) {
  const { data } = await apiClient.patch<AdminDessert>(`/desserts/${dessertId}`, payload);
  return data;
}

export async function deleteAdminDessert(dessertId: string) {
  await apiClient.delete(`/desserts/${dessertId}`);
}

export async function getAdminGalleryImages(
  params?: AdminListParams & { status?: "all" | "active" | "hidden" }
) {
  const { data } = await apiClient.get<AdminGalleryImageListResponse>("/gallery-images", { params });
  return data;
}

export async function createAdminGalleryImage(payload: AdminGalleryImagePayload) {
  const { data } = await apiClient.post<AdminGalleryImage>("/gallery-images", payload);
  return data;
}

export async function updateAdminGalleryImage(
  imageId: string,
  payload: Partial<AdminGalleryImagePayload>
) {
  const { data } = await apiClient.patch<AdminGalleryImage>(`/gallery-images/${imageId}`, payload);
  return data;
}

export async function deleteAdminGalleryImage(imageId: string) {
  await apiClient.delete(`/gallery-images/${imageId}`);
}

export async function getAdminOrders(
  params?: AdminListParams & { status?: "all" | "pending" | "processing" | AdminOrder["status"] }
) {
  const { data } = await apiClient.get<AdminOrderListResponse>("/orders", { params });
  return data;
}

export async function updateAdminOrder(orderId: string, payload: AdminOrderUpdatePayload) {
  const { data } = await apiClient.patch<AdminOrder>(`/orders/${orderId}`, payload);
  return data;
}

export async function getAdminReviews(
  params?: AdminListParams & { state?: "all" | "pending" | "approved" | "rejected" }
) {
  const { data } = await apiClient.get<AdminReviewListResponse>("/reviews", { params });
  return data;
}

export async function getAdminCustomers(
  params?: AdminListParams & { status?: "all" | "active" | "inactive" }
) {
  const { data } = await apiClient.get<AdminCustomerListResponse>("/users", { params });
  return data;
}

export async function getAdminCoupons(
  params?: AdminListParams & { status?: "all" | CouponStatus }
) {
  const { data } = await apiClient.get<AdminCouponListResponse>("/coupons", { params });
  return data;
}

export async function createAdminCoupon(payload: AdminCouponPayload) {
  const { data } = await apiClient.post<AdminCoupon>("/coupons", payload);
  return data;
}

export async function updateAdminCoupon(couponId: string, payload: Partial<AdminCouponPayload>) {
  const { data } = await apiClient.patch<AdminCoupon>(`/coupons/${couponId}`, payload);
  return data;
}

export async function deleteAdminCoupon(couponId: string) {
  await apiClient.delete(`/coupons/${couponId}`);
}

export async function getAdminRewards(params?: AdminListParams) {
  const { data } = await apiClient.get<AdminRewardListResponse>("/coupons/rewards", { params });
  return data;
}

export async function updateAdminReview(reviewId: string, is_approved: boolean) {
  const { data } = await apiClient.patch<AdminReview>(`/reviews/${reviewId}`, { is_approved });
  return data;
}

export async function deleteAdminReview(reviewId: string) {
  await apiClient.delete(`/reviews/${reviewId}`);
}
