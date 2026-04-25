import { HiMiniBanknotes, HiMiniCalendarDays, HiMiniCreditCard } from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import useStudentOverview from "../../hooks/useStudentOverview";
import { formatDate, formatMonthYear } from "../../utils/date";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount);
}

export default function StudentPayments() {
  const {
    state: { user },
  } = useContextPro();
  const { payments, loading } = useStudentOverview(user?.id);

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-[30px] border border-white/70 bg-white/90 p-8 text-center shadow-xl">
          To'lovlar yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-3 pb-8 sm:p-4 lg:space-y-6 lg:p-6">
      <section className="rounded-[26px] bg-[linear-gradient(135deg,#3b2205_0%,#8b5e07_50%,#f59e0b_100%)] p-5 text-white shadow-[0_26px_90px_rgba(217,119,6,0.18)] sm:rounded-[34px] sm:p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-amber-100/80">Payments</p>
        <h1 className="mt-3 text-4xl font-black">To'lovlar tarixi</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-amber-50/80">
          To'lovlaringiz qachon, qancha va qaysi usulda amalga oshirilganini shu sahifada kuzatib borasiz.
        </p>
      </section>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-lg sm:rounded-[28px] sm:p-5">
          <HiMiniBanknotes className="text-3xl text-amber-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Jami to'langan summa</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{formatCurrency(totalPaid)} so'm</p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-lg sm:rounded-[28px] sm:p-5">
          <HiMiniCreditCard className="text-3xl text-emerald-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">To'lovlar soni</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{payments.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-lg sm:rounded-[28px] sm:p-5">
          <HiMiniCalendarDays className="text-3xl text-sky-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Oxirgi to'lov</p>
          <p className="mt-1 text-xl font-black text-slate-900">{formatDate(payments[0]?.paid_at)}</p>
        </div>
      </div>

      <section className="space-y-4">
        {payments.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/90 p-8 text-center text-slate-500">
            To'lov ma'lumotlari topilmadi.
          </div>
        ) : (
          payments.map((payment) => (
            <article
              key={payment.id}
              className="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-600">
                    {payment.status === "paid" ? "To'lov qabul qilingan" : payment.status}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    {formatCurrency(Number(payment.amount || 0))} so'm
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{formatDate(payment.paid_at)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {payment.method === "card" ? "Karta" : "Naqd"}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    Oy: {formatMonthYear(payment.month_for)}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Izoh</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {payment.note || "Qo'shimcha izoh qoldirilmagan."}
                </p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
