import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { IoRestaurantOutline } from "react-icons/io5";
import { IoPizzaOutline } from "react-icons/io5";
import { IoLeafOutline } from "react-icons/io5";

type MapPinType = "restaurant" | "pizza" | "vegan";

export function MapPinVisual({ type, size = 50 }: { type: MapPinType; size?: number }) {
	let icon;
	switch (type) {
		case "restaurant":
			icon = <IoRestaurantOutline />;
			break;
		case "pizza":
			icon = <IoPizzaOutline />;
			break;
		case "vegan":
			icon = <IoLeafOutline />;
			break;
		default:
			icon = <IoRestaurantOutline />;
	}

	return (
		<div
			style={{ width: size, height: size, fontSize: size * 0.6 }}
			className={`bg-primary rounded-full text-neutral flex items-center justify-center`}
		>
			{icon}
		</div>
	);
};

const iconCache = new Map<string, L.DivIcon>();

function getMapPinIcon(type: MapPinType, size: number) {
	const key = type + ":" + size;
	const cached = iconCache.get(key);
	if (cached) return cached;

	const created = L.divIcon({
		html: renderToStaticMarkup(<MapPinVisual type={type} size={size} />),
		className: "",
		iconSize: [size, size],
		iconAnchor: [size / 2, size / 2],
		popupAnchor: [0, -size / 2],
	});

	iconCache.set(key, created);
	return created;
}

export default function MapPinMarker({
	position,
	type,
	size = 50,
	popup,
	setRestaurantEvent,
}: {
	position: LatLngExpression;
	type: MapPinType;
	size?: number;
	popup?: React.ReactNode;
	setRestaurantEvent: () => void;
}) {
	const icon = useMemo(() => getMapPinIcon(type, size), [type, size]);

	return (
		<Marker
			position={position}
			icon={icon}
			eventHandlers={{ click: () => setRestaurantEvent() }}
		>
			{popup ? <Popup>{popup}</Popup> : null}
		</Marker>
	);
}