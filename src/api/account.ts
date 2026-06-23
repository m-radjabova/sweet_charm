import apiClient from "../apiClient/apiClient";

export interface AccountOrderItem {
  id: string;
  dessert_id?: string | null;
  dessert_name: string;
  quantity: number;
  price: string;
  total_price: string;
}

export interface AccountOrder {
  id: string;
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
  coupon_code?: string | null;
  discount_amount: string;
  total_price: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  cancel_deadline?: string | null;
  can_cancel: boolean;
  items: AccountOrderItem[];
}

export interface AccountAddress {
  id: string;
  title: string;
  city: string;
  street: string;
  apartment?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  note?: string | null;
  is_default: boolean;
  created_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  order_id?: string | null;
  points: number;
  type: "earned" | "redeemed";
  description: string;
  created_at: string;
}

export interface RewardLevel {
  key: "bronze" | "silver" | "gold" | "diamond";
  name: string;
  min_points: number;
  max_points?: number | null;
  reward_title?: string | null;
  unlocked: boolean;
}

export interface RewardsSummary {
  sweet_points: number;
  points_per_dollar: number;
  current_level: RewardLevel;
  next_level?: RewardLevel | null;
  next_reward_title?: string | null;
  points_to_next_level: number;
  progress_percent: number;
  levels: RewardLevel[];
  transactions: PointTransaction[];
}

export interface AccountCoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: string;
  minimum_order: string;
  usage_limit?: number | null;
  start_date: string;
  end_date: string;
  assigned_user_id?: string | null;
  reward_tier?: string | null;
}

export type AccountAddressPayload = Omit<AccountAddress, "id" | "created_at">;

export interface CreateOrderItemPayload {
  dessert_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customer_name: string;
  phone: string;
  email?: string | null;
  address: string;
  delivery_date?: string | null;
  delivery_time?: string | null;
  payment_method: "cash" | "card";
  coupon_code?: string | null;
  note?: string | null;
  items: CreateOrderItemPayload[];
}

export async function getMyOrders() {
  const { data } = await apiClient.get<AccountOrder[]>("/account/orders");
  return data;
}

export async function getMyRewards() {
  const { data } = await apiClient.get<RewardsSummary>("/account/rewards");
  return data;
}

export async function getMyCoupons() {
  const { data } = await apiClient.get<AccountCoupon[]>("/account/coupons");
  return data;
}

export async function createMyOrder(payload: CreateOrderPayload) {
  const { data } = await apiClient.post<AccountOrder>("/account/orders", payload);
  return data;
}

export async function repeatMyOrder(orderId: string) {
  const { data } = await apiClient.post<AccountOrder>(`/account/orders/${orderId}/repeat`);
  return data;
}

export async function cancelMyOrder(orderId: string) {
  const { data } = await apiClient.post<AccountOrder>(`/account/orders/${orderId}/cancel`);
  return data;
}

export async function getMyAddresses() {
  const { data } = await apiClient.get<AccountAddress[]>("/account/addresses");
  return data;
}

export async function createMyAddress(payload: AccountAddressPayload) {
  const { data } = await apiClient.post<AccountAddress>("/account/addresses", payload);
  return data;
}

export async function updateMyAddress(addressId: string, payload: Partial<AccountAddressPayload>) {
  const { data } = await apiClient.patch<AccountAddress>(`/account/addresses/${addressId}`, payload);
  return data;
}

export async function deleteMyAddress(addressId: string) {
  await apiClient.delete(`/account/addresses/${addressId}`);
}
