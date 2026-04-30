import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiMiniArrowTopRightOnSquare,
  HiMiniBolt,
  HiMiniCheckBadge,
  HiMiniQrCode,
  HiMiniClipboard,
  HiMiniCheck,
} from "react-icons/hi2";
import type { TelegramLinkInfo, UserRole } from "../types/types";

function formatConnectedAt(locale: string, value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatTokenExpiry(locale: string, value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type TelegramConnectCardProps = {
  info?: TelegramLinkInfo;
  role: UserRole;
  loading?: boolean;
  refreshing?: boolean;
  onRefreshLink: () => void;
};

export default function TelegramConnectCard({
  info,
  role,
  loading = false,
  refreshing = false,
  onRefreshLink,
}: TelegramConnectCardProps) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isBarber = role === "barber";
  const connected = info?.connected ?? false;
  const linkExpired = Boolean(
    info?.token_expires_at && new Date(info.token_expires_at).getTime() <= Date.now(),
  );
  
  const qrCodeUrl = useMemo(() => {
    if (!info?.deep_link_url) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&color=0E1E5E&bgcolor=FFFFFF&data=${encodeURIComponent(info.deep_link_url)}`;
  }, [info?.deep_link_url]);
  
  const locale = i18n.language.startsWith("ru") ? "ru-RU" : "uz-UZ";
  const connectedAt = formatConnectedAt(locale, info?.telegram_connected_at);
  const tokenExpiresAt = formatTokenExpiry(locale, info?.token_expires_at);

  const handleCopyLink = async () => {
    if (!info?.deep_link_url) return;
    await navigator.clipboard.writeText(info.deep_link_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-sky-50/30 to-white shadow-2xl shadow-slate-200/50 transition-all duration-500 hover:shadow-xl">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(14,165,233,0.08),_transparent_50%)]" />
      <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-gradient-to-br from-sky-200/20 to-cyan-200/20 blur-3xl" />
      
      {/* Header Section */}
      <div className="relative border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white/50 px-6 py-5 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-3.5 py-1.5 shadow-lg shadow-sky-500/20">
              <HiMiniBolt className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Telegram Bot
                </span>
              </div>
            
            <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {isBarber 
                ? t("telegram.titleBarber")
                : t("telegram.titleUser")}
            </h3>
            
            <p className="mt-2 text-sm leading-relaxed text-slate-600 max-w-xl">
              {isBarber
                ? t("telegram.descriptionBarber")
                : t("telegram.descriptionUser")}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className={`self-start rounded-full px-4 py-2 text-sm font-bold shadow-lg transition-all duration-300 ${
            connected
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-500/20"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20"
          }`}>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${connected ? "bg-white animate-pulse" : "bg-white"}`} />
              {connected ? t("telegram.connected") : t("telegram.disconnected")}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative p-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* QR Code Section */}
          <div className="group/qr">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-lg ring-1 ring-slate-200/50 transition-all duration-300 hover:shadow-xl">
              {loading ? (
                <div className="flex h-[240px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-sky-500" />
                    <p className="text-sm font-medium text-slate-500">{t("common.loading")}</p>
                  </div>
                </div>
              ) : qrCodeUrl ? (
                <div className="relative">
                  <img 
                    src={qrCodeUrl} 
                    alt="Telegram QR code" 
                    className="h-[240px] w-[240px] rounded-2xl object-cover transition-transform duration-300 group-hover/qr:scale-105" 
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/0 transition-all duration-300 group-hover/qr:bg-black/5" />
                </div>
              ) : (
                <div className="flex h-[240px] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                  <div className="rounded-full bg-white p-4 shadow-md">
                    <HiMiniQrCode className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="mt-4 text-center text-sm font-medium text-slate-500">
                    {t("telegram.qrPreparing")}
                  </p>
                </div>
              )}
            </div>
            
            {info?.deep_link_url && (
              <button
                onClick={handleCopyLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                {copied ? (
                  <>
                    <HiMiniCheck className="h-4 w-4 text-emerald-500" />
                    <span>{t("telegram.linkCopied")}</span>
                  </>
                ) : (
                  <>
                    <HiMiniClipboard className="h-4 w-4" />
                    <span>{t("telegram.copyLink")}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info & Steps Section */}
          <div className="space-y-5">
            {/* Steps Card */}
            <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200/50 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/20">
                  <span className="text-sm font-black text-white">1</span>
                </div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {t("telegram.stepsTitle")}
                </p>
              </div>
              
              <div className="mt-4 space-y-3">
                {[
                  t("telegram.step1"),
                  t("telegram.step2"),
                  t("telegram.step3"),
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-slate-50">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-100 to-cyan-100 text-xs font-black text-sky-600">
                      {idx + 2}
                    </div>
                    <p className="text-sm font-medium text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Card */}
            <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md ring-1 ring-slate-200/50 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <HiMiniCheckBadge className="h-5 w-5 text-emerald-500" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {t("telegram.statusTitle")}
                </p>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm font-semibold text-slate-600">{t("telegram.statusLabel")}</span>
                  <span className={`text-sm font-bold ${connected ? "text-emerald-600" : "text-amber-600"}`}>
                    {connected ? t("telegram.connectedShort") : t("telegram.disconnectedShort")}
                  </span>
                </div>
                
                {connected && connectedAt && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-sm font-semibold text-slate-600">{t("telegram.connectedAt")}</span>
                    <span className="text-sm font-medium text-slate-700">{connectedAt}</span>
                  </div>
                )}

                {!connected && tokenExpiresAt && (
                  <div className={`rounded-xl p-3 ${linkExpired ? "bg-rose-50" : "bg-slate-50"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-600">{t("telegram.expiresAt")}</span>
                      <span className={`text-sm font-medium ${linkExpired ? "text-rose-600" : "text-slate-700"}`}>
                        {tokenExpiresAt}
                      </span>
                    </div>
                    {linkExpired && (
                      <p className="mt-2 text-xs font-medium text-rose-600">
                        {t("telegram.expiredHint")}
                      </p>
                    )}
                  </div>
                )}
                
                {isBarber && (
                  <div className="overflow-hidden rounded-xl bg-gradient-to-r from-sky-50 to-cyan-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">{t("telegram.subscribers")}</span>
                      <span className="text-2xl font-black bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                        {info?.subscribers_count ?? 0}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{t("telegram.subscribersHint")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={info?.deep_link_url ?? info?.bot_url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className={`group/btn inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 ${
                  info?.deep_link_url || info?.bot_url
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 hover:shadow-xl hover:scale-105"
                    : "pointer-events-none bg-slate-300"
                }`}
              >
                <span>{t("telegram.openBot")}</span>
                <HiMiniArrowTopRightOnSquare className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </a>
              
              <button
                type="button"
                onClick={onRefreshLink}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white"
              >
                {refreshing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
                    <span>{t("common.refreshing")}</span>
                  </>
                ) : (
                  <>
                    <HiMiniQrCode className="h-4 w-4" />
                    <span>{connected ? t("telegram.newLink") : t("telegram.refreshQr")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
