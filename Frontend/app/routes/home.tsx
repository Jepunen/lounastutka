import { useRef } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import Button from "~/components/Button";
import MapPinMarker from "~/components/MapPin";

function SetViewOnClick({ animateRef }: { animateRef: React.MutableRefObject<boolean> }) {
  const map = useMapEvent("click", (e) => {
    map.setView(e.latlng, map.getZoom(), { animate: animateRef.current || false });
  }
  );
  return null;
}

export default function Home() {

  const navigate = useNavigate();
  const animateRef = useRef(true);
  const places = [
    { id: 1, type: "restaurant", position: [61.05692, 28.19061], name: "Bistro" },
    { id: 2, type: "pizza", position: [61.0574, 28.192], name: "Pizza Spot" },
    { id: 3, type: "vegan", position: [61.0558, 28.1892], name: "Green Bowl" },
  ] as const;

  return (
    <div className="relative h-screen w-full">
      <MapContainer
        center={[61.05692, 28.19061]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnClick animateRef={animateRef} />

        {places.map((p) => (
          <MapPinMarker
            key={p.id}
            position={[p.position[0], p.position[1]]}
            type={p.type}
            size={40}
            popup={p.name}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute right-4 top-4 z-[1000] gap-4 flex flex-col">
        <Button
          variant="secondary"
          onClick={() => (animateRef.current = !animateRef.current)}
          className="pointer-events-auto"
        >
          Toggle Animation
        </Button>
        {/* Navigate to /components page */}
        <Button
          variant="primary"
          onClick={() => navigate("/components")}
          className="pointer-events-auto"
        >
          Component Page
        </Button>
      </div>
    </div>
  );
}
