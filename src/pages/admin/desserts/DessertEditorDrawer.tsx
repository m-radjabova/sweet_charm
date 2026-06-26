import { useEffect, useRef, useState } from "react";
import { Drawer } from "@mui/material";
import {
  type AdminDessert,
  type AdminDessertPayload,
} from "../../../api/admin";

const palette = {
  cream: "#FBF3EA",
  creamDeep: "#F5E9DA",
  paper: "#FFFDFB",
  cocoa: "#3A2415",
  cocoaSoft: "#7C5A3F",
  cocoaFaint: "#B89A7C",
  glaze: "#E0744F",
  glazeDeep: "#C6552F",
  glazeSoft: "#F3D9C9",
  mint: "#2E7D5B",
  mintSoft: "#DCEFE4",
  berry: "#C84F6B",
  berrySoft: "#FBE3E9",
  line: "#EBDCC9",
};

const fontStack = {
  display: '"Fraunces", "Times New Roman", serif',
  body: '"Inter", -apple-system, "Segoe UI", sans-serif',
};

/* ============================================================
   Small building blocks — every one hand-rolled, no MUI inputs
   ============================================================ */

function FieldShell({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label
        style={{
          fontFamily: fontStack.body,
          fontSize: 12.5,
          fontWeight: 600,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: error ? palette.berry : palette.cocoaSoft,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {label}
        {required && <span style={{ color: palette.glaze }}>•</span>}
        {hint && (
          <span
            style={{
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
              color: palette.cocoaFaint,
              fontSize: 11.5,
            }}
          >
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && (
        <span
          style={{
            fontFamily: fontStack.body,
            fontSize: 12,
            color: palette.berry,
            marginTop: -2,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

const baseInputStyle: React.CSSProperties = {
  fontFamily: fontStack.body,
  fontSize: 14.5,
  color: palette.cocoa,
  background: palette.paper,
  border: `1.5px solid ${palette.line}`,
  borderRadius: 12,
  padding: "10px 14px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color 120ms ease, box-shadow 120ms ease",
};

function focusRing(e: React.FocusEvent<HTMLElement>, on: boolean) {
  const el = e.currentTarget as HTMLElement;
  if (on) {
    el.style.borderColor = palette.glaze;
    el.style.boxShadow = `0 0 0 3px ${palette.glazeSoft}`;
  } else {
    el.style.borderColor = palette.line;
    el.style.boxShadow = "none";
  }
}

function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
) {
  const { error, style, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        ...baseInputStyle,
        borderColor: error ? palette.berry : palette.line,
        ...style,
      }}
      onFocus={(e) => focusRing(e, true)}
      onBlur={(e) => focusRing(e, false)}
    />
  );
}

function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const { style, ...rest } = props;
  return (
    <textarea
      {...rest}
      style={{
        ...baseInputStyle,
        resize: "vertical",
        lineHeight: 1.5,
        fontFamily: fontStack.body,
        ...style,
      }}
      onFocus={(e) => focusRing(e, true)}
      onBlur={(e) => focusRing(e, false)}
    />
  );
}

/* Custom select — a row of buttons disguised as a dropdown when few
   options exist (categories) renders as a styled native select for
   accessibility/searchability, but skinned entirely by hand. */
function Select({
  value,
  onChange,
  children,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...baseInputStyle,
          borderColor: error ? palette.berry : palette.line,
          appearance: "none",
          cursor: "pointer",
          paddingRight: 36,
        }}
        onFocus={(e) => focusRing(e, true)}
        onBlur={(e) => focusRing(e, false)}
      >
        {children}
      </select>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <path
          d="M2 5l5 5 5-5"
          stroke={palette.cocoaSoft}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* Status picker — three hand-drawn pills instead of a dropdown,
   since there are only 3 states and the state itself is the
   thing the admin scans for fastest. */
function StatusPicker({
  value,
  onChange,
}: {
  value: AdminDessertPayload["status"];
  onChange: (v: AdminDessertPayload["status"]) => void;
}) {
  const options: {
    key: AdminDessertPayload["status"];
    label: string;
    dot: string;
  }[] = [
    { key: "active", label: "Active", dot: palette.mint },
    { key: "inactive", label: "Inactive", dot: palette.cocoaFaint },
    { key: "out_of_stock", label: "Out of stock", dot: palette.berry },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: fontStack.body,
              fontSize: 12.5,
              fontWeight: 600,
              padding: "9px 8px",
              borderRadius: 10,
              border: `1.5px solid ${active ? opt.dot : palette.line}`,
              background: active ? `${opt.dot}1A` : palette.paper,
              color: active ? opt.dot : palette.cocoaSoft,
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: opt.dot,
                flexShrink: 0,
              }}
            />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* Hand-built toggle row, replacing MUI Switch entirely */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  accent,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        cursor: "pointer",
        background: checked ? `${accent}12` : "transparent",
        border: `1.5px solid ${checked ? `${accent}55` : palette.line}`,
        transition: "all 140ms ease",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: fontStack.body,
            fontWeight: 700,
            fontSize: 13.5,
            color: palette.cocoa,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: fontStack.body,
            fontSize: 12,
            color: palette.cocoaFaint,
            marginTop: 1,
          }}
        >
          {description}
        </div>
      </div>
      <div
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: checked ? accent : palette.creamDeep,
          flexShrink: 0,
          position: "relative",
          transition: "background 140ms ease",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: palette.paper,
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            transition: "left 140ms ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        />
      </div>
    </div>
  );
}

/* The signature element: a hand-drawn slice of layered cake that
   fills in, layer by layer, as required fields get completed.
   Doubles as visible save-readiness feedback. */
function ProgressSlice({ filled }: { filled: number }) {
  // filled: 0..4 layers (name, category, price, stock)
  const layers = [
    { y: 78, color: palette.glaze },
    { y: 58, color: palette.berry },
    { y: 38, color: palette.mint },
    { y: 18, color: palette.cocoaSoft },
  ];
  return (
    <svg width="34" height="40" viewBox="0 0 34 100">
      {/* plate */}
      <ellipse cx="17" cy="92" rx="16" ry="4" fill={palette.creamDeep} />
      {layers.map((l, i) => (
        <rect
          key={i}
          x="3"
          y={l.y}
          width="28"
          height="18"
          rx="3"
          fill={i < filled ? l.color : palette.creamDeep}
          stroke={palette.line}
          strokeWidth="1"
          style={{ transition: "fill 200ms ease" }}
        />
      ))}
      {/* cherry on top once complete */}
      {filled >= 4 && <circle cx="17" cy="14" r="4" fill={palette.berry} />}
    </svg>
  );
}

/* ============================================================
   Component
   ============================================================ */

interface DessertEditorDrawerProps {
  open: boolean;
  editing: AdminDessert | null;
  form: AdminDessertPayload;
  galleryText: string;
  categories: { id: string; name: string }[];
  isSaving: boolean;
  onFormChange: (form: AdminDessertPayload) => void;
  onGalleryTextChange: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
  onPreviewImage: (src: string, alt: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export default function DessertEditorDrawer({
  open,
  editing,
  form,
  galleryText,
  categories,
  isSaving,
  onFormChange,
  onGalleryTextChange,
  onSave,
  onClose,
  onPreviewImage,
  onUploadImage,
}: DessertEditorDrawerProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState<string | null>(
    null
  );
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const updateField = <K extends keyof AdminDessertPayload>(
    key: K,
    value: AdminDessertPayload[K]
  ) => {
    onFormChange({ ...form, [key]: value });
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.category_id) newErrors.category_id = "Category is required";
    if (form.price <= 0) newErrors.price = "Price must be greater than 0";
    if (form.stock < 0) newErrors.stock = "Stock cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave();
  };

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const url = await onUploadImage(file);
      updateField("image_url", url);
    } finally {
      setUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery("uploading");
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await onUploadImage(files[i]);
        const currentUrls = galleryText
          .split("\n")
          .map((u) => u.trim())
          .filter(Boolean);
        currentUrls.push(url);
        onGalleryTextChange(currentUrls.join("\n"));
      }
    } finally {
      setUploadingGallery(null);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const removeGalleryUrl = (index: number) => {
    const currentUrls = galleryText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    currentUrls.splice(index, 1);
    onGalleryTextChange(currentUrls.join("\n"));
  };

  const galleryUrls = galleryText
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  const filledCount = [
    !!form.name?.trim(),
    !!form.category_id,
    form.price > 0,
    form.stock >= 0 && form.stock !== undefined,
  ].filter(Boolean).length;

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 480, md: 560 },
            borderTopLeftRadius: { sm: 24 },
            borderBottomLeftRadius: { sm: 24 },
            boxShadow: "0 0 70px rgba(58,36,21,0.18)",
            overflow: "hidden",
          },
        },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: palette.cream,
          fontFamily: fontStack.body,
        }}
      >
        {/* hidden file inputs */}
        <input
          ref={mainFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleMainImageUpload}
        />
        <input
          ref={galleryFileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleGalleryUpload}
        />

        {/* ── Header ─────────────────────────────────── */}
        <div
          style={{
            padding: "22px 26px",
            borderBottom: `1px solid ${palette.line}`,
            background: palette.paper,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <ProgressSlice filled={filledCount} />
            <div>
              <h2
                style={{
                  fontFamily: fontStack.display,
                  fontSize: 22,
                  fontWeight: 700,
                  color: palette.cocoa,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {editing ? "Edit this product" : "New on the menu"}
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: palette.cocoaFaint,
                  maxWidth: 320,
                  lineHeight: 1.4,
                }}
              >
                {editing
                  ? "Update pricing, stock, visuals, and where it shows up in the store."
                  : "Four things to fill in before this can go live — watch the slice build."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: `1.5px solid ${palette.line}`,
              background: palette.paper,
              color: palette.cocoaSoft,
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.glaze;
              e.currentTarget.style.color = palette.glaze;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = palette.line;
              e.currentTarget.style.color = palette.cocoaSoft;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────── */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 26px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {/* Category */}
            <FieldShell label="Category" required error={errors.category_id}>
              <Select
                value={form.category_id}
                onChange={(v) => updateField("category_id", v)}
                error={!!errors.category_id}
              >
                <option value="">Choose a category…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FieldShell>

            {/* Name + Slug */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <FieldShell label="Name" required error={errors.name}>
                <TextInput
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Chocolate Dream Cake"
                  error={!!errors.name}
                />
              </FieldShell>
              <FieldShell label="Slug" hint="auto-fills">
                <TextInput
                  value={form.slug ?? ""}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="chocolate-dream-cake"
                />
              </FieldShell>
            </div>

            {/* Price + Old price */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <FieldShell label="Price" required error={errors.price}>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: palette.cocoaFaint,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    $
                  </span>
                  <TextInput
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      updateField("price", Number(e.target.value))
                    }
                    style={{ paddingLeft: 28 }}
                    error={!!errors.price}
                  />
                </div>
              </FieldShell>
              <FieldShell label="Old price" hint="optional, for sales">
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: palette.cocoaFaint,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    $
                  </span>
                  <TextInput
                    type="number"
                    value={form.old_price ?? ""}
                    onChange={(e) =>
                      updateField(
                        "old_price",
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    style={{ paddingLeft: 28 }}
                  />
                </div>
              </FieldShell>
            </div>

            <Hairline />

            {/* Stock + Status */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <FieldShell label="Stock" required error={errors.stock}>
                <TextInput
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    updateField("stock", Number(e.target.value))
                  }
                  error={!!errors.stock}
                />
              </FieldShell>
              <FieldShell label="Status">
                <StatusPicker
                  value={form.status}
                  onChange={(v) => updateField("status", v)}
                />
              </FieldShell>
            </div>

            <Hairline />

            {/* Main image */}
            <div>
              <SectionLabel icon="image">Main image</SectionLabel>
              {form.image_url ? (
                <div
                  style={{
                    position: "relative",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1.5px solid ${palette.line}`,
                    marginBottom: 12,
                  }}
                >
                  <img
                    loading="lazy"
                    src={form.image_url}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: 190,
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <PillButton
                      onClick={() => onPreviewImage(form.image_url!, form.name || "Preview")}
                      icon="eye"
                      dark
                    />
                    <PillButton
                      onClick={() => mainFileInputRef.current?.click()}
                      icon="upload"
                      label={uploadingMain ? "Uploading…" : "Change"}
                      dark
                      loading={uploadingMain}
                    />
                    <PillButton
                      onClick={() => updateField("image_url", "")}
                      icon="trash"
                      label="Remove"
                      danger
                    />
                  </div>
                </div>
              ) : (
                <UploadWell
                  onClick={() => mainFileInputRef.current?.click()}
                  loading={uploadingMain}
                  primary="Drop a photo here, or click to browse"
                  secondary="JPEG, PNG, or WebP · up to 5 MB"
                />
              )}
              <TextInput
                value={form.image_url ?? ""}
                onChange={(e) => updateField("image_url", e.target.value)}
                placeholder="…or paste an image URL"
                style={{ marginTop: 10 }}
              />
            </div>

            {/* Gallery images */}
            <div>
              <SectionLabel icon="image">
                Gallery images <Tag>optional</Tag>
              </SectionLabel>
              <UploadWell
                onClick={() => galleryFileInputRef.current?.click()}
                loading={!!uploadingGallery}
                primary="Add a few more angles"
                secondary="Select multiple files at once"
                compact
              />
              {galleryUrls.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {galleryUrls.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => onPreviewImage(url, `Gallery ${i + 1}`)}
                      style={{
                        position: "relative",
                        width: 76,
                        height: 76,
                        borderRadius: 12,
                        overflow: "hidden",
                        border: `1.5px solid ${palette.line}`,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      className="gallery-thumb"
                    >
                      <img
                        loading="lazy"
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGalleryUrl(i);
                        }}
                        style={{
                          position: "absolute",
                          top: 3,
                          right: 3,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(58,36,21,0.65)",
                          color: "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <TextArea
                rows={2}
                value={galleryText}
                onChange={(e) => onGalleryTextChange(e.target.value)}
                placeholder="…or paste more image URLs, one per line"
                style={{ marginTop: 10 }}
              />
            </div>

            <Hairline />

            <FieldShell label="Description">
              <TextArea
                rows={4}
                value={form.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Flavor notes, size, the occasion it's made for…"
              />
            </FieldShell>

            <FieldShell label="Ingredients">
              <TextArea
                rows={4}
                value={form.ingredients ?? ""}
                onChange={(e) => updateField("ingredients", e.target.value)}
                placeholder="Flour, sugar, eggs, dark chocolate…"
              />
            </FieldShell>

            <Hairline />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ToggleRow
                label="Featured product"
                description="Pinned near the top of the storefront"
                checked={form.is_featured}
                onChange={(v) => updateField("is_featured", v)}
                accent={palette.glaze}
              />
              <ToggleRow
                label="Best seller badge"
                description="Shows a little ribbon on the card"
                checked={form.is_best_seller}
                onChange={(v) => updateField("is_best_seller", v)}
                accent={palette.berry}
              />
              <ToggleRow
                label="Chef's Choice"
                description="Homepage weekly recommendation picked by the admin"
                checked={form.is_chef_choice}
                onChange={(v) => updateField("is_chef_choice", v)}
                accent={palette.cocoa}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div
          style={{
            padding: "18px 26px",
            borderTop: `1px solid ${palette.line}`,
            background: palette.paper,
            display: "flex",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || uploadingMain || !!uploadingGallery}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "13px 0",
              borderRadius: 14,
              border: "none",
              fontFamily: fontStack.body,
              fontWeight: 700,
              fontSize: 14.5,
              color: "white",
              cursor:
                isSaving || uploadingMain || uploadingGallery
                  ? "not-allowed"
                  : "pointer",
              opacity: isSaving || uploadingMain || uploadingGallery ? 0.7 : 1,
              background: `linear-gradient(135deg, ${palette.glaze}, ${palette.glazeDeep})`,
              boxShadow: `0 10px 24px ${palette.glaze}40`,
              transition: "all 140ms ease",
            }}
          >
            {isSaving ? (
              <Spinner />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8.5l3.2 3.2L13 4.8"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {isSaving
              ? "Saving…"
              : editing
              ? "Save changes"
              : "Add to the menu"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: "13px 22px",
              borderRadius: 14,
              border: `1.5px solid ${palette.line}`,
              background: "transparent",
              fontFamily: fontStack.body,
              fontWeight: 600,
              fontSize: 14.5,
              color: palette.cocoaSoft,
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================================================
   Tiny shared pieces
   ============================================================ */

function Hairline() {
  return (
    <div
      style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${palette.line} 15%, ${palette.line} 85%, transparent)`,
      }}
    />
  );
}

function SectionLabel({
  icon,
  children,
}: {
  icon: "image";
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
        fontFamily: fontStack.body,
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        color: palette.cocoaSoft,
      }}
    >
      {icon === "image" && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect
            x="1.5"
            y="2.5"
            width="13"
            height="11"
            rx="2"
            stroke={palette.cocoaSoft}
            strokeWidth="1.4"
          />
          <circle cx="5.5" cy="6.5" r="1.2" fill={palette.cocoaSoft} />
          <path
            d="M2.5 11.5l3.5-3.5 2.5 2.5 2-2 3 3"
            stroke={palette.cocoaSoft}
            strokeWidth="1.4"
            fill="none"
          />
        </svg>
      )}
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        textTransform: "none",
        letterSpacing: 0,
        color: palette.cocoaFaint,
        background: palette.creamDeep,
        padding: "2px 7px",
        borderRadius: 999,
        marginLeft: 4,
      }}
    >
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ animation: "dessert-spin 0.8s linear infinite" }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M14 8a6 6 0 00-6-6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <style>{`@keyframes dessert-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function PillButton({
  onClick,
  icon,
  label,
  dark,
  danger,
  loading,
}: {
  onClick: () => void;
  icon: "eye" | "upload" | "trash";
  label?: string;
  dark?: boolean;
  danger?: boolean;
  loading?: boolean;
}) {
  const bg = danger
    ? "rgba(200,79,107,0.88)"
    : dark
    ? "rgba(58,36,21,0.7)"
    : "rgba(255,255,255,0.92)";
  const color = dark || danger ? "white" : palette.cocoa;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: label ? "7px 12px" : "7px",
        borderRadius: 10,
        border: "none",
        background: bg,
        backdropFilter: "blur(6px)",
        color,
        fontFamily: fontStack.body,
        fontSize: 12,
        fontWeight: 700,
        cursor: loading ? "wait" : "pointer",
      }}
    >
      {loading ? (
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          style={{ animation: "dessert-spin 0.8s linear infinite" }}
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M14 8a6 6 0 00-6-6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      ) : icon === "eye" ? (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ) : icon === "upload" ? (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 11V3M5 6l3-3 3 3M2.5 12.5v1a1 1 0 001 1h9a1 1 0 001-1v-1"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M2.5 4.5h11M5.5 4.5V3a1 1 0 011-1h3a1 1 0 011 1v1.5M6.5 7.5v4M9.5 7.5v4M3.5 4.5l.7 8a1 1 0 001 .9h5.6a1 1 0 001-.9l.7-8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  );
}

function UploadWell({
  onClick,
  loading,
  primary,
  secondary,
  compact,
}: {
  onClick: () => void;
  loading?: boolean;
  primary: string;
  secondary: string;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 16,
        border: `2px dashed ${palette.creamDeep}`,
        background: palette.paper,
        padding: compact ? "18px 16px" : "26px 16px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 160ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.glaze;
        e.currentTarget.style.background = palette.glazeSoft;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.creamDeep;
        e.currentTarget.style.background = palette.paper;
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 16 16"
            style={{ animation: "dessert-spin 0.8s linear infinite" }}
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke={palette.glazeSoft}
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M14 8a6 6 0 00-6-6"
              stroke={palette.glaze}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: palette.cocoaSoft,
            }}
          >
            Uploading…
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg width={compact ? 26 : 32} height={compact ? 26 : 32} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V5M7.5 9.5L12 5l4.5 4.5M4 17v1.5A2.5 2.5 0 006.5 21h11a2.5 2.5 0 002.5-2.5V17"
              stroke={palette.cocoaFaint}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: palette.cocoaSoft,
            }}
          >
            {primary}
          </span>
          <span style={{ fontSize: 11.5, color: palette.cocoaFaint }}>
            {secondary}
          </span>
        </div>
      )}
    </div>
  );
}
