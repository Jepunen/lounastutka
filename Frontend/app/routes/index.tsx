import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import MapPinMarker from "~/components/MapPin";
import RestaurantCard from "~/components/RestaurantCard";
import SearchBar from "~/components/SearchBar";

export const Route = createFileRoute("/")({
  component: Home,
});

type Place = {
  id: number;
  type: "restaurant" | "pizza" | "vegan";
  position: [number, number];
  name: string;
  category: string;
  stars: number;
  reviews: number;
};

const places: Place[] = [
  { id: 1, type: "restaurant", position: [61.05692, 28.19061], name: "Bistro", category: "Ravintola", stars: 4.9, reviews: 120 },
  { id: 2, type: "pizza",      position: [61.0574,  28.192  ], name: "Pizza Spot", category: "Pizza ja kebab", stars: 4.5, reviews: 98 },
  { id: 3, type: "vegan",      position: [61.0558,  28.1892 ], name: "Green Bowl", category: "Kasvisruoka", stars: 4.7, reviews: 54 },
];

function SetViewOnClick({ animateRef }: { animateRef: React.RefObject<boolean> }) {
  const map = useMapEvent("click", (e) => {
    map.setView(e.latlng, map.getZoom(), { animate: animateRef.current || false });
  });
  return null;
}

function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (visible: Place[]) => void }) {
  const map = useMap();

  const update = () => {
    const bounds = map.getBounds();
    onBoundsChange(places.filter((p) => bounds.contains(p.position)));
  };

  useMapEvent("moveend", update);
  useMapEvent("zoomend", update);
  useEffect(() => { update(); }, []);

  return null;
}

function Home() {
  const animateRef = useRef(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visiblePlaces, setVisiblePlaces] = useState<Place[]>([]);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative h-screen w-full">
      {/* Search bar — overlays the map at the top */}
      <div className="fixed top-4 z-[1000] inset-x-0 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchBar value={searchValue} onChange={setSearchValue} />
        </div>
      </div>

      <MapContainer center={[61.05692, 28.19061]} zoom={15} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnClick animateRef={animateRef} />
        <MapBoundsTracker onBoundsChange={setVisiblePlaces} />
        {places.map((p) => (
          <MapPinMarker
            key={p.id}
            position={p.position}
            type={p.type}
            size={40}
            popup={p.name}
          />
        ))}
      </MapContainer>

      <div
        className={`absolute z-1000 top-0 right-0 h-full hidden md:flex flex-col transition-all duration-300 bg-linear-to-r from-transparent from-0% via-neutral/70 via-30% to-neutral to-60% ${
          sidebarOpen ? "w-80" : "w-10"
        }`}
      >
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex items-center justify-center h-9 w-9 shrink-0 bg-white text-dark shadow-md rounded-full hover:bg-gray transition-colors mt-20 ml-1"
        >
          {sidebarOpen ? <IoChevronForwardSharp /> : <IoChevronBackSharp />}
        </button>

        {sidebarOpen && (
          <div className="overflow-y-auto flex flex-col gap-3 pb-24 px-3 pt-2">
            {visiblePlaces.map((p) => (
              <RestaurantCard
                key={p.id}
                name={p.name}
                category={p.category}
                stars={p.stars}
                reviews={p.reviews}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
