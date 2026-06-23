import apiClient from "../apiClient/apiClient";
import type { CouponStatus, CouponType } from "./admin";

export interface PublicCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  minimum_order: string;
  usage_limit?: number | null;
  start_date: string;
  end_date: string;
}

export interface PublicCouponSummary extends PublicCoupon {
  status: CouponStatus;
}

export async function getActiveCoupons() {
  const { data } = await apiClient.get<PublicCoupon[]>("/coupons/active");
  return data;
}
