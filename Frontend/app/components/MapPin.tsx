import { IoRestaurantOutline } from "react-icons/io5";
import { IoPizzaOutline } from "react-icons/io5";
import { IoLeafOutline } from "react-icons/io5";

const MapPin = ({ type, size = 50 }: { type: string, size?: number }) => {
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

export default MapPin;