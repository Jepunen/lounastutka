import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { MapBoundsTracker, MapSelectionFocus, SetViewOnClick, UserLocationControl } from "~/components/map/MapBehavior";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import MobileRestaurantSheet from "~/components/MobileRestaurantSheet";
import MapPinMarker from "~/components/MapPin";
import RestaurantCard from "~/components/RestaurantCard";
import { places, type Place } from "~/data/places";
import SearchBar from "~/components/SearchBar";
import { calculateDistanceMeters, formatDistance } from "~/utils/distance";
import { useUserLocation } from "~/components/UserLocationProvider";

type PlaceWithDistance = Place & {
  distanceMeters?: number;
  distanceLabel?: string;
};

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const animateRef = useRef(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [restaurantSelected, setRestaurantSelected] = useState<Place | null>(null);
  const [visiblePlaces, setVisiblePlaces] = useState<Place[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const { position: userPosition } = useUserLocation();

  const placesWithDistance = useMemo<PlaceWithDistance[]>(
    () =>
      places.map((place) => ({
        ...place,
        distanceMeters: userPosition ? calculateDistanceMeters(userPosition, place.position) : undefined,
        distanceLabel: userPosition ? formatDistance(calculateDistanceMeters(userPosition, place.position)) : undefined,
      })),
    [userPosition],
  );

  const visiblePlacesWithDistance = useMemo<PlaceWithDistance[]>(
    () =>
      visiblePlaces
        .map((place): PlaceWithDistance => {
          const placeWithDistance = placesWithDistance.find((candidate) => candidate.id === place.id);
          return placeWithDistance ?? { ...place, distanceMeters: undefined, distanceLabel: undefined };
        })
        .sort((left, right) => (left.distanceMeters ?? Number.POSITIVE_INFINITY) - (right.distanceMeters ?? Number.POSITIVE_INFINITY)),
    [placesWithDistance, visiblePlaces],
  );

  const selectedRestaurantWithDistance = useMemo(
    () => (restaurantSelected ? placesWithDistance.find((place) => place.id === restaurantSelected.id) ?? restaurantSelected : null),
    [placesWithDistance, restaurantSelected],
  );

  const orderedVisiblePlaces = visiblePlacesWithDistance;

  return (
    <div className="relative min-h-dvh w-full overflow-hidden">
      <div className="pointer-events-none fixed left-1/2 top-4 -translate-x-1/2 px-4" style={{ zIndex: 1100 }}>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          className="pointer-events-auto w-[min(34rem,calc(100vw-10rem))]"
        />
      </div>

      <MapContainer center={[61.05692, 28.19061]} zoom={15} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          referrerPolicy="origin-when-cross-origin"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnClick animateRef={animateRef} onMapClick={() => setRestaurantSelected(null)} />
        <MapBoundsTracker places={places} onBoundsChange={setVisiblePlaces} />
        <MapSelectionFocus restaurant={restaurantSelected} animateRef={animateRef} />
        <UserLocationControl />
        {placesWithDistance.map((p) => (
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
        restaurant={selectedRestaurantWithDistance}
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
