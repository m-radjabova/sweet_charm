import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniCheckBadge,
  HiMiniMagnifyingGlass,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniSquares2X2,
  HiMiniStar,
  HiMiniTrash,
  HiMiniXMark,
  HiMiniChevronUpDown,
  HiMiniPhoto,
  HiMiniEye,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniAdjustmentsHorizontal,
  HiMiniCube,
  HiMiniExclamationTriangle,
  HiMiniArchiveBox,
} from "react-icons/hi2";
import { Skeleton } from "@mui/material";
import { toast } from "react-toastify";
import {
  createAdminDessert,
  deleteAdminDessert,
  getAdminCategoryOptions,
  getAdminDesserts,
  updateAdminDessert,
  uploadAdminImage,
  type AdminDessert,
  type AdminDessertPayload,
} from "../../../api/admin";
import { getErrorMessage } from "../../../api/auth";
import { useDebounce } from "../../../hooks/useDebounce";
import { formatMoney } from "../../account/utils";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";
import DessertEditorDrawer from "./DessertEditorDrawer";

const emptyForm: AdminDessertPayload = {
  category_id: "",
  name: "",
  slug: "",
  description: "",
  ingredients: "",
  price: 0,
  old_price: null,
  stock: 0,
  status: "active",
  is_featured: false,
  is_best_seller: false,
  is_chef_choice: false,
  image_url: "",
  image_urls: [],
};

const pageSize = 8;

function buildPayload(form: AdminDessertPayload, galleryText: string) {
  const extraImages = galleryText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const imageUrls = [form.image_url?.trim(), ...extraImages].filter((value): value is string => Boolean(value));

  return {
    ...form,
    slug: form.slug?.trim() || form.name.trim().toLowerCase().replace(/\s+/g, "-"),
    image_url: form.image_url?.trim() || null,
    image_urls: Array.from(new Set(imageUrls)),
  };
}

function getStatusTone(status: AdminDessert["status"]) {
  switch (status) {
    case "active":
      return { bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", dot: "bg-[#4CAF50]", label: "Active" };
    case "out_of_stock":
      return { bg: "bg-[#FFF0F4]", text: "text-[#D32F2F]", dot: "bg-[#F44336]", label: "Out of Stock" };
    default:
      return { bg: "bg-[#F5F5F5]", text: "text-[#757575]", dot: "bg-[#9E9E9E]", label: "Inactive" };
  }
}

/* ── Image preview modal ─────────────────────────────────── */
function ImagePreviewModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 max-h-[80vh] max-w-3xl overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_40px_80px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} className="max-h-[70vh] w-full rounded-[20px] object-contain" />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#5E3906] backdrop-blur transition hover:bg-white"
        >
          <HiMiniXMark className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
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
          Status: {statusFilter.replaceAll("_", " ")}
          <button onClick={onClearStatus} className="hover:text-[#D94874]">
            <HiMiniXMark className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminDessertsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminDessert["status"] | "all">("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 400);
  const dessertsQuery = useQuery({
    queryKey: ["admin-desserts", page, debouncedSearch, statusFilter],
    queryFn: () =>
      getAdminDesserts({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
  });
  const categoriesQuery = useQuery({ queryKey: ["admin-categories-options"], queryFn: getAdminCategoryOptions });
  const [editing, setEditing] = useState<AdminDessert | null>(null);
  const [galleryText, setGalleryText] = useState("");
  const [form, setForm] = useState<AdminDessertPayload>(emptyForm);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deleteTarget, setDeleteTarget] = useState<AdminDessert | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const dessertsResponse = dessertsQuery.data;
  const desserts = dessertsResponse?.items ?? [];
  const categories = categoriesQuery.data ?? [];

  const resetForm = () => {
    setEditing(null);
    setGalleryText("");
    setForm(emptyForm);
    setIsEditorOpen(false);
  };

  const openCreate = () => {
    setEditing(null);
    setGalleryText("");
    setForm(emptyForm);
    setIsEditorOpen(true);
  };

  const openEdit = (dessert: AdminDessert) => {
    setEditing(dessert);
    setForm({
      category_id: dessert.category_id,
      name: dessert.name,
      slug: dessert.slug,
      description: dessert.description ?? "",
      ingredients: dessert.ingredients ?? "",
      price: Number(dessert.price),
      old_price: dessert.old_price ? Number(dessert.old_price) : null,
      stock: dessert.stock,
      status: dessert.status,
      is_featured: dessert.is_featured,
      is_best_seller: dessert.is_best_seller,
      is_chef_choice: dessert.is_chef_choice,
      image_url: dessert.image_url ?? "",
      image_urls: dessert.image_urls,
    });
    setGalleryText(dessert.image_urls.filter((url) => url !== dessert.image_url).join("\n"));
    setIsEditorOpen(true);
  };

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadAdminImage(file);
      return result.url;
    },
    onError: (error) => toast.error(getErrorMessage(error, "Image could not be uploaded")),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: AdminDessertPayload) => {
      if (editing) return updateAdminDessert(editing.id, payload);
      return createAdminDessert(payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Dessert updated successfully! 🎉" : "New dessert created! 🎉");
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["admin-desserts"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Dessert could not be saved")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminDessert,
    onSuccess: async () => {
      toast.success("Dessert deleted successfully!");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-desserts"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Dessert could not be deleted")),
  });

  const stats = useMemo(() => {
    const total = dessertsResponse?.stats.total ?? 0;
    const active = dessertsResponse?.stats.active ?? 0;
    const inactive = dessertsResponse?.stats.inactive ?? 0;
    const outOfStock = dessertsResponse?.stats.out_of_stock ?? 0;
    return [total, active, inactive, outOfStock];
  }, [dessertsResponse]);

  const totalPages = Math.max(1, dessertsResponse?.total_pages ?? 1);
  const currentPage = Math.min(page, totalPages);

  /* ── Stat cards ───────────────────────────────────────── */
  const statConfigs = [
    {
      icon: HiMiniSquares2X2,
      gradient: "from-[#FFF0F4] to-[#FFE4EC]",
      iconBg: "bg-gradient-to-br from-[#F25D88] to-[#FF7E9F]",
      label: "Total Products",
      caption: "All products in catalog",
    },
    {
      icon: HiMiniCheckBadge,
      gradient: "from-[#ECFAEE] to-[#DFF5E1]",
      iconBg: "bg-gradient-to-br from-[#43A047] to-[#66BB6A]",
      label: "Active Products",
      caption: "Published & visible",
    },
    {
      icon: HiMiniArchiveBox,
      gradient: "from-[#FFF6E7] to-[#FFEDD3]",
      iconBg: "bg-gradient-to-br from-[#F2AE43] to-[#FFC107]",
      label: "Inactive Products",
      caption: "Hidden from store",
    },
    {
      icon: HiMiniExclamationTriangle,
      gradient: "from-[#F5F0FF] to-[#EDE5FF]",
      iconBg: "bg-gradient-to-br from-[#9B7BF7] to-[#B39DDB]",
      label: "Out of Stock",
      caption: "Need restocking",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── Header ────────────────────────────────────────── */}
      <AdminPageHeader
        eyebrow="Admin / Products"
        title="Products"
        description="Manage your delicious products and inventory with a polished catalog, live stock visibility, and quick editing tools."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(242,93,136,0.3)] active:scale-[0.97]"
          >
            <span className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />
            <HiMiniPlus className="relative h-4 w-4" />
            <span className="relative">Add Product</span>
          </button>
        }
      />

      {/* ── Stat cards ────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statConfigs.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group animate-fade-in-up relative overflow-hidden rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_14px_36px_rgba(149,91,28,0.06)] transition-all duration-500 hover:shadow-[0_20px_48px_rgba(149,91,28,0.12)]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/60 to-transparent blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${card.iconBg} shadow-[0_8px_20px_rgba(0,0,0,0.08)]`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-[#A58161] uppercase">{card.label}</p>
                  <p className="mt-1 text-[1.75rem] font-black leading-none text-[#341B08] transition-all duration-300 group-hover:scale-105 group-hover:text-[#F25D88]" style={{ transformOrigin: "left" }}>
                    {stats[index]}
                  </p>
                  <p className="mt-1.5 text-xs text-[#B69473]">{card.caption}</p>
                </div>
              </div>
              <div
                className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${card.gradient} transition-all duration-300 group-hover:scale-x-110`}
                style={{ transformOrigin: "left" }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Product list surface ──────────────────────────── */}
      <AdminSurface className="overflow-hidden p-0">
        {/* Toolbar */}
        <div className="border-b border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[1.75rem] font-black text-[#341B08]">All Products</h3>
              <p className="mt-1 text-sm text-[#A58161]">
                Showing <span className="font-bold text-[#341B08]">{dessertsResponse?.total ?? 0}</span> products from your dessert catalog.
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
                  placeholder="Search products..."
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
                    setStatusFilter(event.target.value as AdminDessert["status"] | "all");
                    setPage(1);
                  }}
                  className="h-14 w-full min-w-[160px] appearance-none rounded-[22px] border border-[#F1E0D1] bg-white px-4 pr-10 text-sm font-semibold text-[#6C4522] shadow-[0_10px_30px_rgba(221,196,168,0.12)] outline-none transition-all duration-300 focus:border-[#F25D88] focus:shadow-[0_10px_30px_rgba(242,93,136,0.12)]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <HiMiniChevronUpDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B6237]" />
              </div>

              <div className="flex h-14 items-center gap-1 rounded-[22px] border border-[#F1E0D1] bg-white p-1 shadow-[0_10px_30px_rgba(221,196,168,0.12)]">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    viewMode === "table"
                      ? "bg-[#F25D88] text-white shadow-[0_4px_12px_rgba(242,93,136,0.3)]"
                      : "text-[#8B6237] hover:bg-[#FFF0F4]"
                  }`}
                  title="Table view"
                >
                  <HiMiniAdjustmentsHorizontal className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-[#F25D88] text-white shadow-[0_4px_12px_rgba(242,93,136,0.3)]"
                      : "text-[#8B6237] hover:bg-[#FFF0F4]"
                  }`}
                  title="Grid view"
                >
                  <HiMiniSquares2X2 className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-[22px] bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(242,93,136,0.3)] active:scale-[0.97]"
              >
                <span className="absolute inset-0 bg-white/0 transition-all duration-300 group-hover:bg-white/10" />
                <HiMiniPlus className="relative h-4 w-4" />
                <span className="relative hidden md:inline">Add Product</span>
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

        {/* ── TABLE VIEW ───────────────────────────────────── */}
        {viewMode === "table" && (
          <div className="hidden overflow-x-auto xl:block">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-[#F6EBDD] bg-[#FFF9F3] text-sm font-bold text-[#7A5530]">
                  <th className="px-6 py-5">Product</th>
                  <th className="px-5 py-5">Category</th>
                  <th className="px-5 py-5">Price</th>
                  <th className="px-5 py-5">Stock</th>
                  <th className="px-5 py-5">Status</th>
                  <th className="px-5 py-5">Featured</th>
                  <th className="px-5 py-5">Created</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dessertsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-[#F8EDE1]">
                      {[55, 20, 15, 12, 14, 10, 18, 12].map((width, j) => (
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
                ) : desserts.length ? (
                  desserts.map((dessert, idx) => {
                    const status = getStatusTone(dessert.status);
                    const isLowStock = dessert.stock > 0 && dessert.stock < 5;
                    return (
                      <tr
                        key={dessert.id}
                        className="animate-fade-in-up border-b border-[#F8EDE1] text-sm text-[#6F4B29] transition-all duration-300 hover:bg-[#FFFDF9] hover:shadow-[inset_0_0_0_1px_rgba(242,93,136,0.06)]"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="group/img relative h-16 w-16 shrink-0 overflow-hidden rounded-[20px] bg-[#FFF2F4] shadow-[0_8px_16px_rgba(224,197,166,0.18)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(224,197,166,0.3)]">
                              {dessert.image_url ? (
                                <>
                                  <img src={dessert.image_url} alt={dessert.name} className="h-full w-full object-cover transition-all duration-500 group-hover/img:scale-110" />
                                  <button
                                    onClick={() => setPreviewImage({ src: dessert.image_url!, alt: dessert.name })}
                                    className="absolute inset-0 flex items-center justify-center bg-black/0 text-white/0 transition-all duration-300 hover:bg-black/30 hover:text-white"
                                  >
                                    <HiMiniEye className="h-5 w-5" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg font-black text-[#F25D88]">
                                  {dessert.name.slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#341B08] truncate">{dessert.name}</p>
                              <p className="mt-1 text-xs text-[#AC8764]">#{dessert.slug}</p>
                              {dessert.is_chef_choice ? (
                                <span className="mt-2 inline-flex items-center rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F25D88]">
                                  Chef's Choice
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F5] px-3 py-1.5 text-xs font-bold text-[#F25D88]">
                            <HiMiniCube className="h-3 w-3" />
                            {dessert.category_name ?? "No category"}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="font-bold text-[#341B08]">
                            {formatMoney(dessert.price)}
                            {dessert.old_price && (
                              <span className="ml-2 text-xs font-medium text-[#B7885D] line-through">{formatMoney(dessert.old_price)}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${dessert.stock <= 0 ? "text-[#F25D88]" : "text-[#341B08]"}`}>
                              {dessert.stock}
                            </span>
                            {isLowStock ? (
                              <span className="inline-flex items-center rounded-full bg-[#FFF3D8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#C27A12]">
                                Low stock
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status.bg} ${status.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              saveMutation.mutate(
                                buildPayload(
                                  {
                                    category_id: dessert.category_id,
                                    name: dessert.name,
                                    slug: dessert.slug,
                                    description: dessert.description ?? "",
                                    ingredients: dessert.ingredients ?? "",
                                    price: Number(dessert.price),
                                    old_price: dessert.old_price ? Number(dessert.old_price) : null,
                                    stock: dessert.stock,
                                    status: dessert.status,
                                    is_featured: !dessert.is_featured,
                                    is_best_seller: dessert.is_best_seller,
                                    is_chef_choice: dessert.is_chef_choice,
                                    image_url: dessert.image_url ?? "",
                                    image_urls: dessert.image_urls,
                                  },
                                  dessert.image_urls.filter((url) => url !== dessert.image_url).join("\n"),
                                ),
                              )
                            }
                            className={`group/star relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                              dessert.is_featured
                                ? "bg-[#FFF8E1] text-[#FDBA2D] shadow-[0_4px_12px_rgba(253,186,45,0.2)]"
                                : "bg-transparent text-[#D8C9B5] hover:bg-[#FFF8E1] hover:text-[#FDBA2D]"
                            }`}
                            title="Toggle featured"
                          >
                            <HiMiniStar className={`h-5 w-5 transition-all duration-300 ${dessert.is_featured ? "fill-current scale-110" : ""} group-hover/star:scale-110`} />
                          </button>
                        </td>
                        <td className="px-5 py-5">
                          <span className="font-medium text-[#805B37]">
                            {new Date(dessert.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(dessert)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-[#F25D88] transition-all duration-300 hover:bg-[#FFF0F4] hover:scale-110 active:scale-95"
                              title="Edit product"
                            >
                              <HiMiniPencilSquare className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(dessert)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-[#8D6C50] transition-all duration-300 hover:bg-[#FFF0F4] hover:text-[#F25D88] hover:scale-110 active:scale-95"
                              title="Delete product"
                            >
                              <HiMiniTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <HiMiniCube className="h-10 w-10 text-[#D8C9B5]" />
                        <span className="text-sm font-semibold text-[#B7885D]">No products found</span>
                        <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-4 py-2 text-xs font-bold text-[#F25D88] transition hover:bg-[#FFE0E8]">
                          <HiMiniPlus className="h-3 w-3" /> Create first product
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── GRID VIEW ────────────────────────────────────── */}
        {viewMode === "grid" && (
          <div className="hidden xl:block">
            {dessertsQuery.isLoading ? (
              <div className="grid grid-cols-2 gap-5 p-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-[24px] border border-[#F2E1D2] bg-white p-0">
                    <Skeleton variant="rounded" animation="wave" height={176} sx={{ bgcolor: "#F5E6D8", borderRadius: 0 }} />
                    <div className="p-4 space-y-3">
                      <Skeleton variant="rounded" animation="wave" width="75%" height={16} sx={{ bgcolor: "#F5E6D8", borderRadius: 2 }} />
                      <Skeleton variant="rounded" animation="wave" width="55%" height={14} sx={{ bgcolor: "#F5E6D8", borderRadius: 2 }} />
                      <Skeleton variant="rounded" animation="wave" width="40%" height={14} sx={{ bgcolor: "#F5E6D8", borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : desserts.length ? (
              <div className="grid grid-cols-2 gap-5 p-6">
                {desserts.map((dessert, idx) => {
                  const status = getStatusTone(dessert.status);
                  const isLowStock = dessert.stock > 0 && dessert.stock < 5;
                  return (
                    <div
                      key={dessert.id}
                      className="animate-fade-in-up group/card overflow-hidden rounded-[24px] border border-[#F2E1D2] bg-white shadow-[0_10px_30px_rgba(229,205,178,0.12)] transition-all duration-500 hover:shadow-[0_20px_48px_rgba(229,205,178,0.24)]"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="group/img relative h-44 overflow-hidden bg-[#FFF2F4]">
                        {dessert.image_url ? (
                          <>
                            <img src={dessert.image_url} alt={dessert.name} className="h-full w-full object-cover transition-all duration-700 group-hover/card:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-all duration-300 group-hover/card:opacity-100" />
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <HiMiniPhoto className="h-10 w-10 text-[#F25D88]/30" />
                          </div>
                        )}
                        <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold capitalize shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${status.bg} ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        {dessert.is_featured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FDBA2D] px-2.5 py-1 text-xs font-bold text-white shadow-[0_4px_12px_rgba(253,186,45,0.3)]">
                            <HiMiniStar className="h-3 w-3 fill-current" />
                            Featured
                          </span>
                        )}
                        {dessert.is_chef_choice && (
                          <span className="absolute left-3 top-14 inline-flex items-center rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F25D88] shadow-[0_4px_12px_rgba(242,93,136,0.15)]">
                            Chef's Choice
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="truncate text-base font-bold text-[#341B08]">{dessert.name}</h4>
                            <p className="mt-0.5 text-xs text-[#AC8764]">#{dessert.slug}</p>
                            {dessert.is_chef_choice ? (
                              <span className="mt-2 inline-flex items-center rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F25D88]">
                                Chef's Choice
                              </span>
                            ) : null}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-black text-[#341B08]">{formatMoney(dessert.price)}</p>
                            {dessert.old_price && (
                              <p className="text-xs font-medium text-[#B7885D] line-through">{formatMoney(dessert.old_price)}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-xs text-[#805B37]">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F5] px-2.5 py-1 font-semibold text-[#F25D88]">
                            <HiMiniCube className="h-3 w-3" />
                            {dessert.category_name ?? "No category"}
                          </span>
                          <span className={`font-semibold ${dessert.stock <= 0 ? "text-[#F25D88]" : "text-[#341B08]"}`}>
                            Stock: {dessert.stock}
                          </span>
                          {isLowStock ? (
                            <span className="inline-flex items-center rounded-full bg-[#FFF3D8] px-2.5 py-1 font-bold uppercase tracking-[0.12em] text-[#C27A12]">
                              Low stock
                            </span>
                          ) : null}
                        </div>

                        {dessert.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#A58161]">{dessert.description}</p>
                        )}

                        <div className="mt-4 flex items-center gap-2 border-t border-[#F5E6D8] pt-4">
                          <button
                            type="button"
                            onClick={() => openEdit(dessert)}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#F1E0D1] bg-white px-3 text-xs font-semibold text-[#8B6237] transition-all duration-300 hover:border-[#F25D88]/30 hover:bg-[#FFF9F3] active:scale-[0.97]"
                          >
                            <HiMiniPencilSquare className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(dessert)}
                            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#FFF0F4] px-3 text-xs font-semibold text-[#F25D88] transition-all duration-300 hover:bg-[#FFE0E8] active:scale-[0.97]"
                          >
                            <HiMiniTrash className="h-3.5 w-3.5" />
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              saveMutation.mutate(
                                buildPayload(
                                  {
                                    category_id: dessert.category_id,
                                    name: dessert.name,
                                    slug: dessert.slug,
                                    description: dessert.description ?? "",
                                    ingredients: dessert.ingredients ?? "",
                                    price: Number(dessert.price),
                                    old_price: dessert.old_price ? Number(dessert.old_price) : null,
                                    stock: dessert.stock,
                                    status: dessert.status,
                                    is_featured: !dessert.is_featured,
                                    is_best_seller: dessert.is_best_seller,
                                    is_chef_choice: dessert.is_chef_choice,
                                    image_url: dessert.image_url ?? "",
                                    image_urls: dessert.image_urls,
                                  },
                                  dessert.image_urls.filter((url) => url !== dessert.image_url).join("\n"),
                                ),
                              )
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 active:scale-[0.97] ${
                              dessert.is_featured
                                ? "bg-[#FFF8E1] text-[#FDBA2D]"
                                : "bg-white text-[#D8C9B5] hover:bg-[#FFF8E1] hover:text-[#FDBA2D]"
                            }`}
                            title="Toggle featured"
                          >
                            <HiMiniStar className={`h-4 w-4 ${dessert.is_featured ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16">
                <HiMiniCube className="h-10 w-10 text-[#D8C9B5]" />
                <span className="text-sm font-semibold text-[#B7885D]">No products found</span>
                <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-4 py-2 text-xs font-bold text-[#F25D88] transition hover:bg-[#FFE0E8]">
                  <HiMiniPlus className="h-3 w-3" /> Create first product
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── MOBILE CARD VIEW ─────────────────────────────── */}
        <div className="space-y-4 px-4 py-4 xl:hidden">
          {dessertsQuery.isLoading ? (
            <div className="space-y-4 px-4 py-4">
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
          ) : desserts.length ? (
            desserts.map((dessert) => {
              const status = getStatusTone(dessert.status);
              const isLowStock = dessert.stock > 0 && dessert.stock < 5;
              return (
                <article
                  key={dessert.id}
                  className="animate-fade-in-up overflow-hidden rounded-[28px] border border-[#F2E1D2] bg-[#FFF9F3] shadow-[0_18px_40px_rgba(229,205,178,0.18)] transition-all duration-500 hover:shadow-[0_24px_48px_rgba(229,205,178,0.24)]"
                >
                  <div className="flex items-start gap-4 p-4">
                    <div className="group/img relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] bg-white shadow-[0_8px_16px_rgba(224,197,166,0.12)]">
                      {dessert.image_url ? (
                        <img src={dessert.image_url} alt={dessert.name} className="h-full w-full object-cover transition-all duration-500 group-hover/img:scale-110" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-black text-[#F25D88]">
                          {dessert.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-bold text-[#341B08]">{dessert.name}</h4>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${status.bg} ${status.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#A67E59]">{dessert.category_name ?? "No category"}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <span className="font-bold text-[#341B08]">{formatMoney(dessert.price)}</span>
                        {dessert.old_price && <span className="text-xs font-medium text-[#B7885D] line-through">{formatMoney(dessert.old_price)}</span>}
                        <span className={`font-semibold ${dessert.stock <= 0 ? "text-[#F25D88]" : "text-[#805B37]"}`}>
                          Stock: {dessert.stock}
                        </span>
                        {isLowStock ? (
                          <span className="inline-flex items-center rounded-full bg-[#FFF3D8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#C27A12]">
                            Low stock
                          </span>
                        ) : null}
                      </div>
                      {dessert.is_featured && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#FDBA2D]">
                          <HiMiniStar className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      )}
                      {dessert.is_chef_choice && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#F25D88]">
                          <HiMiniCheckBadge className="h-3.5 w-3.5" />
                          Chef's Choice
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#F5E6D8] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(dessert)}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#F1E0D1] bg-white px-4 text-sm font-semibold text-[#8B6237] transition-all duration-300 hover:border-[#F25D88]/30 hover:bg-[#FFF9F3] active:scale-[0.97]"
                    >
                      <HiMiniPencilSquare className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(dessert)}
                      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#FFF1F5] px-4 text-sm font-semibold text-[#F25D88] transition-all duration-300 hover:bg-[#FFE0E8] active:scale-[0.97]"
                    >
                      <HiMiniTrash className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[#F2E1D2] bg-[#FFF9F3] px-4 py-14">
              <HiMiniCube className="h-10 w-10 text-[#D8C9B5]" />
              <span className="text-sm font-semibold text-[#B7885D]">No products found</span>
              <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F4] px-4 py-2 text-xs font-bold text-[#F25D88] transition hover:bg-[#FFE0E8]">
                <HiMiniPlus className="h-3 w-3" /> Create first product
              </button>
            </div>
          )}
        </div>

        {/* ── Pagination ──────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-[#F5E6D8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#8D6B4D]">
            Showing{" "}
            <span className="font-bold text-[#341B08]">
              {dessertsResponse?.total === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[#341B08]">
              {Math.min(currentPage * pageSize, dessertsResponse?.total ?? 0)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#341B08]">{dessertsResponse?.total ?? 0}</span>{" "}
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
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Image preview modal ────────────────────────────── */}
      {previewImage && (
        <ImagePreviewModal
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* ── Dessert Editor Drawer (right-sliding drawer) ─────── */}
      <DessertEditorDrawer
        open={isEditorOpen}
        editing={editing}
        form={form}
        galleryText={galleryText}
        categories={categories}
        isSaving={saveMutation.isPending}
        onFormChange={(newForm: AdminDessertPayload) => setForm(newForm)}
        onGalleryTextChange={(text: string) => setGalleryText(text)}
        onSave={() => saveMutation.mutate(buildPayload(form, galleryText))}
        onClose={resetForm}
        onPreviewImage={(src: string, alt: string) => setPreviewImage({ src, alt })}
        onUploadImage={async (file: File) => {
          return await uploadImageMutation.mutateAsync(file);
        }}
      />
    </div>
  );
}
