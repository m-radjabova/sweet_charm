import apiClient from "../apiClient/apiClient";
import type { Payment, PaymentMethod, PaymentStatus } from "../types/types";

export type PaymentPayload = {
  student_id: string;
  group_id: string;
  enrollment_id?: string | null;
  amount: number | string;
  paid_at: string;
  month_for: string;
  method: PaymentMethod;
  status: PaymentStatus;
  note?: string | null;
};

export async function listPayments(params?: { studentId?: string; groupId?: string }) {
  const { data } = await apiClient.get<Payment[]>("/payments/", {
    params: {
      student_id: params?.studentId,
      group_id: params?.groupId,
    },
  });
  return data;
}

export async function createPayment(payload: PaymentPayload) {
  const { data } = await apiClient.post<Payment>("/payments/", payload);
  return data;
}

export async function updatePayment(paymentId: string, payload: Partial<PaymentPayload>) {
  const { data } = await apiClient.patch<Payment>(`/payments/${paymentId}`, payload);
  return data;
}
