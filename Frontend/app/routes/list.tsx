import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { IoRestaurantOutline, IoPizzaOutline, IoLeafOutline, IoSearchOutline } from "react-icons/io5";
import RestaurantCard from "~/components/RestaurantCard";
import { places, type Place } from "~/data/places";
import { calculateDistanceMeters, formatDistance } from "~/utils/distance";
import { useUserLocation } from "~/components/UserLocationProvider";

export const Route = createFileRoute("/list")({
  component: ListView,
});

const typeFilters = [
  { label: "Kaikki", value: null },
  { label: "Ravintola", value: "restaurant" as Place["type"], icon: IoRestaurantOutline },
  { label: "Pizza", value: "pizza" as Place["type"], icon: IoPizzaOutline },
  { label: "Kasvis", value: "vegan" as Place["type"], icon: IoLeafOutline },
];

type PlaceWithDistance = Place & {
  distanceMeters?: number;
  distanceLabel?: string;
};

function ListView() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<Place["type"] | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { position: userPosition } = useUserLocation();

  const filtered = useMemo<PlaceWithDistance[]>(() => {
    const q = search.toLowerCase();

    return places
      .filter((place) => {
        const matchesType = activeType === null || place.type === activeType;
        const matchesSearch =
          q === "" ||
          place.name.toLowerCase().includes(q) ||
          place.category.toLowerCase().includes(q) ||
          place.tags?.some((tag) => tag.toLowerCase().includes(q));

        return matchesType && matchesSearch;
      })
      .map((place) => ({
        ...place,
        distanceMeters: userPosition ? calculateDistanceMeters(userPosition, place.position) : undefined,
        distanceLabel: userPosition ? formatDistance(calculateDistanceMeters(userPosition, place.position)) : undefined,
      }))
      .sort((left, right) => (left.distanceMeters ?? Number.POSITIVE_INFINITY) - (right.distanceMeters ?? Number.POSITIVE_INFINITY));
  }, [activeType, search, userPosition]);

  return (
    <div className="min-h-dvh bg-neutral flex flex-col items-center">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral/90 backdrop-blur-sm pt-4 pb-3 px-4 flex flex-col gap-3 border-b border-dark/10 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-dark">Lounaspaikat</h1>

        {/* Search input */}
        <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm border border-dark/10">
          <IoSearchOutline className="text-dark/40 text-xl shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hae ravintolaa..."
            className="flex-1 bg-transparent outline-none text-dark placeholder:text-dark/40 text-sm"
            maxLength={100}
          />
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {typeFilters.map(({ label, value, icon: Icon }) => {
            const active = activeType === value;
            return (
              <button
                key={label}
                onClick={() => setActiveType(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors duration-150 cursor-pointer ${active
                    ? "bg-primary text-neutral border-primary"
                    : "bg-white text-dark/70 border-dark/10 hover:border-dark/20"
                  }`}
              >
                {Icon && <Icon className="text-base" />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 px-4 pt-4 pb-28 w-full max-w-2xl">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-dark/40">
            <IoSearchOutline className="text-5xl" />
            <span className="text-base font-medium">Ei tuloksia</span>
          </div>
        ) : (
          filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2, ease: "easeOut" }}
            >
              <RestaurantCard
                restaurant={p}
                isExpanded={expandedId === p.id}
                onToggleMoreInfo={() =>
                  setExpandedId((cur) => (cur === p.id ? null : p.id))
                }
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
