import { useState } from "react";
import { useTranslation } from "react-i18next";

type PromotionComposerProps = {
  subscribersCount: number;
  sending?: boolean;
  onSend: (payload: { title?: string | null; message: string }) => Promise<unknown> | void;
};

export default function PromotionComposer({
  subscribersCount,
  sending = false,
  onSend,
}: PromotionComposerProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;
    await onSend({
      title: title.trim() || null,
      message: normalizedMessage,
    });
    setTitle("");
    setMessage("");
  };

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-600">{t("promotion.badge")}</p>
          <h3 className="mt-1 text-xl font-black text-slate-900">{t("promotion.title")}</h3>
          <p className="mt-2 text-sm text-slate-600">
            {t("promotion.description")}
          </p>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
          {t("promotion.recipients", { count: subscribersCount })}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
          placeholder={t("promotion.titlePlaceholder")}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={600}
          rows={4}
          placeholder={t("promotion.messagePlaceholder")}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{message.trim().length}/600</p>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={sending || !message.trim() || subscribersCount === 0}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? t("promotion.sending") : t("promotion.send")}
        </button>
      </div>
    </div>
  );
}
