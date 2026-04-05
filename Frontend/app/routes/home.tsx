import type { Route } from "./+types/home";

import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import { Marker, Popup } from "react-leaflet";
import { useRef } from "react";

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

  const animateRef = useRef(true);

  const places = [
    { id: 1, type: "restaurant", position: [61.05692, 28.19061], name: "Bistro" },
    { id: 2, type: "pizza", position: [61.0574, 28.192], name: "Pizza Spot" },
    { id: 3, type: "vegan", position: [61.0558, 28.1892], name: "Green Bowl" },
  ] as const;

  return (
    <MapContainer center={[61.05692, 28.19061]} zoom={15} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SetViewOnClick animateRef={animateRef} />

      {places.map((p) => (
        <MapPinMarker key={p.id} position={[p.position[0], p.position[1]]} type={p.type} size={40} popup={p.name} />
      ))
      }
    </MapContainer >
  );
}
