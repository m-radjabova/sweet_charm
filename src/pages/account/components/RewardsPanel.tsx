import { HiMiniGift, HiMiniTrophy, HiSparkles, HiMiniStar } from "react-icons/hi2";
import type { RewardsSummary } from "../../../api/account";
import bronzeBunny from "../../../assets/bunnies/bronze_bunny.png";
import diamondBunny from "../../../assets/bunnies/diamond_bunny.png";
import goldBunny from "../../../assets/bunnies/gold_bunny.png";
import silverBunny from "../../../assets/bunnies/silver_bunny.png";
import type { User } from "../../../types/types";
import { deriveTier } from "../utils";
import SectionHeader from "./SectionHeader";

const bunnyImageMap = {
  bronze: bronzeBunny,
  silver: silverBunny,
  gold: goldBunny,
  diamond: diamondBunny,
} as const;

const tierColors: Record<string, { bg: string; text: string; glow: string; gradient: string; accent: string }> = {
  bronze: {
    bg: "from-[#CD7F32]/10 to-[#CD7F32]/5",
    text: "text-[#CD7F32]",
    glow: "shadow-[#CD7F32]/20",
    gradient: "from-[#CD7F32] via-[#E8A87C] to-[#CD7F32]",
    accent: "#CD7F32",
  },
  silver: {
    bg: "from-[#C0C0C0]/10 to-[#C0C0C0]/5",
    text: "text-[#8A8A8A]",
    glow: "shadow-[#C0C0C0]/20",
    gradient: "from-[#A8A8A8] via-[#D4D4D4] to-[#A8A8A8]",
    accent: "#A8A8A8",
  },
  gold: {
    bg: "from-[#FFD700]/10 to-[#FFD700]/5",
    text: "text-[#B8860B]",
    glow: "shadow-[#FFD700]/20",
    gradient: "from-[#FFD700] via-[#FFE44D] to-[#FFD700]",
    accent: "#FFD700",
  },
  diamond: {
    bg: "from-[#B9F2FF]/10 to-[#B9F2FF]/5",
    text: "text-[#00B4D8]",
    glow: "shadow-[#B9F2FF]/20",
    gradient: "from-[#00B4D8] via-[#90E0EF] to-[#00B4D8]",
    accent: "#00B4D8",
  },
};

function fallbackSummary(profile: User | null | undefined): RewardsSummary {
  const sweetPoints = Math.max(0, Number(profile?.sweet_points ?? 0));
  const levels: RewardsSummary["levels"] = [
    { key: "bronze", name: "Bronze Bunny", min_points: 0, max_points: 999, reward_title: null, unlocked: true },
    { key: "silver", name: "Silver Bunny", min_points: 1000, max_points: 2499, reward_title: "Free Drink", unlocked: sweetPoints >= 1000 },
    { key: "gold", name: "Gold Bunny", min_points: 2500, max_points: 4999, reward_title: "$15 OFF Coupon", unlocked: sweetPoints >= 2500 },
    { key: "diamond", name: "Diamond Bunny", min_points: 5000, max_points: null, reward_title: "$35 OFF Coupon", unlocked: sweetPoints >= 5000 },
  ];
  const currentLevel =
    [...levels].reverse().find((level) => sweetPoints >= level.min_points) ??
    { key: "bronze", name: deriveTier(sweetPoints), min_points: 0, max_points: 999, reward_title: null, unlocked: true };
  const nextLevel = levels.find((level) => level.min_points > sweetPoints) ?? null;

  return {
    sweet_points: sweetPoints,
    points_per_dollar: 10,
    current_level: currentLevel,
    next_level: nextLevel,
    next_reward_title: nextLevel?.reward_title ?? null,
    points_to_next_level: nextLevel ? Math.max(0, nextLevel.min_points - sweetPoints) : 0,
    progress_percent: Math.min(100, Math.round((sweetPoints / 5000) * 100)),
    levels,
    transactions: [],
  };
}

