import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniArrowDownTray,
  HiMiniCheck,
  HiMiniCheckBadge,
  HiMiniClock,
  HiMiniEye,
  HiMiniMagnifyingGlass,
  HiMiniStar,
  HiMiniTrash,
  HiMiniXMark,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { deleteAdminReview, getAdminReviews, updateAdminReview } from "../../../api/admin";
import { getErrorMessage } from "../../../api/auth";
import { useDebounce } from "../../../hooks/useDebounce";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";

type ReviewTab = "all" | "pending" | "approved" | "rejected";

const tabs: { key: ReviewTab; label: string }[] = [
  { key: "all", label: "All Reviews" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const statCardStyles = [
  {
    icon: HiMiniStar,
    iconWrap: "bg-[#FFF0F4] text-[#F25D88]",
    label: "Total Reviews",
    caption: "All time",
  },
  {
    icon: HiMiniCheckBadge,
    iconWrap: "bg-[#ECFAEE] text-[#59B56A]",
    label: "Approved Reviews",
    caption: "Visible publicly",
  },
  {
    icon: HiMiniClock,
    iconWrap: "bg-[#FFF6E7] text-[#F2AE43]",
    label: "Pending Reviews",
    caption: "Waiting moderation",
  },
  {
    icon: HiMiniXMark,
    iconWrap: "bg-[#FFF1F3] text-[#FF6F8A]",
    label: "Rejected Reviews",
    caption: "Low-fit queue",
  },
  {
    icon: HiMiniStar,
    iconWrap: "bg-[#F5F0FF] text-[#9B7BF7]",
    label: "Average Rating",
    caption: "Customer score",
  },
];

function getReviewState(review: { is_approved: boolean; rating: number }): ReviewTab {
  if (review.is_approved) return "approved";
  if (review.rating <= 2) return "rejected";
  return "pending";
}

function getStatusTone(state: ReviewTab) {
  if (state === "approved") return "bg-[#EAF8E8] text-[#5CA15A]";
  if (state === "rejected") return "bg-[#FFE8EE] text-[#F25D88]";
  return "bg-[#FFF3DE] text-[#F2A53B]";
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5 text-[#F4B73F]">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rating ? "text-[#F4B73F]" : "text-[#F4B73F]/25"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<ReviewTab>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; customerName: string } | null>(null);
  const [moderationTarget, setModerationTarget] = useState<{ id: string; customerName: string; action: "approve" | "pending" } | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 400);
  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews", page, debouncedSearch, tab],
    queryFn: () =>
      getAdminReviews({
        page,
        page_size: 10,
        search: debouncedSearch || undefined,
        state: tab,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) =>
      updateAdminReview(reviewId, isApproved),
    onSuccess: async () => {
      toast.success("Review updated");
      setModerationTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Review could not be updated")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: async () => {
      toast.success("Review deleted");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Review could not be deleted")),
  });

  const reviewsResponse = reviewsQuery.data;
  const reviews = reviewsResponse?.items ?? [];

  const stats = useMemo(() => {
    const total = reviewsResponse?.stats.total ?? 0;
    const approved = reviewsResponse?.stats.approved ?? 0;
    const rejected = reviewsResponse?.stats.rejected ?? 0;
    const pending = reviewsResponse?.stats.pending ?? 0;
    const average = (reviewsResponse?.stats.average_rating ?? 0).toFixed(1);
    return [total, approved, pending, rejected, average];
  }, [reviewsResponse]);

  const totalPages = Math.max(1, reviewsResponse?.total_pages ?? 1);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Admin / Reviews"
        title="Reviews"
        description="Manage and moderate customer reviews with a clean approval queue, searchable feedback table, and quick actions."
        action={
          <button
            type="button"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
          >
            <HiMiniArrowDownTray className="h-4 w-4" />
            Export
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-5">
        {statCardStyles.map((card, index) => {
          const Icon = card.icon;
          return (
            <AdminSurface key={card.label} className="p-0">
              <div className="flex items-center gap-4 p-5">
                <div className={`flex h-16 w-16 items-center justify-center rounded-[24px] ${card.iconWrap}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#8C6A49]">{card.label}</p>
                  <p className="mt-1 text-[2rem] font-black leading-none text-[#341B08]">{stats[index]}</p>
                  <p className="mt-2 text-sm text-[#B69473]">{card.caption}</p>
                  {card.label === "Average Rating" ? (
                    <div className="mt-2">{renderStars(Math.round(Number(stats[index]) || 0))}</div>
                  ) : null}
                </div>
              </div>
            </AdminSurface>
          );
        })}
      </div>

      <AdminSurface className="overflow-hidden p-0">
        <div className="border-b border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((item) => {
                const isActive = tab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setTab(item.key);
                      setPage(1);
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                      isActive
                        ? "bg-[#FFF1F5] text-[#F25D88] shadow-[inset_0_-2px_0_0_#F25D88]"
                        : "text-[#7B5733] hover:bg-[#FFF9F3]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex h-14 min-w-[280px] items-center gap-3 rounded-[22px] border border-[#F1E0D1] bg-white px-4 text-[#B28D6A] shadow-[0_10px_30px_rgba(221,196,168,0.12)]">
                <HiMiniMagnifyingGlass className="h-5 w-5 text-[#8B6237]" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search reviews..."
                  className="w-full bg-transparent text-sm font-medium text-[#5E3906] outline-none placeholder:text-[#C5A688]"
                />
              </label>

              <button
                type="button"
                className="inline-flex h-14 items-center justify-center rounded-[22px] border border-[#F1E0D1] bg-white px-5 text-sm font-semibold text-[#6C4522] shadow-[0_10px_30px_rgba(221,196,168,0.12)]"
              >
                Filter
              </button>

              <button
                type="button"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
              >
                <HiMiniArrowDownTray className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#F6EBDD] bg-[#FFF9F3] text-sm font-bold text-[#7A5530]">
                <th className="px-6 py-5">Customer</th>
                <th className="px-5 py-5">Product</th>
                <th className="px-5 py-5">Rating</th>
                <th className="px-5 py-5">Review</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Date</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm font-semibold text-[#B7885D]">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length ? (
                reviews.map((review) => {
                  const state = getReviewState(review);
                  return (
                    <tr key={review.id} className="border-b border-[#F8EDE1] text-sm text-[#6F4B29] transition hover:bg-[#FFFDF9]">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FF7E9F] to-[#F25D88] text-sm font-black text-white shadow-md">
                            {review.avatar ? (
                              <img src={review.avatar} alt={review.customer_name} className="h-full w-full object-cover" />
                            ) : (
                              review.customer_name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#341B08]">{review.customer_name}</p>
                            <p className="mt-1 text-sm text-[#AC8764]">{review.customer_email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div>
                          <p className="font-bold text-[#341B08]">{review.dessert_name ?? "Dessert review"}</p>
                          <p className="mt-1 text-sm text-[#AC8764]">#{review.dessert_id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-5">{renderStars(review.rating)}</td>
                      <td className="px-5 py-5">
                        <p className="max-w-[320px] text-sm leading-7 text-[#7E531F]">
                          {review.text || "No review text provided."}
                        </p>
                      </td>
                      <td className="px-5 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(state)}`}>
                          {state.charAt(0).toUpperCase() + state.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="font-semibold text-[#5E3906]">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="mt-1 text-sm text-[#AC8764]">
                          {new Date(review.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedReviewId((current) => (current === review.id ? null : review.id))}
                            className="text-[#8D6C50] transition hover:scale-105"
                            title="View review"
                          >
                            <HiMiniEye className="h-5 w-5" />
                          </button>
                              {!review.is_approved ? (
                            <button
                              type="button"
                              onClick={() => setModerationTarget({ id: review.id, customerName: review.customer_name, action: "approve" })}
                              className="text-[#59B56A] transition hover:scale-105"
                              title="Approve review"
                            >
                              <HiMiniCheck className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setModerationTarget({ id: review.id, customerName: review.customer_name, action: "pending" })}
                              className="text-[#F2A53B] transition hover:scale-105"
                              title="Move to pending"
                            >
                              <HiMiniClock className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: review.id, customerName: review.customer_name })}
                            className="text-[#F25D88] transition hover:scale-105"
                            title="Delete review"
                          >
                            {state === "rejected" ? <HiMiniXMark className="h-5 w-5" /> : <HiMiniTrash className="h-5 w-5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm font-semibold text-[#B7885D]">
                    No reviews found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 px-4 py-4 xl:hidden">
          {reviewsQuery.isLoading ? (
            <div className="rounded-[24px] border border-[#F2E1D2] bg-[#FFF9F3] px-4 py-10 text-center text-sm font-semibold text-[#B7885D]">
              Loading reviews...
            </div>
          ) : reviews.length ? (
            reviews.map((review) => {
              const state = getReviewState(review);
              return (
                <article key={review.id} className="rounded-[28px] border border-[#F2E1D2] bg-[#FFF9F3] p-4 shadow-[0_18px_40px_rgba(229,205,178,0.18)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#341B08]">{review.customer_name}</p>
                      <p className="mt-1 text-sm text-[#AC8764]">{review.dessert_name ?? "Dessert review"}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(state)}`}>
                      {state.charAt(0).toUpperCase() + state.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4">{renderStars(review.rating)}</div>
                  <p className="mt-4 text-sm leading-7 text-[#7E531F]">{review.text || "No review text provided."}</p>

                  <div className="mt-4 flex items-center gap-3">
                    {!review.is_approved ? (
                      <button
                        type="button"
                        onClick={() => setModerationTarget({ id: review.id, customerName: review.customer_name, action: "approve" })}
                        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#EAF8E8] px-4 text-sm font-semibold text-[#59B56A]"
                      >
                        <HiMiniCheck className="h-4 w-4" />
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setModerationTarget({ id: review.id, customerName: review.customer_name, action: "pending" })}
                        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#FFF6E7] px-4 text-sm font-semibold text-[#F2A53B]"
                      >
                        <HiMiniClock className="h-4 w-4" />
                        Pending
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: review.id, customerName: review.customer_name })}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#FFF1F5] px-4 text-sm font-semibold text-[#F25D88]"
                    >
                      <HiMiniTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[24px] border border-[#F2E1D2] bg-[#FFF9F3] px-4 py-10 text-center text-sm font-semibold text-[#B7885D]">
              No reviews found for this filter.
            </div>
          )}
        </div>

        <AdminConfirmModal
          open={deleteTarget !== null}
          title="Delete Review"
          message={`Are you sure you want to delete ${deleteTarget?.customerName ? `"${deleteTarget.customerName}"` : "this review"}? This action cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          }}
          isLoading={deleteMutation.isPending}
          loadingLabel="Deleting..."
        />

        <AdminConfirmModal
          open={moderationTarget !== null}
          title={moderationTarget?.action === "approve" ? "Approve Review" : "Move Review To Pending"}
          message={
            moderationTarget
              ? moderationTarget.action === "approve"
                ? `Approve review from "${moderationTarget.customerName}" and show it publicly?`
                : `Move review from "${moderationTarget.customerName}" back to pending moderation?`
              : ""
          }
          confirmLabel={moderationTarget?.action === "approve" ? "Approve" : "Move to Pending"}
          loadingLabel="Saving..."
          tone="warning"
          onCancel={() => setModerationTarget(null)}
          onConfirm={() => {
            if (!moderationTarget) return;
            approveMutation.mutate({
              reviewId: moderationTarget.id,
              isApproved: moderationTarget.action === "approve",
            });
          }}
          isLoading={approveMutation.isPending}
        />

        <div className="flex flex-col gap-4 border-t border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#8D6B4D]">
              Showing {reviewsResponse?.total === 0 ? 0 : (page - 1) * 10 + 1} to {Math.min(page * 10, reviewsResponse?.total ?? 0)} of {reviewsResponse?.total ?? 0} results
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237]"
              >
                {"<"}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-bold ${
                      value === page
                        ? "border-[#F25D88] bg-[#F25D88] text-white shadow-[0_12px_24px_rgba(242,93,136,0.2)]"
                        : "border-[#F0DECE] bg-white text-[#8B6237]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page === totalPages}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237]"
              >
                {">"}
              </button>
            </div>
          </div>

          {selectedReviewId ? (
            <div className="rounded-[24px] border border-[#F3E3D3] bg-[#FFF9F3] p-5">
              {reviews
                .filter((review) => review.id === selectedReviewId)
                .map((review) => {
                  const state = getReviewState(review);
                  return (
                    <div key={review.id} className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black text-[#341B08]">{review.customer_name}</h3>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(state)}`}>
                            {state.charAt(0).toUpperCase() + state.slice(1)}
                          </span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-[#8B6237]">
                          <p>{review.customer_email || "No email provided"}</p>
                          <p>Product: {review.dessert_name ?? "Dessert review"}</p>
                          <p>Submitted {new Date(review.created_at).toLocaleString("en-US")}</p>
                        </div>
                        <div className="mt-4">{renderStars(review.rating)}</div>
                      </div>

                      <div className="rounded-[22px] bg-white/85 p-4 shadow-sm ring-1 ring-[#F5E6D8]/50">
                        <p className="text-sm leading-7 text-[#7E531F]">{review.text || "No review text provided."}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : null}
        </div>
      </AdminSurface>
    </div>
  );
}
