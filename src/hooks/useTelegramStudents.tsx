import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createStudentTelegramLink,
  getStudentTelegramLink,
  sendStudentCredentialsToTelegram,
} from "../api/telegram";
import { getErrorMessage } from "../api/auth";

export default function useTelegramStudents(studentId?: string) {
  const queryClient = useQueryClient();

  const linkQuery = useQuery({
    queryKey: ["student-telegram-link", studentId ?? "none"],
    queryFn: () => getStudentTelegramLink(studentId as string),
    enabled: Boolean(studentId),
    refetchInterval: (query) => {
      const linkStatus = query.state.data;

      if (!studentId || !linkStatus?.telegram_link_url || linkStatus.is_connected) {
        return false;
      }

      return 3000;
    },
    refetchIntervalInBackground: true,
  });

  const createLinkMutation = useMutation({
    mutationFn: () => createStudentTelegramLink(studentId as string),
    onSuccess: async () => {
      toast.success("Telegram ulash linki yangilandi");
      await queryClient.invalidateQueries({ queryKey: ["student-telegram-link", studentId ?? "none"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Telegram linkini yaratib bo'lmadi")),
  });

  const sendCredentialsMutation = useMutation({
    mutationFn: (temporaryPassword?: string) =>
      sendStudentCredentialsToTelegram(studentId as string, temporaryPassword),
    onSuccess: async () => {
      toast.success("Login va parol Telegramga yuborildi");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["student-telegram-link", studentId ?? "none"] }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Login-parolni Telegramga yuborib bo'lmadi")),
  });

  return {
    telegramLink: linkQuery.data ?? null,
    loading: linkQuery.isLoading,
    isFetching: linkQuery.isFetching,
    refreshLink: () => linkQuery.refetch(),
    createLink: () => createLinkMutation.mutateAsync(),
    sendCredentials: (temporaryPassword?: string) => sendCredentialsMutation.mutateAsync(temporaryPassword),
    creatingLink: createLinkMutation.isPending,
    sendingCredentials: sendCredentialsMutation.isPending,
  };
}
