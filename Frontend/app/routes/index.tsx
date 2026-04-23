import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { MapBoundsTracker, MapSelectionFocus, SetViewOnClick, UserLocationControl } from "~/components/map/MapBehavior";
import MobileRestaurantSheet from "~/components/MobileRestaurantSheet";
import MapPinMarker from "~/components/MapPin";
import SideBar from "~/components/SideBar";
import { usePlaces } from "~/hooks/usePlaces";
import type { Place, PlaceWithDistance } from "~/data/places";
import SearchBar from "~/components/SearchBar";
import { calculateDistanceMeters, formatDistance } from "~/utils/distance";
import { useUserLocation } from "~/components/UserLocationProvider";

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
  const { places } = usePlaces();

  const placesWithDistance = useMemo<PlaceWithDistance[]>(
    () =>
      places.map((place) => ({
        ...place,
        distanceMeters: userPosition ? calculateDistanceMeters(userPosition, place.position) : undefined,
        distanceLabel: userPosition ? formatDistance(calculateDistanceMeters(userPosition, place.position)) : undefined,
      })),
    [userPosition, places],
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

      <SideBar
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((open) => !open)}
        visiblePlaces={visiblePlacesWithDistance}
        restaurantSelected={restaurantSelected}
        onSelectRestaurant={setRestaurantSelected}
      />
    </div>
  );
}
