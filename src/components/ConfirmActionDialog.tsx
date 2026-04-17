import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { HiMiniExclamationTriangle } from "react-icons/hi2";

type ConfirmActionDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  tone?: "danger" | "warning";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

function ConfirmActionDialog({
  open,
  title,
  description,
  confirmText = "Ha, o'chirish",
  cancelText = "Yo'q",
  loading = false,
  tone = "danger",
  onConfirm,
  onClose,
}: ConfirmActionDialogProps) {
  const toneStyles = {
    danger: {
      avatar: "#fee2e2",
      icon: "#e11d48",
      button: "#e11d48",
      hover: "#be123c",
    },
    warning: {
      avatar: "#fef3c7",
      icon: "#d97706",
      button: "#d97706",
      hover: "#b45309",
    },
  };

  const currentTone = toneStyles[tone];

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            padding: "8px",
          },
        },
      }}
    >
      <DialogTitle sx={{ paddingBottom: 1 }}>
        <div className="flex items-start gap-3">
          <Avatar sx={{ bgcolor: currentTone.avatar, color: currentTone.icon, width: 48, height: 48 }}>
            <HiMiniExclamationTriangle size={22} />
          </Avatar>
          <div>
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </DialogTitle>

      <DialogContent sx={{ paddingTop: "8px !important", paddingBottom: 0 }} />

      <DialogActions sx={{ padding: "20px 24px 24px", gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: "14px",
            px: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            borderRadius: "14px",
            px: 3,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: currentTone.button,
            "&:hover": { bgcolor: currentTone.hover },
          }}
        >
          {loading ? "Bajarilmoqda..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmActionDialog;