function formatHistoryDate(value?: string | null) {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatHistoryItem(points: number, description: string) {
  const trimmed = description.trim();

  if (trimmed.startsWith("Earned ") && points > 0) {
    const orderMatch = trimmed.match(/order #([A-Z0-9]+)/i);
    return {
      title: `+${points} pts earned`,
      note: orderMatch ? `From order #${orderMatch[1]}` : "From completed order",
      kind: "points" as const,
    };
  }

  if (trimmed.startsWith("Unlocked Diamond bonus:")) {
    const rewardLabel = trimmed.replace("Unlocked Diamond bonus:", "").trim();
    const thresholdMatch = trimmed.match(/at\s+(\d+)\s+pts/i);
    return {
      title: "Diamond bonus unlocked",
      note: thresholdMatch ? `${rewardLabel} at ${Number(thresholdMatch[1]).toLocaleString()} pts` : rewardLabel,
      kind: "bonus" as const,
    };
  }

  if (trimmed.startsWith("Unlocked ") && trimmed.includes("reward:")) {
    const rewardLabel = trimmed.split("reward:")[1]?.trim() ?? "Reward";
    return {
      title: "Reward unlocked",
      note: rewardLabel,
      kind: "reward" as const,
    };
  }

  if (points > 0) {
    return {
      title: `+${points} pts earned`,
      note: trimmed || "Sweet Points added",
      kind: "points" as const,
    };
  }

  return {
    title: "Reward updated",
    note: trimmed || "Sweet reward activity",
    kind: "reward" as const,
  };
}

export default function RewardsPanel({
  profile,
  summary,
}: {
  profile: User | null | undefined;
  summary?: RewardsSummary;
}) {
  const rewards = summary ?? fallbackSummary(profile);
  const sweetPoints = rewards.sweet_points;
  const currentLevel = rewards.current_level;
  const nextLevel = rewards.next_level;
  const bunnyImage = bunnyImageMap[currentLevel.key];
  const colors = tierColors[currentLevel.key] ?? tierColors.bronze;
  const historyItems = rewards.transactions.map((item) => {
    const parsed = formatHistoryItem(item.points, item.description);
    if (parsed.kind === "points") {
      return {
        id: item.id,
        title: parsed.title,
        note: parsed.note,
        date: formatHistoryDate(item.created_at),
        tone: "text-[#2E7D32]",
        badge: "bg-[#EAF8E8]",
        badgeLabel: "Points",
        icon: <HiMiniStar className="h-3.5 w-3.5 text-[#2E7D32]" />,
      };
    }
    if (parsed.kind === "bonus") {
      return {
        id: item.id,
        title: parsed.title,
        note: parsed.note,
        date: formatHistoryDate(item.created_at),
        tone: "text-[#A25A1F]",
        badge: "bg-[#FFF3D8]",
        badgeLabel: "Diamond Bonus",
        icon: <HiSparkles className="h-3.5 w-3.5 text-[#A25A1F]" />,
      };
    }
    return {
      id: item.id,
      title: parsed.title,
      note: parsed.note,
      date: formatHistoryDate(item.created_at),
      tone: "text-[#B45C76]",
      badge: "bg-[#FFF0F4]",
      badgeLabel: "Reward",
      icon: <HiMiniGift className="h-3.5 w-3.5 text-[#B45C76]" />,
    };
  });

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#FFFDF8] to-[#FFF5E8] p-4 shadow-[0_8px_32px_rgba(175,117,60,0.08)] sm:rounded-3xl sm:p-5">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-[#FFE8EF]/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-[#FFF5E1]/40 to-transparent blur-3xl" />

      <SectionHeader
        icon={<HiMiniTrophy className="h-4 w-4" />}
        title="Sweet Points"
        subtitle="Earn rewards with every order"
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
        {/* Left side - Points info */}
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFF0E1] to-[#FFE8D6] px-3.5 py-1.5 text-xs font-bold text-[#9A6E42] shadow-sm ring-1 ring-[#F5E6D8]/50">
              <span className={`inline-block h-2 w-2 rounded-full ${currentLevel.key === "bronze" ? "bg-[#CD7F32]" : currentLevel.key === "silver" ? "bg-[#C0C0C0]" : currentLevel.key === "gold" ? "bg-[#FFD700]" : "bg-[#00B4D8]"}`} />
              {currentLevel.name}
            </span>
            <span className="rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-bold text-[#C58F63] shadow-sm ring-1 ring-white/50">
              $1 = {rewards.points_per_dollar} pts
            </span>
          </div>

          <div className="mt-5 flex items-end gap-2">
            <span className="bg-gradient-to-b from-[#4A2800] to-[#7A4A1A] bg-clip-text text-5xl font-black leading-none text-transparent sm:text-6xl">
              {sweetPoints.toLocaleString()}
            </span>
            <span className="bg-gradient-to-r from-[#F25D88] to-[#FF8AAA] bg-clip-text pb-1 text-xl font-black text-transparent">
              pts
            </span>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#9A6E42]">
            <HiMiniStar className="h-4 w-4 text-[#F7B04F]" />
            {nextLevel
              ? `Need ${rewards.points_to_next_level.toLocaleString()} more points for ${nextLevel.name}.`
              : `Need ${rewards.points_to_next_level.toLocaleString()} more points for the next ${rewards.next_reward_title ?? "$35 OFF Coupon"}.`}
          </p>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="relative h-3.5 overflow-hidden rounded-full bg-[#F8E3CF] shadow-inner">
              <div
                className="relative h-full rounded-full bg-gradient-to-r from-[#FF8AAA] via-[#F7B04F] to-[#F25D88] transition-all duration-1000 ease-out"
                style={{ width: `${rewards.progress_percent}%` }}
              >
                <div className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs font-bold text-[#C58F63]">
              <span>0 pts</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F7B04F]" />
                <span>{rewards.progress_percent}% complete</span>
              </div>
              <span>5,000 pts</span>
            </div>
          </div>

          {/* Tier badges row */}
          <div className="mt-4 flex items-center gap-2">
            {rewards.levels.map((level) => {
              const tierColor = tierColors[level.key] ?? tierColors.bronze;
              const isUnlocked = level.unlocked;
              const isCurrent = level.key === currentLevel.key;
              return (
                <div
                  key={level.key}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    isCurrent
                      ? `bg-gradient-to-r ${tierColor.bg} ${tierColor.text} scale-105 shadow-sm`
                      : isUnlocked
                        ? `bg-white/60 ${tierColor.text}`
                        : "bg-white/30 text-[#D4BFA8]"
                  }`}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      isUnlocked ? (level.key === "bronze" ? "bg-[#CD7F32]" : level.key === "silver" ? "bg-[#C0C0C0]" : level.key === "gold" ? "bg-[#FFD700]" : "bg-[#00B4D8]") : "bg-[#D4BFA8]"
                    }`}
                  />
                  {level.name.split(" ")[0]}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side - Bunny card */}
        <div className="group relative">
          <div className="relative overflow-hidden rounded-[2rem] bg-white/70 p-5 text-center shadow-lg shadow-[#F5E6D8]/50 backdrop-blur-sm ring-1 ring-[#F5E6D8] transition-all duration-500 hover:shadow-xl hover:shadow-[#F5E6D8]/70">
            {/* Glow effect */}
            <div className={`pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-r ${colors.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`} />

            <div className="relative">
              <div className="mx-auto flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors.bg} blur-xl transition-all duration-500 group-hover:scale-110`} />
                <img
                loading="lazy"
                  src={bunnyImage}
                  alt={currentLevel.name}
                  className="relative h-28 w-28 object-contain transition-all duration-500 group-hover:scale-110 sm:h-32 sm:w-32"
                />
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#B1845D]">Next reward</p>
                <p className="flex items-center justify-center gap-2 text-lg font-black text-[#6C410C]">
                  <HiMiniGift className="h-5 w-5 text-[#F25D88] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  {rewards.next_reward_title ?? currentLevel.reward_title ?? "Keep earning"}
                </p>
              </div>

              {/* Sparkle decorations */}
              <HiSparkles className="absolute -right-1 -top-1 h-4 w-4 text-[#F7B04F] opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:rotate-12" />
              <HiSparkles className="absolute -left-1 bottom-8 h-3 w-3 text-[#FF8AAA] opacity-0 transition-all delay-150 duration-500 group-hover:opacity-100 group-hover:-rotate-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Reward History */}
      <div className="mt-6 overflow-hidden rounded-[2rem] bg-white/75 p-5 shadow-lg shadow-[#F5E6D8]/30 ring-1 ring-[#F5E6D8]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#4A2800]">Reward History</p>
            <p className="mt-0.5 text-xs font-semibold text-[#B1845D]">Latest Sweet Points activity and coupon unlocks</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FFF0E1] to-[#FFE8D6] px-3.5 py-1.5 text-xs font-bold text-[#9A6E42] shadow-sm">
            <HiMiniStar className="h-3 w-3" />
            {historyItems.length} entries
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {historyItems.length ? (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-[#F5E6D8]/30 transition-all duration-300 hover:bg-white hover:shadow-md hover:ring-[#F5E6D8]/60"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF5E8] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FFF0E1]">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-extrabold ${item.tone}`}>{item.title}</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#9A6E42]">{item.note}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#C58F63]">{item.date}</p>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm transition-all duration-300 group-hover:scale-105 ${item.badge} ${item.tone}`}>
                  {item.badgeLabel}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-[#FFFDF8] to-[#FFF5E8] px-4 py-8 text-center shadow-sm ring-1 ring-[#F5E6D8]/30">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0E1]">
                <HiMiniGift className="h-6 w-6 text-[#F25D88]" />
              </div>
              <p className="text-sm font-bold text-[#9A6E42]">No activity yet</p>
              <p className="mt-1 text-xs font-semibold text-[#C58F63]">
                Your reward activity will appear here after orders are delivered.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}