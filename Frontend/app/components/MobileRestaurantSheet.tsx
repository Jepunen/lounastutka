import { AnimatePresence, motion } from "framer-motion";
import RestaurantCard from "~/components/RestaurantCard";

export interface MobileRestaurantSheetRestaurant {
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
}

export interface MobileRestaurantSheetProps {
  restaurant: MobileRestaurantSheetRestaurant | null;
  onClose: () => void;
}

const MobileRestaurantSheet = ({ restaurant, onClose }: MobileRestaurantSheetProps) => {
  return (
    <AnimatePresence initial={false}>
      {restaurant && (
        <motion.div
          key={restaurant.name}
          layout
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 top-0 z-[1000] flex h-1/2 flex-col md:hidden pointer-events-none"
        >
          <div className="pointer-events-auto h-full overflow-hidden rounded-b-3xl border-b border-dark/10 bg-linear-to-b from-neutral/98 via-neutral/96 to-neutral/90 shadow-2xl backdrop-blur-sm pt-20">
            <div className="h-full overflow-y-auto px-3 pb-4">
              <motion.div layout initial={false} transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.75 }}>
                <RestaurantCard
                  name={restaurant.name}
                  category={restaurant.category}
                  stars={restaurant.stars}
                  reviews={restaurant.reviews}
                  address={restaurant.address}
                  description={restaurant.description}
                  todayHours={restaurant.todayHours}
                  lunchTime={restaurant.lunchTime}
                  priceLevel={restaurant.priceLevel}
                  phone={restaurant.phone}
                  website={restaurant.website}
                  tags={restaurant.tags}
                  todayMenu={restaurant.todayMenu}
                  isExpanded
                  onToggleMoreInfo={onClose}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileRestaurantSheet;