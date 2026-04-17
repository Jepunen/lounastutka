import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import MobileRestaurantSheet from "~/components/MobileRestaurantSheet";
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
  address?: string;
  description?: string;
  todayHours?: string;
  lunchTime?: string;
  priceLevel?: string;
  phone?: string;
  website?: string;
  tags?: string[];
  todayMenu?: string[];
};

const places: Place[] = [
  {
    id: 1,
    type: "restaurant",
    position: [61.05692, 28.19061],
    name: "Bistro",
    category: "Ravintola",
    stars: 4.9,
    reviews: 120,
    address: "Villimiehenkatu 1, 53100 Lappeenranta",
    description: "Kotoisa lounasravintola keskustassa. Tarjolla päivittäin salaattipöytä, lämmin pääruoka ja talon leipä.",
    todayHours: "10:30-15:00",
    lunchTime: "10:30-14:00",
    priceLevel: "Lounas 13,20 EUR",
    phone: "+358 40 123 4567",
    website: "https://bistro-example.fi",
    tags: ["Paikan päällä", "Takeaway", "Kasvisvaihtoehto"],
    todayMenu: [
      "Lohikeitto, saaristolaisleipä",
      "Paahdettu broileri, timjamikastike",
      "Punajuuririsotto (vege)",
      "Mustikkarahka",
    ],
  },
  {
    id: 2,
    type: "pizza",
    position: [61.0574, 28.192],
    name: "Pizza Spot",
    category: "Pizza ja kebab",
    stars: 4.5,
    reviews: 98,
    address: "Kauppakatu 10, 53100 Lappeenranta",
    description: "Nopea lounas ja runsaat annokset. Päivittäin vaihtuva pizzabuffet sekä kebab-annokset.",
    todayHours: "11:00-20:00",
    lunchTime: "11:00-14:30",
    priceLevel: "Lounas 12,50 EUR",
    phone: "+358 50 765 4321",
    website: "https://pizzaspot-example.fi",
    tags: ["Pizza buffet", "Kebab", "Kotiinkuljetus"],
    todayMenu: [
      "Pizzabuffet: Margherita, Pollo BBQ, Quattro Formaggi",
      "Kana-kebab riisillä ja valkosipulikastikkeella",
      "Falafel wrap ja chili-majoneesi",
      "Päivän salaattipöytä",
    ],
  },
  {
    id: 3,
    type: "vegan",
    position: [61.0558, 28.1892],
    name: "Green Bowl",
    category: "Kasvisruoka",
    stars: 4.7,
    reviews: 54,
    address: "Rauhankatu 5, 53100 Lappeenranta",
    description: "Kasvispainotteinen lounaskahvila, jossa painotetaan sesonkituotteita ja paikallisia raaka-aineita.",
    todayHours: "10:00-17:00",
    lunchTime: "10:30-14:00",
    priceLevel: "Lounas 12,90 EUR",
    phone: "+358 45 321 9090",
    website: "https://greenbowl-example.fi",
    tags: ["Vegaaninen", "Gluteeniton vaihtoehto", "Luomu"],
    todayMenu: [
      "Linssi-kookoscurry ja jasmiiniriisi",
      "Paahdettu kukkakaali-tahinikulho",
      "Täytetty bataatti ja chimichurri",
      "Sitruuna-chia vanukas",
    ],
  },
];

function SetViewOnClick({ animateRef, onMapClick }: { animateRef: React.RefObject<boolean>, onMapClick?: () => void }) {
  const map = useMapEvent("click", (e) => {
    onMapClick?.();
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
        <MapBoundsTracker onBoundsChange={setVisiblePlaces} />
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
                  name={p.name}
                  category={p.category}
                  stars={p.stars}
                  reviews={p.reviews}
                  address={p.address}
                  description={p.description}
                  todayHours={p.todayHours}
                  lunchTime={p.lunchTime}
                  priceLevel={p.priceLevel}
                  phone={p.phone}
                  website={p.website}
                  tags={p.tags}
                  todayMenu={p.todayMenu}
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
