import { Drawer } from "@mui/material";
import type { AdminGalleryImage, AdminGalleryImagePayload } from "../../../api/admin";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  value: AdminGalleryImagePayload;
  editing: AdminGalleryImage | null;
  isSaving: boolean;
  isUploading: boolean;
  onClose: () => void;
  onChange: (patch: Partial<AdminGalleryImagePayload>) => void;
  onSubmit: () => void;
  onUpload: (file: File) => void;
};

export default function GalleryImageEditorDrawer({
  open,
  mode,
  value,
  editing,
  isSaving,
  isUploading,
  onClose,
  onChange,
  onSubmit,
  onUpload,
}: Props) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 540 },
            borderTopLeftRadius: { sm: 24 },
            borderBottomLeftRadius: { sm: 24 },
            boxShadow: "0 0 70px rgba(58,36,21,0.18)",
            overflow: "hidden",
          },
        },
      }}
    >
      <div className="flex h-full flex-col bg-[#FFF9F3] text-[#4F2C06]">
        <div className="border-b border-[#F2E2D0] bg-white px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C39A72]">
            Admin / Gallery
          </p>
          <h2 className="mt-2 text-[1.9rem] font-black text-[#341B08]">
            {mode === "create" ? "Add Gallery Image" : "Edit Gallery Image"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#9A6E42]">
            Homepage Sweet Moments section uchun rasm, title, tartib va ko‘rinishini boshqaring.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#8B6237]">
                Image URL
              </label>
              <input
                value={value.image_url}
                onChange={(event) => onChange({ image_url: event.target.value })}
                placeholder="https://..."
                className="h-12 w-full rounded-2xl border border-[#EEDFD0] bg-white px-4 text-sm outline-none transition focus:border-[#F25D88] focus:ring-4 focus:ring-[#FDE0EA]"
              />
            </div>

            <div className="rounded-[24px] border border-dashed border-[#E6CDB5] bg-white/80 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[#5E3906]">Quick upload</p>
                  <p className="mt-1 text-xs text-[#A58161]">
                    Avval rasmni yuklang, keyin URL avtomatik joylanadi.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#341B08] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4F2C06]">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onUpload(file);
                      event.target.value = "";
                    }}
                  />
                  {isUploading ? "Uploading..." : "Upload image"}
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#8B6237]">
                Title
              </label>
              <input
                value={value.title ?? ""}
                onChange={(event) => onChange({ title: event.target.value })}
                placeholder="Strawberry cake and tea"
                className="h-12 w-full rounded-2xl border border-[#EEDFD0] bg-white px-4 text-sm outline-none transition focus:border-[#F25D88] focus:ring-4 focus:ring-[#FDE0EA]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#8B6237]">
                  Sort order
                </label>
                <input
                  type="number"
                  min={0}
                  value={value.sort_order}
                  onChange={(event) => onChange({ sort_order: Number(event.target.value) || 0 })}
                  className="h-12 w-full rounded-2xl border border-[#EEDFD0] bg-white px-4 text-sm outline-none transition focus:border-[#F25D88] focus:ring-4 focus:ring-[#FDE0EA]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#8B6237]">
                  Visibility
                </label>
                <button
                  type="button"
                  onClick={() => onChange({ is_active: !value.is_active })}
                  className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-semibold transition ${
                    value.is_active
                      ? "border-[#CBE8D2] bg-[#ECFAEE] text-[#2E7D32]"
                      : "border-[#F3D7DE] bg-[#FFF2F5] text-[#B24764]"
                  }`}
                >
                  <span>{value.is_active ? "Active" : "Hidden"}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      value.is_active ? "bg-[#4CAF50]" : "bg-[#F25D88]"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#F0DFCF] bg-white p-4 shadow-[0_10px_24px_rgba(149,91,28,0.05)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#341B08]">Live preview</p>
                  <p className="text-xs text-[#A58161]">
                    Sweet Moments kartochkasida qanday ko‘rinishini tekshiring.
                  </p>
                </div>
                {editing ? (
                  <span className="rounded-full bg-[#FFF0F4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F25D88]">
                    Editing
                  </span>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-[24px] bg-[#F8EFD9]">
                {value.image_url ? (
                  <img
                    src={value.image_url}
                    alt={value.title || "Gallery preview"}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm font-medium text-[#B69473]">
                    Image preview appears here
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-black text-[#341B08]">
                    {value.title?.trim() || "Untitled gallery moment"}
                  </p>
                  <p className="mt-1 text-xs text-[#A58161]">Sort order: {value.sort_order}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    value.is_active ? "bg-[#ECFAEE] text-[#2E7D32]" : "bg-[#FFF0F4] text-[#B24764]"
                  }`}
                >
                  {value.is_active ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#F2E2D0] bg-white px-6 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[#EEDFD0] bg-white py-3 text-sm font-semibold text-[#8B6237] transition hover:bg-[#FFF7F0]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSaving || isUploading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(242,93,136,0.24)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : mode === "create" ? "Create image" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
