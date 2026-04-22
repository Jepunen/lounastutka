import { AnimatePresence, motion } from "framer-motion";
import {
    IoCallOutline,
    IoCloseSharp,
    IoEarthOutline,
    IoLocationOutline,
    IoPricetagsOutline,
    IoTimeOutline,
} from "react-icons/io5";

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
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold tracking-wide text-secondary">Restaurant details</div>
                                <div className="truncate text-lg font-bold leading-tight text-dark">{restaurant.name}</div>
                                <div className="text-sm text-dark/70">{restaurant.category}</div>

                            </div>
                            {restaurant.distanceLabel && (
                                <div className="mt-1 flex items-center gap-1 text-xl font-semibold text-primary">
                                    <IoLocationOutline className="text-base" />
                                    <span>{restaurant.distanceLabel}</span>
                                </div>
                            )}
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
                                {restaurant.description && (
                                    <div className="rounded-2xl bg-white/80 p-3 shadow-sm border border-dark/5">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-secondary mb-1">About</div>
                                        <p className="text-sm leading-relaxed text-dark/90">{restaurant.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    {restaurant.todayHours && (
                                        <div className="rounded-2xl border border-dark/10 bg-white p-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary">
                                                <IoTimeOutline />
                                                <span>Today</span>
                                            </div>
                                            <div className="mt-1 text-sm font-medium text-dark/90">{restaurant.todayHours}</div>
                                            {restaurant.lunchTime && <div className="mt-1 text-xs text-dark/65">Lunch: {restaurant.lunchTime}</div>}
                                        </div>
                                    )}

                                    {restaurant.priceLevel && (
                                        <div className="rounded-2xl border border-dark/10 bg-white p-3">
                                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary">
                                                <IoPricetagsOutline />
                                                <span>Price</span>
                                            </div>
                                            <div className="mt-1 text-sm font-medium text-dark/90">{restaurant.priceLevel}</div>
                                        </div>
                                    )}
                                </div>

                                {restaurant.todayMenu && restaurant.todayMenu.length > 0 && (
                                    <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-3">
                                        <div className="mb-2 text-sm font-semibold text-secondary">Today's menu</div>
                                        <ul className="flex flex-col gap-2">
                                            {restaurant.todayMenu.map((item) => (
                                                <li key={item} className="rounded-xl bg-white/80 px-3 py-2 text-sm leading-snug text-dark/90 shadow-sm">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="rounded-2xl bg-white/80 p-3 shadow-sm border border-dark/5 flex flex-col gap-2">
                                    {restaurant.phone && (
                                        <div className="flex items-center gap-2 text-sm text-dark/85">
                                            <IoCallOutline className="text-secondary" />
                                            <span>{restaurant.phone}</span>
                                        </div>
                                    )}
                                    {restaurant.website && (
                                        <div className="flex items-center gap-2 text-sm text-dark/85">
                                            <IoEarthOutline className="text-secondary" />
                                            <a href={restaurant.website} target="_blank" rel="noreferrer" className="underline decoration-secondary/60 underline-offset-2">
                                                {restaurant.website.replace(/^https?:\/\//, "")}
                                            </a>
                                        </div>
                                    )}
                                    {restaurant.address && (
                                        <div className="flex items-center gap-2 text-sm text-dark/85">
                                            <IoLocationOutline className="text-secondary" />
                                            <span>{restaurant.address}</span>
                                        </div>
                                    )}
                                    {restaurant.tags && restaurant.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {restaurant.tags.map((tag) => (
                                                <span key={tag} className="rounded-full border border-dark/10 bg-white px-2 py-1 text-xs font-semibold text-secondary">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileRestaurantSheet;