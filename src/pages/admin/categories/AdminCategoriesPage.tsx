import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniCheckBadge,
  HiMiniMagnifyingGlass,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniSquares2X2,
  HiMiniTrash,
  HiMiniXMark,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniCube,
} from "react-icons/hi2";
import { Skeleton } from "@mui/material";
import { toast } from "react-toastify";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  uploadAdminCategoryImage,
  type AdminCategory,
  type AdminCategoryPayload,
} from "../../../api/admin";
import { getErrorMessage } from "../../../api/auth";
import { useDebounce } from "../../../hooks/useDebounce";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";
import CategoryEditorDrawer from "./CategoryEditorDrawer";

const emptyForm: AdminCategoryPayload = {
  name: "",
  slug: "",
  image: "",
  description: "",
  is_active: true,
};

const pageSize = 8;

const statCardStyles = [
  {
    icon: HiMiniSquares2X2,
    iconWrap: "bg-[#FFF0F4] text-[#F25D88]",
    label: "Total Categories",
    caption: "All menu groups",
  },
  {
    icon: HiMiniCheckBadge,
    iconWrap: "bg-[#ECFAEE] text-[#59B56A]",
    label: "Active Categories",
    caption: "Visible in storefront",
  },
  {
    icon: HiMiniMagnifyingGlass,
    iconWrap: "bg-[#FFF6E7] text-[#F2AE43]",
    label: "Hidden Categories",
    caption: "Inactive right now",
  },
];

function buildPayload(form: AdminCategoryPayload) {
  return {
    ...form,
    name: form.name.trim(),
    slug: form.slug?.trim() || form.name.trim().toLowerCase().replace(/\s+/g, "-"),
    image: form.image?.trim() || null,
    description: form.description?.trim() || null,
  };
}

