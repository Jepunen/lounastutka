import { AnimatePresence, motion } from "framer-motion";
import {
    IoCallOutline,
    IoCloseSharp,
    IoEarthOutline,
    IoLocationOutline,
    IoPricetagsOutline,
    IoTimeOutline,
} from "react-icons/io5";
import CardContactSection from "./_RestaurantCard/CardContactSection";
import CardMenu from "./_RestaurantCard/CardMenu";
import CardMetaGrid from "./_RestaurantCard/CardMetaGrid";
import CardHeader from "./_RestaurantCard/CardHeader";

export interface MobileRestaurantSheetRestaurant {
    name: string;
    category: string;
    stars: number;
    reviews: number;
    distanceLabel?: string;
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
                    initial={{ y: -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                    data-mobile-restaurant-sheet
                    className="fixed inset-x-0 top-0 z-1000 flex h-[calc(52dvh)] min-h-72 flex-col md:hidden pointer-events-none px-3 pt-22 pb-4">
                    <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-3xl border border-dark/10 bg-linear-to-b from-neutral/98 via-neutral/96 to-neutral/92 shadow-2xl backdrop-blur-sm">
                        <div className="flex items-start justify-between gap-3 border-b border-dark/10 px-4 py-3">
                            <CardHeader name={restaurant.name} category={restaurant.category} stars={restaurant.stars} reviews={restaurant.reviews} distanceLabel={restaurant.distanceLabel} />
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close restaurant sheet"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-dark shadow-sm border border-dark/10"
                            >
                                <IoCloseSharp className="text-xl" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
                            <div className="flex flex-col gap-3">

                                <CardMetaGrid description={restaurant.description} todayHours={restaurant.todayHours} lunchTime={restaurant.lunchTime} priceLevel={restaurant.priceLevel} />

                                <CardMenu todayMenu={restaurant.todayMenu} />

                                <CardContactSection phone={restaurant.phone} website={restaurant.website} tags={restaurant.tags} address={restaurant.address} />

                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileRestaurantSheet;