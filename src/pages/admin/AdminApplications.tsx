import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { approveBarberApplication, listBarberApplications, rejectBarberApplication } from "../../api/barberApplications";
import { getErrorMessage } from "../../api/auth";
import type { BarberApplication, BarberApplicationStatus } from "../../types/types";

const filters: Array<"all" | BarberApplicationStatus> = ["all", "pending", "approved", "rejected"];

export default function AdminApplications() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("all");
  const [approveTarget, setApproveTarget] = useState<BarberApplication | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BarberApplication | null>(null);
  const [approveEmail, setApproveEmail] = useState("");
  const [approvePassword, setApprovePassword] = useState("");
  const [approveNote, setApproveNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const applicationsQuery = useQuery({
    queryKey: ["barber-applications", activeFilter],
    queryFn: () => listBarberApplications(activeFilter === "all" ? undefined : activeFilter),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, email, password, admin_note }: { id: string; email?: string; password: string; admin_note?: string }) =>
      approveBarberApplication(id, { email, password, admin_note }),
    onSuccess: async () => {
      toast.success(t("adminApplications.toast.approved"));
      setApproveTarget(null);
      setApproveEmail("");
      setApprovePassword("");
      setApproveNote("");
      await queryClient.invalidateQueries({ queryKey: ["barber-applications"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, t("adminApplications.toast.error"))),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, admin_note }: { id: string; admin_note: string }) => rejectBarberApplication(id, { admin_note }),
    onSuccess: async () => {
      toast.success(t("adminApplications.toast.rejected"));
      setRejectTarget(null);
      setRejectNote("");
      await queryClient.invalidateQueries({ queryKey: ["barber-applications"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, t("adminApplications.toast.error"))),
  });

  const items = useMemo(() => applicationsQuery.data ?? [], [applicationsQuery.data]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-950">{t("adminApplications.title")}</h1>
      <p className="mt-1 text-slate-500">{t("adminApplications.subtitle")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${activeFilter === filter ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
            {filter === "all" ? t("adminApplications.filters.all") : t(`adminApplications.filters.${filter}`)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        {applicationsQuery.isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">{t("common.loading")}</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">{t("adminApplications.empty")}</div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{item.full_name}</h3>
                  <p className="text-sm text-slate-500">{item.phone_number} • {item.location_text}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{t(`adminApplications.filters.${item.status}`)}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p><strong>{t("adminApplications.passport")}:</strong> {item.passport_series}</p>
                <p><strong>{t("adminApplications.userEmail")}:</strong> {item.user_email || "-"}</p>
                <p><strong>{t("adminApplications.comment")}:</strong> {item.comment}</p>
                <p><strong>{t("adminApplications.paymentNote")}:</strong> {item.payment_note}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={item.receipt_file_url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                  {t("adminApplications.openReceipt")}
                </a>
                {item.status !== "approved" && (
                  <>
                    <button onClick={() => setApproveTarget(item)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">{t("adminApplications.approve")}</button>
                    <button onClick={() => setRejectTarget(item)} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-bold text-white">{t("adminApplications.reject")}</button>
                  </>
                )}
              </div>
              {item.admin_note ? <p className="mt-3 text-sm text-slate-600"><strong>{t("adminApplications.adminNote")}:</strong> {item.admin_note}</p> : null}
            </article>
          ))
        )}
      </div>

      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="text-lg font-black">{t("adminApplications.approveModalTitle")}</h3>
            <input value={approveEmail} onChange={(e) => setApproveEmail(e.target.value)} placeholder={t("common.email")} className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
            <input value={approvePassword} onChange={(e) => setApprovePassword(e.target.value)} placeholder={t("common.password")} className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
            <textarea value={approveNote} onChange={(e) => setApproveNote(e.target.value)} placeholder={t("adminApplications.adminNoteOptional")} className="mt-2 min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setApproveTarget(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold">{t("common.back")}</button>
              <button
                onClick={() => approveMutation.mutate({ id: approveTarget.id, email: approveEmail.trim() || undefined, password: approvePassword, admin_note: approveNote.trim() || undefined })}
                disabled={approvePassword.trim().length < 6 || approveMutation.isPending}
                className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                {approveMutation.isPending ? t("common.saving") : t("adminApplications.approve")}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="text-lg font-black">{t("adminApplications.rejectModalTitle")}</h3>
            <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder={t("adminApplications.rejectReason")} className="mt-3 min-h-24 w-full rounded-lg border border-slate-200 p-3 text-sm" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => setRejectTarget(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold">{t("common.back")}</button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectTarget.id, admin_note: rejectNote })}
                disabled={rejectNote.trim().length < 3 || rejectMutation.isPending}
                className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                {rejectMutation.isPending ? t("common.saving") : t("adminApplications.reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
