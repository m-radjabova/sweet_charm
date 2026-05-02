import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  HiMiniChevronDown,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniScissors,
  HiMiniStar,
  HiMiniTrash,
  HiMiniUserCircle,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCalendar,
  HiOutlineCheckBadge,
  HiOutlineXMark,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { createBarber, deleteBarber, listBarbers, updateBarber } from "../../api/users";
import { getErrorMessage } from "../../api/auth";
import { formatDate } from "../../utils/date";
import type { BarberCreatePayload, UpdateBarberPayload, User } from "../../types/types";

const emptyForm: BarberCreatePayload = {
  full_name: "",
  email: "",
  password: "",
};

// Side Drawer Component
function SideDrawer({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isOpen ? "visible bg-black/50 backdrop-blur-sm" : "invisible bg-black/0"
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-white shadow-2xl transition-all duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Drawer Header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {title === "Add New Barber" ? "Admin login va parol yaratadi, qolgan profilni barber o'zi to'ldiradi" : "Asosiy login ma'lumotlari va statusni boshqaring"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-md transition-all hover:bg-slate-100 hover:text-slate-600 hover:shadow-lg"
              >
                <HiOutlineXMark className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

function DeleteConfirmModal({
  barber,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  barber: User | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!barber) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <HiOutlineExclamationTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Barberni o'chirish</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Rostan ham <span className="font-bold text-slate-900">{barber.full_name}</span> ni
              o'chirmoqchimisiz? Bu amal barber profilini va unga bog'langan bronlarni o'chiradi.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 flex-1 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-11 flex-1 rounded-xl bg-rose-600 text-sm font-bold text-white shadow-lg transition hover:bg-rose-700 disabled:opacity-50"
          >
            {isDeleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton Components
function BarberCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-slate-200"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-slate-200"></div>
            <div className="h-4 w-48 rounded bg-slate-200"></div>
            <div className="flex gap-2">
              <div className="h-3 w-20 rounded bg-slate-200"></div>
              <div className="h-3 w-16 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
          <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
          <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}

function BarberForm({
  mode,
  initialValue,
  onSubmit,
  submitting,
  onClose,
}: {
  mode: "create" | "edit";
  initialValue: BarberCreatePayload | UpdateBarberPayload;
  onSubmit: (payload: BarberCreatePayload | UpdateBarberPayload) => Promise<void>;
  submitting: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initialValue);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-6" onSubmit={async (event) => {
      event.preventDefault();
      await onSubmit(form);
    }}>
      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Full Name
          <span className="text-rose-500 ml-1">*</span>
        </label>
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <HiMiniUserCircle className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-slate-700" />
          </div>
          <input
            value={form.full_name ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
            className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-slate-800 focus:bg-white focus:shadow-md"
            placeholder="Marcus Johnson"
            required
            autoFocus
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Email Address
          <span className="text-rose-500 ml-1">*</span>
        </label>
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <HiOutlineEnvelope className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-slate-700" />
          </div>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all focus:border-slate-800 focus:bg-white focus:shadow-md"
            placeholder="barber@example.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          {mode === "create" ? "Password" : "New Password"}
          {mode === "create" && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <HiOutlineLockClosed className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-slate-700" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={form.password ?? ""}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-medium text-slate-800 outline-none transition-all focus:border-slate-800 focus:bg-white focus:shadow-md"
            placeholder={mode === "create" ? "Create secure password" : "Leave empty to keep current"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
          </button>
        </div>
        {mode === "edit" && (
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <HiOutlineCheckBadge className="h-3 w-3" />
            Only fill if you want to change password
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="h-11 flex-1 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="group relative h-11 flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
          <span className="relative flex items-center justify-center gap-2">
            {submitting ? (
              "Processing..."
            ) : (
              <>
                {mode === "create" ? "Create Barber" : "Save Changes"}
                <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProfileCompletion(user: User) {
  const values = [
    user.specialty,
    user.bio,
    user.location_text,
    user.work_start_time,
    user.work_end_time,
    user.services?.length ? "services" : "",
  ];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

export default function AdminBarbers() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<User | null>(null);
  const [deletingBarber, setDeletingBarber] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const barbersQuery = useQuery({
    queryKey: ["barbers"],
    queryFn: listBarbers,
  });

  const createMutation = useMutation({
    mutationFn: createBarber,
    onSuccess: async () => {
      toast.success("Barber created successfully", {
        position: "top-right"
      });
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create barber"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ barberId, payload }: { barberId: string; payload: UpdateBarberPayload }) =>
      updateBarber(barberId, payload),
    onSuccess: async () => {
      toast.success("Barber updated successfully");
      setEditingBarber(null);
      await queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update barber"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBarber,
    onSuccess: async () => {
      toast.success("Barber deleted successfully");
      setDeletingBarber(null);
      setMenuOpen(null);
      await queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete barber"));
    },
  });

  const barbers = useMemo(() => barbersQuery.data ?? [], [barbersQuery.data]);
  const isLoading = barbersQuery.isLoading;
  const activeCount = barbers.filter(b => b.is_active !== false).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
              Barbers
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isLoading ? "Loading team..." : (
                <>
                  {barbers.length} barber{barbers.length === 1 ? "" : "s"} • 
                  <span className="text-emerald-600 font-semibold ml-1">{activeCount} active</span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-slate-500/25"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
            <HiMiniPlus className="relative text-lg" />
            <span className="relative">Add Barber</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-emerald-50 p-2">
                <HiMiniUserCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-slate-950">{barbers.length}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">Total Barbers</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-2">
                <HiOutlineCheckBadge className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-slate-950">{activeCount}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">Active</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-amber-50 p-2">
                <HiMiniStar className="h-5 w-5 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-slate-950">4.8</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">Avg Rating</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-50 p-2">
                <HiMiniScissors className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-2xl font-black text-slate-950">150+</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">Total Cuts</p>
          </div>
        </div>

        {/* Barbers List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <BarberCardSkeleton />
              <BarberCardSkeleton />
              <BarberCardSkeleton />
            </>
          ) : barbers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center backdrop-blur-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                <HiMiniScissors className="text-4xl text-slate-400" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">No barbers yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Get started by adding your first barber to the team
              </p>
              <button
                onClick={() => setCreateOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <HiMiniPlus className="text-lg" />
                Add First Barber
              </button>
            </div>
          ) : (
            barbers.map((barber) => {
              const completion = getProfileCompletion(barber);
              return (
                <div
                  key={barber.id}
                  className="group relative transform transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-slate-400/10 to-slate-600/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
                
                  <article className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-xl">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Barber Info */}
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {barber.avatar ? (
                        <img 
                          src={barber.avatar} 
                          alt={barber.full_name} 
                          className="h-16 w-16 rounded-xl object-cover ring-2 ring-white shadow-md transition-transform duration-300 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 text-xl font-black text-white shadow-md">
                          {getInitials(barber.full_name)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-lg font-black text-slate-950">
                            {barber.full_name}
                          </h2>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                            <HiMiniStar className="text-amber-500" />
                            4.8 ★
                          </span>
                          {barber.is_active === false && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600">
                              <HiOutlineXMark className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                        
                        <p className="mt-1 truncate text-sm text-slate-500">{barber.email}</p>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <HiOutlineCalendar className="h-3 w-3" />
                            Joined {formatDate(barber.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <HiOutlineCheckBadge className="h-3 w-3" />
                            {barber.is_active !== false ? "Active" : "Deactivated"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">
                            Profil {completion}%
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                          <p>{barber.location_text || "Lokatsiya kiritilmagan"}</p>
                          <p>{barber.services?.length ? `${barber.services.length} xizmat qo'shilgan` : "Xizmatlar kiritilmagan"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingBarber(barber)}
                        className="group/btn flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-slate-800 hover:bg-slate-800 hover:text-white"
                        aria-label={`Edit ${barber.full_name}`}
                      >
                        <HiMiniPencilSquare className="text-lg transition-transform group-hover/btn:scale-110" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setDeletingBarber(barber)}
                        disabled={deleteMutation.isPending && deletingBarber?.id === barber.id}
                        className="group/btn flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Delete ${barber.full_name}`}
                      >
                        <HiMiniTrash className="text-lg transition-transform group-hover/btn:scale-110" />
                      </button>
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMenuOpen(menuOpen === barber.id ? null : barber.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-slate-800 hover:bg-slate-800 hover:text-white"
                        >
                          <HiMiniChevronDown className={`text-lg transition-transform ${menuOpen === barber.id ? "rotate-180" : ""}`} />
                        </button>
                        
                        {menuOpen === barber.id && (
                          <div className="absolute right-0 top-12 z-10 w-48 rounded-xl border border-slate-200 bg-white shadow-xl animate-fadeIn">
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(barber.email);
                                  toast.success("Email copied!");
                                  setMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                <HiOutlineEnvelope className="h-4 w-4" />
                                Copy Email
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  toast.info("Feature coming soon");
                                  setMenuOpen(null);
                                }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                <HiMiniUserCircle className="h-4 w-4" />
                                View Schedule
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  </article>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Side Drawer */}
      <SideDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New Barber"
      >
        <BarberForm
          mode="create"
          initialValue={emptyForm}
          submitting={createMutation.isPending}
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload as BarberCreatePayload);
          }}
          onClose={() => setCreateOpen(false)}
        />
      </SideDrawer>

      {/* Edit Side Drawer */}
      <SideDrawer
        isOpen={Boolean(editingBarber)}
        onClose={() => setEditingBarber(null)}
        title="Edit Barber"
      >
        {editingBarber && (
          <BarberForm
            mode="edit"
            initialValue={{
              full_name: editingBarber.full_name,
              email: editingBarber.email,
              password: "",
              is_active: editingBarber.is_active,
            }}
            submitting={updateMutation.isPending}
            onSubmit={async (payload) => {
              const nextPayload = { ...(payload as UpdateBarberPayload) };
              if (!nextPayload.password) {
                delete nextPayload.password;
              }
              await updateMutation.mutateAsync({ barberId: editingBarber.id, payload: nextPayload });
            }}
            onClose={() => setEditingBarber(null)}
          />
        )}
      </SideDrawer>

      <DeleteConfirmModal
        barber={deletingBarber}
        isDeleting={deleteMutation.isPending}
        onCancel={() => setDeletingBarber(null)}
        onConfirm={() => {
          if (deletingBarber) {
            deleteMutation.mutate(deletingBarber.id);
          }
        }}
      />
    </div>
  );
}
