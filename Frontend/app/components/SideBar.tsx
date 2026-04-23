import { motion } from "framer-motion";
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";
import RestaurantCard from "./RestaurantCard";
import type { Place, PlaceWithDistance } from "~/data/places";


type SideBarProps = {
  isOpen: boolean;
  onToggleOpen: () => void;
  visiblePlaces: PlaceWithDistance[];
  restaurantSelected: Place | null;
  onSelectRestaurant: (place: Place | null) => void;
};

/*
SideBar
This component renders a sidebar that displays a list of visible restaurants on the map. 
It includes a toggle button to open and close the sidebar, and when open, it shows a list of RestaurantCard components for each visible restaurant. 
The sidebar also highlights the selected restaurant and allows the user to select a restaurant by clicking on its card, which triggers the onSelectRestaurant callback to update the selected restaurant in the parent component.
*/
const SideBar = ({
  isOpen,
  onToggleOpen,
  visiblePlaces,
  restaurantSelected,
  onSelectRestaurant,
}: SideBarProps) => {

  return (
    <div
      className={`absolute z-1000 top-0 right-0 h-full hidden md:flex flex-col transition-all duration-300 bg-linear-to-r from-transparent from-0% via-neutral/70 via-30% to-neutral to-60% ${isOpen ? "w-100" : "w-10"
        }`}
    >
      <button
        onClick={onToggleOpen}
        className="flex items-center justify-center h-9 w-9 shrink-0 bg-white text-dark shadow-md rounded-full hover:bg-gray transition-colors mt-20 ml-1"
      >
        {isOpen ? <IoChevronForwardSharp /> : <IoChevronBackSharp />}
      </button>

      {isOpen && (
        <motion.div
          layout
          className="overflow-y-auto flex flex-col gap-3 pb-24 px-3 pt-2"
        >
          {visiblePlaces.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={false}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 34,
                mass: 0.75,
              }}
            >
              <RestaurantCard
                restaurant={p}
                isExpanded={restaurantSelected?.id === p.id}
                onToggleMoreInfo={() => {
                  onSelectRestaurant(restaurantSelected?.id === p.id ? null : p);
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SideBar;
