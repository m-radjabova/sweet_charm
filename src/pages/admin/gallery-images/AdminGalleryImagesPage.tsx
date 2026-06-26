import { useMemo, useState, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniCheckBadge,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniChevronUpDown,
  HiMiniEye,
  HiMiniMagnifyingGlass,
  HiMiniPencilSquare,
  HiMiniPhoto,
  HiMiniPlus,
  HiMiniTrash,
  HiMiniXMark,
  HiMiniArrowTopRightOnSquare,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import {
  createAdminGalleryImage,
  deleteAdminGalleryImage,
  getAdminGalleryImages,
  updateAdminGalleryImage,
  uploadAdminGalleryImage,
  type AdminGalleryImage,
  type AdminGalleryImagePayload,
} from "../../../api/admin";
import { getErrorMessage } from "../../../api/auth";
import { useDebounce } from "../../../hooks/useDebounce";
import AdminConfirmModal from "../components/AdminConfirmModal";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";
import GalleryImageEditorDrawer from "./GalleryImageEditorDrawer";

const pageSize = 12;

const emptyForm: AdminGalleryImagePayload = {
  title: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

function buildPayload(form: AdminGalleryImagePayload) {
  return {
    title: form.title?.trim() || null,
    image_url: form.image_url.trim(),
    sort_order: Number.isFinite(form.sort_order) ? Math.max(0, form.sort_order) : 0,
    is_active: form.is_active,
  };
}

/* ── Lightbox Modal ─────────────────────────────────────── */
function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: AdminGalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = images[currentIndex];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (event.key === "ArrowRight" && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    },
    [currentIndex, images.length, onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40"
        aria-label="Close lightbox"
      >
        <HiMiniXMark className="h-6 w-6" />
      </button>

      {/* Counter */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/15 px-5 py-2 text-sm font-semibold text-white backdrop-blur-md">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40"
          aria-label="Previous image"
        >
          <HiMiniChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next */}
      {currentIndex < images.length - 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40"
          aria-label="Next image"
        >
          <HiMiniChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div
        className="flex max-h-[85vh] max-w-[90vw] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          loading="lazy"
          src={item.image_url}
          alt={item.title ?? "Gallery image"}
          className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
        />

        {/* Info bar */}
        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/15 px-6 py-3 backdrop-blur-md">
          <p className="text-base font-bold text-white">
            {item.title || "Untitled image"}
          </p>
          <span className="text-white/50">|</span>
          <span className="text-sm text-white/80">Order: {item.sort_order}</span>
          <span className="text-white/50">|</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              item.is_active
                ? "bg-green-500/30 text-green-200"
                : "bg-pink-500/30 text-pink-200"
            }`}
          >
            {item.is_active ? "Active" : "Hidden"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Gallery Card Skeleton ──────────────────────────────── */
function GalleryCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[24px] border border-[#F5E6D8] bg-white shadow-[0_8px_24px_rgba(149,91,28,0.06)]">
      <div className="aspect-[4/3] bg-[#F5E6D8]" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded-full bg-[#F5E6D8]" />
        <div className="h-3 w-1/2 rounded-full bg-[#F5E6D8]" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-[#F5E6D8]" />
          <div className="h-8 w-8 rounded-full bg-[#F5E6D8]" />
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function AdminGalleryImagesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [page, setPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryImage | null>(null);
  const [form, setForm] = useState<AdminGalleryImagePayload>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 350);

  const galleryQuery = useQuery({
    queryKey: ["admin-gallery-images", page, debouncedSearch, statusFilter],
    queryFn: () =>
      getAdminGalleryImages({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
  });

  const galleryResponse = galleryQuery.data;
  const items = galleryResponse?.items ?? [];

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

  const openEdit = (item: AdminGalleryImage) => {
    setEditing(item);
    setForm({
      title: item.title ?? "",
      image_url: item.image_url,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setIsEditorOpen(true);
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadAdminGalleryImage(file);
      return result.url;
    },
    onSuccess: (url) => {
      setForm((current) => ({ ...current, image_url: url }));
      toast.success("Image uploaded");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Image could not be uploaded")),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: AdminGalleryImagePayload) => {
      if (editing) return updateAdminGalleryImage(editing.id, payload);
      return createAdminGalleryImage(payload);
    },
    onSuccess: async () => {
      toast.success(editing ? "Gallery image updated" : "Gallery image created");
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["admin-gallery-images"] });
      await queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gallery image could not be saved")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminGalleryImage,
    onSuccess: async () => {
      toast.success("Gallery image deleted");
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-gallery-images"] });
      await queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gallery image could not be deleted")),
  });

  const stats = useMemo(() => {
    const source = galleryResponse?.stats;
    return {
      total: source?.total ?? 0,
      active: source?.active ?? 0,
      hidden: source?.hidden ?? 0,
    };
  }, [galleryResponse]);

  const totalPages = Math.max(1, galleryResponse?.total_pages ?? 1);
  const currentPage = Math.min(page, totalPages);

  const handleSubmit = () => {
    const payload = buildPayload(form);
    if (!payload.image_url) {
      toast.error("Image URL is required");
      return;
    }
    saveMutation.mutate(payload);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const navigateLightbox = (index: number) => setLightboxIndex(index);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Admin / Gallery"
        title="Gallery Images"
        description="Manage the images displayed in the gallery section of the website. You can add, edit, or remove images, as well as control their visibility and order."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
          >
            <HiMiniPlus className="h-4 w-4" />
            <span>Add Image</span>
          </button>
        }
      />

      {/* ── Stats Cards ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Images", value: stats.total, icon: HiMiniPhoto, tone: "bg-[#FFF0F4] text-[#F25D88]" },
          { label: "Visible Images", value: stats.active, icon: HiMiniCheckBadge, tone: "bg-[#ECFAEE] text-[#43A047]" },
          { label: "Hidden Images", value: stats.hidden, icon: HiMiniEye, tone: "bg-[#FFF6E7] text-[#F2AE43]" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_14px_36px_rgba(149,91,28,0.06)]">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${card.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#A58161]">{card.label}</p>
                  <p className="mt-1 text-[1.75rem] font-black leading-none text-[#341B08]">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Search & Filter Bar ─────────────────────────── */}
      <AdminSurface className="p-0">
        <div className="border-b border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[1.75rem] font-black text-[#341B08]">Sweet Moments Library</h3>
              <p className="mt-1 text-sm text-[#A58161]">
                Showing <span className="font-bold text-[#341B08]">{galleryResponse?.total ?? 0}</span> gallery images.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex h-14 min-w-[240px] items-center gap-3 rounded-[22px] border border-[#F1E0D1] bg-white px-4 text-[#B28D6A] shadow-[0_10px_30px_rgba(221,196,168,0.12)] focus-within:border-[#F25D88] focus-within:shadow-[0_10px_30px_rgba(242,93,136,0.12)]">
                <HiMiniMagnifyingGlass className="h-5 w-5 shrink-0 text-[#8B6237]" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search gallery..."
                  className="w-full bg-transparent text-sm font-medium text-[#5E3906] outline-none placeholder:text-[#C5A688]"
                />
                {searchTerm ? (
                  <button type="button" onClick={() => { setSearchTerm(""); setPage(1); }}>
                    <HiMiniXMark className="h-4 w-4 text-[#C5A688] transition hover:text-[#F25D88]" />
                  </button>
                ) : null}
              </label>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as "all" | "active" | "hidden");
                    setPage(1);
                  }}
                  className="h-14 min-w-[160px] appearance-none rounded-[22px] border border-[#F1E0D1] bg-white px-4 pr-10 text-sm font-semibold text-[#6C4522] shadow-[0_10px_30px_rgba(221,196,168,0.12)] outline-none focus:border-[#F25D88]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
                <HiMiniChevronUpDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B6237]" />
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
              >
                <HiMiniPlus className="h-4 w-4" />
                <span>Add Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Gallery Grid ──────────────────────────────── */}
        <div className="p-6">
          {galleryQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: pageSize }).map((_, index) => (
                <GalleryCardSkeleton key={index} />
              ))}
            </div>
          ) : items.length ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-[24px] border border-[#F5E6D8] bg-white shadow-[0_8px_24px_rgba(149,91,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(149,91,28,0.14)]"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-[#FFF0F4]"
                      onClick={() => openLightbox(index)}
                    >
                      <img
                        src={item.image_url}
                        alt={item.title ?? "Gallery image"}
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                        loading="lazy"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                        <div className="flex h-12 w-12 scale-50 items-center justify-center rounded-full bg-white/90 text-[#341B08] opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                          <HiMiniArrowTopRightOnSquare className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="absolute right-3 top-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm ${
                            item.is_active
                              ? "bg-green-50 text-[#2E7D32]"
                              : "bg-pink-50 text-[#B24764]"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? "bg-[#4CAF50]" : "bg-[#F25D88]"}`} />
                          {item.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>

                      {/* Sort order badge */}
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#8B6237] shadow-sm backdrop-blur-sm">
                        #{item.sort_order}
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <h4 className="truncate text-base font-black text-[#341B08]">
                        {item.title || "Untitled image"}
                      </h4>
                      <p className="mt-1 truncate text-xs text-[#A58161]">
                        {item.image_url}
                      </p>
                      <p className="mt-1 text-xs text-[#C5A688]">
                        Updated {new Date(item.updated_at).toLocaleDateString()}
                      </p>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF2F4] text-[#F25D88] transition hover:bg-[#FDE0EA]"
                          title="Edit image"
                        >
                          <HiMiniPencilSquare className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF6E7] text-[#D17D1D] transition hover:bg-[#FFE7BF]"
                          title="Delete image"
                        >
                          <HiMiniTrash className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openLightbox(index)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F4FF] text-[#5B6ABF] transition hover:bg-[#E0E6FF]"
                          title="View full size"
                        >
                          <HiMiniEye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F4] text-[#F25D88]">
                  <HiMiniPhoto className="h-8 w-8" />
                </div>
                <p className="mt-4 text-lg font-black text-[#341B08]">No gallery images found</p>
                <p className="mt-2 text-sm text-[#A58161]">
                  Search filterlarini tozalang yoki yangi homepage image qo‘shing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Pagination ────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-[#F5E6D8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#8B6237]">
            Page <span className="font-bold text-[#341B08]">{currentPage}</span> of{" "}
            <span className="font-bold text-[#341B08]">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EEDFD0] bg-white text-[#8B6237] transition hover:bg-[#FFF7F0] disabled:opacity-50"
            >
              <HiMiniChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EEDFD0] bg-white text-[#8B6237] transition hover:bg-[#FFF7F0] disabled:opacity-50"
            >
              <HiMiniChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminSurface>

      {/* ── Editor Drawer ───────────────────────────────── */}
      <GalleryImageEditorDrawer
        open={isEditorOpen}
        mode={editing ? "edit" : "create"}
        value={form}
        editing={editing}
        isSaving={saveMutation.isPending}
        isUploading={uploadMutation.isPending}
        onClose={resetForm}
        onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        onSubmit={handleSubmit}
        onUpload={(file) => uploadMutation.mutate(file)}
      />

      {/* ── Delete Confirm Modal ────────────────────────── */}
      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete gallery image?"
        message={`"${deleteTarget?.title || "Untitled image"}" gallerydan o‘chirilsinmi?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Lightbox ────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={items}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </div>
  );
}