import { HiMiniGift, HiMiniTrophy } from "react-icons/hi2";
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

  return (
    <section className="rounded-3xl border border-white/60 bg-gradient-to-br from-[#FFFDF8] to-[#FFF5E8] p-5 shadow-[0_8px_32px_rgba(175,117,60,0.08)]">
      <SectionHeader
        icon={<HiMiniTrophy className="h-4 w-4" />}
        title="Sweet Points"
        subtitle="Earn rewards with every order"
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FFF0E1] px-3 py-1 text-xs font-semibold text-[#9A6E42]">
              {currentLevel.name}
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#C58F63]">
              $1 = {rewards.points_per_dollar} pts
            </span>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-5xl font-bold leading-none text-[#4A2800] sm:text-6xl">
              {sweetPoints.toLocaleString()}
            </span>
            <span className="pb-1 text-xl font-bold text-[#F25D88]">pts</span>
          </div>

          <p className="mt-3 text-sm text-[#9A6E42]">
            {nextLevel
              ? `Need ${rewards.points_to_next_level.toLocaleString()} more points for ${nextLevel.name}.`
              : "All rewards unlocked."}
          </p>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#F8E3CF]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF8AAA] via-[#F7B04F] to-[#F25D88] transition-all duration-700"
              style={{ width: `${rewards.progress_percent}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#C58F63]">
            <span>0 pts</span>
            <span>5,000 pts</span>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white/65 p-4 text-center shadow-sm ring-1 ring-[#F5E6D8]">
          <img
            src={bunnyImage}
            alt={currentLevel.name}
            className="mx-auto h-28 w-28 object-contain sm:h-32 sm:w-32"
          />
          <p className="mt-3 text-sm font-semibold text-[#B1845D]">Next reward</p>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-lg font-bold text-[#6C410C]">
            <HiMiniGift className="h-4 w-4 text-[#F25D88]" />
            {rewards.next_reward_title ?? currentLevel.reward_title ?? "Keep earning"}
          </p>
        </div>
      </div>
    </section>
  );
}
