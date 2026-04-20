import { useState, type ReactNode } from "react";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { HiMiniEllipsisHorizontal } from "react-icons/hi2";

export type RowActionItem = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
};

type RowActionMenuProps = {
  items: RowActionItem[];
};

export function RowActionMenu({ items }: RowActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          width: 40,
          height: 40,
          border: "1px solid rgba(148, 163, 184, 0.18)",
          backgroundColor: "rgba(248, 250, 252, 0.95)",
          color: "#475569",
          borderRadius: "14px",
          transition: "all 0.18s ease",
          "&:hover": {
            backgroundColor: "#e2e8f0",
            color: "#0f172a",
          },
        }}
      >
        <HiMiniEllipsisHorizontal size={18} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 180,
              borderRadius: "18px",
              border: "1px solid rgba(226, 232, 240, 0.9)",
              boxShadow: "0 24px 70px -35px rgba(15, 23, 42, 0.35)",
            },
          },
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            disabled={item.disabled}
            onClick={() => {
              setAnchorEl(null);
              item.onClick();
            }}
            sx={{
              mx: 0.75,
              my: 0.5,
              minHeight: 42,
              borderRadius: "12px",
              color: item.danger ? "#dc2626" : "#0f172a",
            }}
          >
            {item.icon ? (
              <ListItemIcon
                sx={{ color: item.danger ? "#dc2626" : "#475569", minWidth: 32 }}
              >
                {item.icon}
              </ListItemIcon>
            ) : null}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
