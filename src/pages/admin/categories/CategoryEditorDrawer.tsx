import { useEffect, useRef, useState } from "react";
import { Drawer } from "@mui/material";
import {
  type AdminCategory,
  type AdminCategoryPayload,
} from "../../../api/admin";

/* ============================================================
   DESIGN TOKENS — shared with DessertEditorDrawer for a
   consistent admin visual language.
   ============================================================ */
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
   Shared primitives (same hand-rolled set as the product editor)
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

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
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

function Spinner({ color = "white" }: { color?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ animation: "category-spin 0.8s linear infinite" }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke={color === "white" ? "rgba(255,255,255,0.35)" : palette.glazeSoft}
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M14 8a6 6 0 00-6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <style>{`@keyframes category-spin { to { transform: rotate(360deg); } }`}</style>
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
  icon: "upload" | "trash";
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
        <Spinner />
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
}: {
  onClick: () => void;
  loading?: boolean;
  primary: string;
  secondary: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 16,
        border: `2px dashed ${palette.creamDeep}`,
        background: palette.paper,
        padding: "26px 16px",
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
          <Spinner color={palette.glaze} />
          <span style={{ fontSize: 13, fontWeight: 600, color: palette.cocoaSoft }}>
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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V5M7.5 9.5L12 5l4.5 4.5M4 17v1.5A2.5 2.5 0 006.5 21h11a2.5 2.5 0 002.5-2.5V17"
              stroke={palette.cocoaFaint}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: palette.cocoaSoft }}>
            {primary}
          </span>
          <span style={{ fontSize: 11.5, color: palette.cocoaFaint }}>{secondary}</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Signature element — a hand-drawn menu tag/label, the kind
   tied to a jar in a bakery case. Its string and knot tighten
   into place as the category becomes ready to save, and it
   flips from "blank" to "labeled" once a name exists. It also
   reflects active/inactive state through its color, since that
   is the single most important fact about a category at a
   glance.
   ============================================================ */
function CategoryTagBadge({
  hasName,
  active,
}: {
  hasName: boolean;
  active: boolean;
}) {
  const tagColor = !hasName
    ? palette.creamDeep
    : active
    ? palette.mint
    : palette.cocoaFaint;
  const tagFill = !hasName ? palette.paper : active ? palette.mintSoft : palette.creamDeep;

  return (
    <svg width="34" height="40" viewBox="0 0 34 48">
      {/* string */}
      <path
        d="M17 2 C17 8, 13 9, 13 15"
        stroke={palette.cocoaFaint}
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      {/* knot */}
      <circle cx="13" cy="15" r="1.6" fill={palette.cocoaFaint} />
      {/* tag body */}
      <path
        d="M4 18 h20 a3 3 0 013 3 v17 a3 3 0 01-3 3 H7 a3 3 0 01-3-3 V21 a3 3 0 013-3z"
        fill={tagFill}
        stroke={tagColor}
        strokeWidth="1.4"
        style={{ transition: "fill 200ms ease, stroke 200ms ease" }}
      />
      {/* punch hole */}
      <circle cx="14" cy="24.5" r="2" fill={palette.cream} stroke={tagColor} strokeWidth="1.2" />
      {/* label lines, fade in once a name exists */}
      <g opacity={hasName ? 1 : 0.25} style={{ transition: "opacity 200ms ease" }}>
        <rect x="9" y="31" width="14" height="2.4" rx="1.2" fill={tagColor} />
        <rect x="9" y="36.5" width="9" height="2.4" rx="1.2" fill={tagColor} />
      </g>
    </svg>
  );
}

/* ============================================================
   Component
   ============================================================ */

interface CategoryEditorDrawerProps {
  open: boolean;
  editing: AdminCategory | null;
  form: AdminCategoryPayload;
  isSaving: boolean;
  onFormChange: (form: AdminCategoryPayload) => void;
  onSave: () => void;
  onClose: () => void;
  onUploadImage: (file: File) => Promise<void>;
}

export default function CategoryEditorDrawer({
  open,
  editing,
  form,
  isSaving,
  onFormChange,
  onSave,
  onClose,
  onUploadImage,
}: CategoryEditorDrawerProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const updateField = <K extends keyof AdminCategoryPayload>(
    key: K,
    value: AdminCategoryPayload[K]
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
    if (!form.name.trim()) newErrors.name = "Category name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      await onUploadImage(file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
        {/* hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
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
            <CategoryTagBadge hasName={!!form.name?.trim()} active={form.is_active} />
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
                {editing ? "Edit this category" : "A new shelf in the case"}
              </h2>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: palette.cocoaFaint,
                  maxWidth: 300,
                  lineHeight: 1.4,
                }}
              >
                {editing
                  ? "Update the label, image, and where it shows up."
                  : "Give it a name and it'll start showing on the tag."}
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
            {/* Name */}
            <FieldShell label="Name" required error={errors.name}>
              <TextInput
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Asian Desserts"
                error={!!errors.name}
              />
            </FieldShell>

            {/* Slug */}
            <FieldShell label="Slug" hint="auto-fills">
              <TextInput
                value={form.slug ?? ""}
                onChange={(e) => updateField("slug", e.target.value)}
                placeholder="asian-desserts"
              />
            </FieldShell>

            <Hairline />

            {/* Image */}
            <div>
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
                Category image
              </div>

              {form.image ? (
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
                    src={form.image}
                    alt="Category preview"
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
                      onClick={() => fileInputRef.current?.click()}
                      icon="upload"
                      label={uploadingImage ? "Uploading…" : "Change"}
                      dark
                      loading={uploadingImage}
                    />
                    <PillButton
                      onClick={() => updateField("image", "")}
                      icon="trash"
                      label="Remove"
                      danger
                    />
                  </div>
                </div>
              ) : (
                <UploadWell
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploadingImage}
                  primary="Drop a photo here, or click to browse"
                  secondary="JPEG, PNG, or WebP · up to 5 MB"
                />
              )}

              <TextInput
                value={form.image ?? ""}
                onChange={(e) => updateField("image", e.target.value)}
                placeholder="…or paste an image URL"
                style={{ marginTop: 10 }}
              />
            </div>

            <Hairline />

            <FieldShell label="Description">
              <TextArea
                rows={4}
                value={form.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="What belongs in this category, for the rest of the team"
              />
            </FieldShell>

            <Hairline />

            {/* Active toggle, styled like the dessert editor's */}
            <div
              onClick={() => updateField("is_active", !form.is_active)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                cursor: "pointer",
                background: form.is_active ? `${palette.mint}12` : "transparent",
                border: `1.5px solid ${
                  form.is_active ? `${palette.mint}55` : palette.line
                }`,
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
                  Visible in the store
                </div>
                <div
                  style={{
                    fontFamily: fontStack.body,
                    fontSize: 12,
                    color: palette.cocoaFaint,
                    marginTop: 1,
                  }}
                >
                  Shown in admin and on the storefront menu
                </div>
              </div>
              <div
                style={{
                  width: 38,
                  height: 22,
                  borderRadius: 999,
                  background: form.is_active ? palette.mint : palette.creamDeep,
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
                    left: form.is_active ? 19 : 3,
                    transition: "left 140ms ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  }}
                />
              </div>
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
            disabled={isSaving || uploadingImage}
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
              cursor: isSaving || uploadingImage ? "not-allowed" : "pointer",
              opacity: isSaving || uploadingImage ? 0.7 : 1,
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
            {isSaving ? "Saving…" : editing ? "Save changes" : "Create category"}
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