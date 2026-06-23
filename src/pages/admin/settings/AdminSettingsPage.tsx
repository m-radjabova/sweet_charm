import { useQuery } from "@tanstack/react-query";
import { HiMiniCog6Tooth, HiMiniShieldCheck } from "react-icons/hi2";
import { getMyProfile } from "../../../api/profile";
import { formatDate, formatDisplayPhone } from "../../account/utils";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";

export default function AdminSettingsPage() {
  const profileQuery = useQuery({ queryKey: ["my-profile"], queryFn: getMyProfile });
  const profile = profileQuery.data;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Admin / Settings"
        title="Admin Center"
        description="Core admin identity and environment information for the Sweet Charm control panel."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminSurface>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7E9F] to-[#F25D88] text-white shadow-md">
              <HiMiniShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#5E3906]">Admin Profile</h3>
              <p className="text-sm text-[#9A6E42]">The currently authenticated admin account</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <InfoRow label="Full name" value={profile?.full_name ?? "Sweet Admin"} />
            <InfoRow label="Email" value={profile?.email ?? "admin@sweetcharm.com"} />
            <InfoRow label="Phone" value={formatDisplayPhone(profile?.phone)} />
            <InfoRow label="Role" value={profile?.role ?? "admin"} />
            <InfoRow label="Joined" value={formatDate(profile?.created_at, "Recently")} />
          </div>
        </AdminSurface>

        <AdminSurface>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE8EF] to-[#FFF7E8] text-[#F25D88] shadow-md">
              <HiMiniCog6Tooth className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#5E3906]">Environment Notes</h3>
              <p className="text-sm text-[#9A6E42]">Useful reminders for this admin workspace</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm leading-7 text-[#8B6237]">
            <div className="rounded-2xl bg-[#FFF9F3] px-4 py-3">Desserts and categories are powered by real CRUD endpoints.</div>
            <div className="rounded-2xl bg-[#FFF9F3] px-4 py-3">Orders can be updated directly from the admin orders workspace.</div>
            <div className="rounded-2xl bg-[#FFF9F3] px-4 py-3">Reviews now enter a moderation flow and need admin approval before appearing publicly.</div>
          </div>
        </AdminSurface>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#FFF9F3] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C39A72]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#5E3906]">{value}</p>
    </div>
  );
}
