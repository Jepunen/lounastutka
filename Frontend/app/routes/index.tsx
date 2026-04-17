import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { MapBoundsTracker, MapSelectionFocus, SetViewOnClick } from "~/components/map/MapBehavior";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import MobileRestaurantSheet from "~/components/MobileRestaurantSheet";
import MapPinMarker from "~/components/MapPin";
import RestaurantCard from "~/components/RestaurantCard";
import { places, type Place } from "~/data/places";
import SearchBar from "~/components/SearchBar";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const animateRef = useRef(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [restaurantSelected, setRestaurantSelected] = useState<Place | null>(null);
  const [visiblePlaces, setVisiblePlaces] = useState<Place[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const orderedVisiblePlaces = restaurantSelected
    ? [
      restaurantSelected,
      ...visiblePlaces.filter((p) => p.id !== restaurantSelected.id),
    ]
    : visiblePlaces;

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      {/* Search bar — overlays the map at the top */}
      <div className="fixed top-4 z-[1100] inset-x-0 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchBar value={searchValue} onChange={setSearchValue} />
        </div>
      </div>

      <MapContainer center={[61.05692, 28.19061]} zoom={15} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnClick animateRef={animateRef} onMapClick={() => setRestaurantSelected(null)} />
        <MapBoundsTracker places={places} onBoundsChange={setVisiblePlaces} />
        <MapSelectionFocus restaurant={restaurantSelected} animateRef={animateRef} />
        {places.map((p) => (
          <MapPinMarker
            key={p.id}
            position={p.position}
            type={p.type}
            size={40}
            popup={p.name}
            setRestaurantEvent={() => {
              setSidebarOpen(true);
              setRestaurantSelected(p);
            }}
          />
        ))}
      </MapContainer>

      <MobileRestaurantSheet
        restaurant={restaurantSelected}
        onClose={() => setRestaurantSelected(null)}
      />

      <div
        className={`absolute z-1000 top-0 right-0 h-full hidden md:flex flex-col transition-all duration-300 bg-linear-to-r from-transparent from-0% via-neutral/70 via-30% to-neutral to-60% ${sidebarOpen ? "w-100" : "w-10"
          }`}
      >
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex items-center justify-center h-9 w-9 shrink-0 bg-white text-dark shadow-md rounded-full hover:bg-gray transition-colors mt-20 ml-1"
        >
          {sidebarOpen ? <IoChevronForwardSharp /> : <IoChevronBackSharp />}
        </button>

        {sidebarOpen && (
          <motion.div layout className="overflow-y-auto flex flex-col gap-3 pb-24 px-3 pt-2">
            {orderedVisiblePlaces.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={false}
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.75 }}
              >
                <RestaurantCard
                  restaurant={p}
                  isExpanded={restaurantSelected?.id === p.id}
                  onToggleMoreInfo={() => {
                    setRestaurantSelected((current) => (current?.id === p.id ? null : p));
                  }}
                />
              </motion.div>
            ))
            }
          </motion.div>
        )}
      </div>
    </div>
  );
}
