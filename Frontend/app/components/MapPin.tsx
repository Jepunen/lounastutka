import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { IoRestaurantOutline } from "react-icons/io5";
import { IoPizzaOutline } from "react-icons/io5";
import { IoLeafOutline } from "react-icons/io5";

type MapPinType = "restaurant" | "pizza" | "vegan";


/*
MapPinVisual
This function component renders the visual representation of a map pin based on the specified type. 
It uses different icons for different types of pins (e.g., restaurant, pizza, vegan) and styles them with a consistent background and color scheme. 
The size of the pin can be adjusted through the size prop, allowing for flexibility in how the pins are displayed on the map.
*/
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


/*
getMapPinIcon
This function generates a Leaflet DivIcon for a map pin based on the specified type and size. 
It uses a cache to store previously generated icons, so if an icon with the same type and size is requested again, it can be retrieved from the cache instead of being recreated. 
The icon is created by rendering the MapPinVisual component to static markup and then using that markup as the HTML content for the DivIcon. 
The icon's size, anchor, and popup anchor are set based on the specified size to ensure proper positioning on the map.
*/
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

/*
MapPinMarker
This function component renders a map marker at a specified position with a given type and size. 
It uses the getMapPinIcon function to generate the appropriate icon for the marker based on the type and size props. 
The marker also has an optional popup that can display additional information when clicked, and it triggers the setRestaurantEvent callback when the marker is clicked, allowing for interaction with the marker on the map.
*/
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