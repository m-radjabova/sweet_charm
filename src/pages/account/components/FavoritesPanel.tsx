import { HiMiniHeart } from "react-icons/hi2";
import type { FeaturedDessert } from "../../../types/types";
import DessertMiniCard from "./DessertMiniCard";
import SectionHeader from "./SectionHeader";

interface Props {
  favoriteDesserts: FeaturedDessert[];
  favoriteIds: string[];
  toggleFavorite: (dessertId: string, dessert?: FeaturedDessert) => void;
}

export default function FavoritesPanel({ favoriteDesserts, favoriteIds, toggleFavorite }: Props) {
  const visibleDesserts = favoriteDesserts;

  return (
    <section className="rounded-3xl border border-white/60 bg-white/95 p-5 shadow-[0_8px_32px_rgba(175,117,60,0.08)]">
      <SectionHeader
        icon={<HiMiniHeart className="h-4 w-4" />}
        title="Favorites"
        subtitle="Your sweetest picks, saved just for you"
      />

      {visibleDesserts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] bg-gradient-to-br from-[#FFF8F0] to-[#FFF3E7] p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 shadow-sm">
            <HiMiniHeart className="h-8 w-8 text-[#F25D88]/70" />
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#B7885D]">
            No favorites yet. Browse desserts and tap the heart to save them!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visibleDesserts.map((dessert, index) => (
            <DessertMiniCard
              key={dessert.id}
              dessert={dessert}
              index={index}
              favorite={favoriteIds.includes(dessert.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
}
