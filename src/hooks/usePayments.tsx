// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { getErrorMessage } from "../api/auth";
// import { createPayment, listPayments, updatePayment, type PaymentPayload } from "../api/payments";

// type PaymentsParams = {
//   studentId?: string;
//   groupId?: string;
// };

// export default function usePayments(params?: PaymentsParams) {
//   const queryClient = useQueryClient();

//   const paymentsQuery = useQuery({
//     queryKey: ["payments", params?.studentId ?? "all-students", params?.groupId ?? "all-groups"],
//     queryFn: () => listPayments(params),
//     enabled: Boolean(params?.groupId || params?.studentId),
//   });

//   const createMutation = useMutation({
//     mutationFn: createPayment,
//     onSuccess: async () => {
//       toast.success("To'lov qo'shildi");
//       await queryClient.invalidateQueries({ queryKey: ["payments"] });
//     },
//     onError: (error) => toast.error(getErrorMessage(error, "To'lov qo'shib bo'lmadi")),
//   });

//   const updateMutation = useMutation({
//     mutationFn: ({ paymentId, payload }: { paymentId: string; payload: Partial<PaymentPayload> }) =>
//       updatePayment(paymentId, payload),
//     onSuccess: async () => {
//       toast.success("To'lov yangilandi");
//       await queryClient.invalidateQueries({ queryKey: ["payments"] });
//     },
//     onError: (error) => toast.error(getErrorMessage(error, "To'lovni yangilab bo'lmadi")),
//   });

//   return {
//     payments: paymentsQuery.data ?? [],
//     loading: paymentsQuery.isLoading,
//     isFetching: paymentsQuery.isFetching,
//     createPayment: (payload: PaymentPayload) => createMutation.mutateAsync(payload),
//     updatePayment: (paymentId: string, payload: Partial<PaymentPayload>) =>
//       updateMutation.mutateAsync({ paymentId, payload }),
//   };
// }

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createPayment, listPayments, updatePayment, type PaymentPayload } from "../api/payments";
import { invalidateStudentDependentQueries } from "./queryInvalidation";

type PaymentsParams = {
  studentId?: string;
  groupId?: string;
};

export default function usePayments(params?: PaymentsParams) {
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ["payments", params?.studentId ?? "all-students", params?.groupId ?? "all-groups"],
    queryFn: () => listPayments(params),
  });

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: async (createdPayment) => {
      toast.success("To'lov qo'shildi");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        invalidateStudentDependentQueries(queryClient, [createdPayment.student_id]),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "To'lov qo'shib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: string; payload: Partial<PaymentPayload> }) =>
      updatePayment(paymentId, payload),
    onSuccess: async (updatedPayment) => {
      toast.success("To'lov yangilandi");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        invalidateStudentDependentQueries(queryClient, [updatedPayment.student_id]),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "To'lovni yangilab bo'lmadi")),
  });

  return {
    payments: paymentsQuery.data ?? [],
    loading: paymentsQuery.isLoading,
    isFetching: paymentsQuery.isFetching,
    createPayment: (payload: PaymentPayload) => createMutation.mutateAsync(payload),
    updatePayment: (paymentId: string, payload: Partial<PaymentPayload>) =>
      updateMutation.mutateAsync({ paymentId, payload }),
    creatingPayment: createMutation.isPending,
    updatingPayment: updateMutation.isPending,
  };
}