/* ── Active Filters Tags ─────────────────────────────────── */
function ActiveFilters({
  searchTerm,
  statusFilter,
  onClearSearch,
  onClearStatus,
}: {
  searchTerm: string;
  statusFilter: string;
  onClearSearch: () => void;
  onClearStatus: () => void;
}) {
  if (!searchTerm && statusFilter === "all") return null;
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 pb-2">
      <span className="text-xs font-semibold text-[#A58161]">Filters:</span>
      {searchTerm && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-3 py-1 text-xs font-semibold text-[#F25D88]">
          Search: "{searchTerm}"
          <button onClick={onClearSearch} className="hover:text-[#D94874]">
            <HiMiniXMark className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
      {statusFilter !== "all" && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-3 py-1 text-xs font-semibold text-[#F25D88]">
          Status: {statusFilter}
          <button onClick={onClearStatus} className="hover:text-[#D94874]">
            <HiMiniXMark className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 400);
  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", page, debouncedSearch, statusFilter],
    queryFn: () =>
      getAdminCategories({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
  });

  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<AdminCategoryPayload>(emptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  const categoriesResponse = categoriesQuery.data;
  const categories = categoriesResponse?.items ?? [];

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsEditorOpen(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsEditorOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image ?? "",
      description: category.description ?? "",
      is_active: category.is_active,
    });
    setIsEditorOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: AdminCategoryPayload) => {
      if (editing) return updateAdminCategory(editing.id, payload);
      return createAdminCategory(payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Category updated" : "Category created");
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-desserts"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Category could not be saved")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: async () => {
      toast.success("Category deleted");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-desserts"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Category could not be deleted")),
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!editing) throw new Error("No category selected");
      const updated = await uploadAdminCategoryImage(editing.id, file);
      return updated;
    },
    onSuccess: (updated) => {
      toast.success("Image uploaded successfully");
      setForm((prev) => ({ ...prev, image: updated.image ?? "" }));
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Image could not be uploaded")),
  });

  const stats = useMemo(() => {
    const total = categoriesResponse?.stats.total ?? 0;
    const active = categoriesResponse?.stats.active ?? 0;
    const hidden = categoriesResponse?.stats.hidden ?? 0;
    return [total, active, hidden];
  }, [categoriesResponse]);

  const totalPages = Math.max(1, categoriesResponse?.total_pages ?? 1);
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Admin / Categories"
        title="Categories"
        description="Organize the dessert menu with a clean table view, active visibility control, and quick category editing."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(242,93,136,0.3)] active:scale-[0.97]"
          >
            <span className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />
            <HiMiniPlus className="relative h-4 w-4" />
            <span className="relative">Add Category</span>
          </button>
        }
      />

      {/* ── Stat cards ────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-3">
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
                </div>
              </div>
            </AdminSurface>
          );
        })}
      </div>

      {/* ── Category list surface ──────────────────────────── */}
      <AdminSurface className="overflow-hidden p-0">
        {/* Toolbar */}
        <div className="border-b border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[1.75rem] font-black text-[#341B08]">All Categories</h3>
              <p className="mt-1 text-sm text-[#A58161]">
                Showing <span className="font-bold text-[#341B08]">{categoriesResponse?.total ?? 0}</span> categories from your menu structure.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex h-14 min-w-[240px] items-center gap-3 rounded-[22px] border border-[#F1E0D1] bg-white px-4 text-[#B28D6A] shadow-[0_10px_30px_rgba(221,196,168,0.12)] transition-all duration-300 focus-within:border-[#F25D88] focus-within:shadow-[0_10px_30px_rgba(242,93,136,0.12)]">
                <HiMiniMagnifyingGlass className="h-5 w-5 text-[#8B6237] shrink-0" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search categories..."
                  className="w-full bg-transparent text-sm font-medium text-[#5E3906] outline-none placeholder:text-[#C5A688]"
                />
                {searchTerm && (
                  <button onClick={() => { setSearchTerm(""); setPage(1); }} className="shrink-0 text-[#C5A688] hover:text-[#F25D88] transition-colors">
                    <HiMiniXMark className="h-4 w-4" />
                  </button>
                )}
              </label>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as "all" | "active" | "hidden");
                    setPage(1);
                  }}
                  className="h-14 w-full min-w-[160px] appearance-none rounded-[22px] border border-[#F1E0D1] bg-white px-4 pr-10 text-sm font-semibold text-[#6C4522] shadow-[0_10px_30px_rgba(221,196,168,0.12)] outline-none transition-all duration-300 focus:border-[#F25D88] focus:shadow-[0_10px_30px_rgba(242,93,136,0.12)]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
                <HiMiniChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#8B6237]" />
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(242,93,136,0.3)] active:scale-[0.97]"
              >
                <span className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />
                <HiMiniPlus className="relative h-4 w-4" />
                <span className="relative hidden md:inline">Add Category</span>
              </button>
            </div>
          </div>
        </div>

        <ActiveFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onClearSearch={() => { setSearchTerm(""); setPage(1); }}
          onClearStatus={() => { setStatusFilter("all"); setPage(1); }}
        />

        {/* ── TABLE VIEW (desktop) ──────────────────────────── */}
        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#F6EBDD] bg-[#FFF9F3] text-sm font-bold text-[#7A5530]">
                <th className="px-6 py-5">Category</th>
                <th className="px-5 py-5">Slug</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Linked Desserts</th>
                <th className="px-5 py-5">Created At</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categoriesQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-[#F8EDE1]">
                    {[50, 20, 14, 16, 18, 12].map((width, j) => (
                      <td key={j} className="px-4 py-5">
                        <Skeleton
                          variant="rounded"
                          animation="wave"
                          width={`${width}%`}
                          height={16}
                          sx={{ bgcolor: "#F5E6D8", borderRadius: 2 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : categories.length ? (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-[#F8EDE1] text-sm text-[#6F4B29] transition hover:bg-[#FFFDF9]">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] bg-[#FFF2F4] shadow-[0_10px_20px_rgba(224,197,166,0.18)]">
                          {category.image ? (
                            <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-lg font-black text-[#F25D88]">{category.name.slice(0, 1)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#341B08]">{category.name}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-[#AC8764]">
                            {category.description || "No description yet for this category."}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 font-semibold text-[#805B37]">{category.slug}</td>
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          category.is_active ? "bg-[#EAF8E8] text-[#5CA15A]" : "bg-[#F4F1EE] text-[#8D7A68]"
                        }`}
                      >
                        {category.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-5 font-bold text-[#341B08]">{category.desserts_count}</td>
                    <td className="px-5 py-5 font-medium text-[#805B37]">
                      {new Date(category.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#F25D88] transition-all duration-300 hover:bg-[#FFF0F4] hover:scale-110 active:scale-95"
                          title="Edit category"
                        >
                          <HiMiniPencilSquare className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(category)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-[#8D6C50] transition-all duration-300 hover:bg-[#FFF0F4] hover:text-[#F25D88] hover:scale-110 active:scale-95"
                          title="Delete category"
                        >
                          <HiMiniTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <HiMiniCube className="h-10 w-10 text-[#D8C9B5]" />
                      <span className="text-sm font-semibold text-[#B7885D]">No categories found</span>
                      <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-4 py-2 text-xs font-bold text-[#F25D88] transition hover:bg-[#FFE0E8]">
                        <HiMiniPlus className="h-3 w-3" /> Create first category
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARD VIEW ─────────────────────────────── */}
        <div className="space-y-4 px-4 py-4 xl:hidden">
          {categoriesQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-[28px] border border-[#F2E1D2] bg-[#FFF9F3] p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton variant="rounded" animation="wave" width={80} height={80} sx={{ bgcolor: "#F5E6D8", borderRadius: 3, shrink: 0 }} />
                    <div className="flex-1 space-y-2.5">
                      <Skeleton variant="rounded" animation="wave" width="80%" height={16} sx={{ bgcolor: "#F5E6D8", borderRadius: 2 }} />
                      <Skeleton variant="rounded" animation="wave" width="50%" height={12} sx={{ bgcolor: "#F5E6D8", borderRadius: 2 }} />
                      <Skeleton variant="rounded" animation="wave" width="35%" height={12} sx={{ bgcolor: "#F5E6D8", borderRadius: 2 }} />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Skeleton variant="rounded" animation="wave" width="50%" height={44} sx={{ bgcolor: "#F5E6D8", borderRadius: 3 }} />
                    <Skeleton variant="rounded" animation="wave" width="50%" height={44} sx={{ bgcolor: "#F5E6D8", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length ? (
            categories.map((category) => (
              <article key={category.id} className="rounded-[28px] border border-[#F2E1D2] bg-[#FFF9F3] p-4 shadow-[0_18px_40px_rgba(229,205,178,0.18)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] bg-white">
                    {category.image ? <img src={category.image} alt={category.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-[#341B08]">{category.name}</h4>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${
                          category.is_active ? "bg-[#EAF8E8] text-[#5CA15A]" : "bg-[#F4F1EE] text-[#8D7A68]"
                        }`}
                      >
                        {category.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#A67E59]">{category.slug}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#805B37]">
                      <span>{category.desserts_count} linked desserts</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => openEdit(category)}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#F1E0D1] bg-white px-4 text-sm font-semibold text-[#8B6237]"
                  >
                    <HiMiniPencilSquare className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(category)}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#FFF1F5] px-4 text-sm font-semibold text-[#F25D88]"
                  >
                    <HiMiniTrash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[#F2E1D2] bg-[#FFF9F3] px-4 py-14">
              <HiMiniCube className="h-10 w-10 text-[#D8C9B5]" />
              <span className="text-sm font-semibold text-[#B7885D]">No categories found</span>
              <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-4 py-2 text-xs font-bold text-[#F25D88] transition hover:bg-[#FFE0E8]">
                <HiMiniPlus className="h-3 w-3" /> Create first category
              </button>
            </div>
          )}
        </div>

        {/* ── Pagination ──────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-[#F5E6D8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#8D6B4D]">
            Showing{" "}
            <span className="font-bold text-[#341B08]">
              {categoriesResponse?.total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[#341B08]">
              {Math.min(currentPage * pageSize, categoriesResponse?.total ?? 0)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#341B08]">{categoriesResponse?.total ?? 0}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237] transition-all duration-300 hover:border-[#F25D88]/30 hover:bg-[#FFF9F3] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F0DECE] disabled:hover:bg-white"
            >
              <HiMiniChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                const value = index + 1;
                const isActive = value === currentPage;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300 active:scale-[0.92] ${
                      isActive
                        ? "scale-110 border-[#F25D88] bg-gradient-to-br from-[#FF7E9F] to-[#F25D88] text-white shadow-[0_12px_24px_rgba(242,93,136,0.25)]"
                        : "border border-[#F0DECE] bg-white text-[#8B6237] hover:border-[#F25D88]/30 hover:bg-[#FFF9F3]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage === totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237] transition-all duration-300 hover:border-[#F25D88]/30 hover:bg-[#FFF9F3] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F0DECE] disabled:hover:bg-white"
            >
              <HiMiniChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminSurface>

      {/* ── Delete confirmation modal ──────────────────────── */}
      <AdminConfirmModal
        open={deleteTarget !== null}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Category Editor Drawer (right-sliding) ─────────── */}
      <CategoryEditorDrawer
        open={isEditorOpen}
        editing={editing}
        form={form}
        isSaving={saveMutation.isPending}
        onFormChange={(newForm: AdminCategoryPayload) => setForm(newForm)}
        onSave={() => saveMutation.mutate(buildPayload(form))}
        onClose={resetForm}
        onUploadImage={async (file: File) => {
          await uploadImageMutation.mutateAsync(file);
        }}
      />
    </div>
  );
}
