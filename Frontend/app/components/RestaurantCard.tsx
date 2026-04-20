import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoImageOutline } from "react-icons/io5";
import {
  IoCallOutline,
  IoEarthOutline,
  IoLocationOutline,
  IoPricetagsOutline,
  IoTimeOutline,
} from "react-icons/io5";
import Button from "~/components/Button";
import FavouriteButton from "~/components/FavouriteButton";
import Rating from "~/components/Rating";

export interface RestaurantCardProps {
  restaurant: {
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
  };
  isExpanded?: boolean;
  onToggleMoreInfo?: () => void;
  onViewMenu?: () => void;
}

const RestaurantCard = ({
  restaurant,
  isExpanded = false,
  onToggleMoreInfo,
  onViewMenu,
}: RestaurantCardProps) => {
  const {
    name,
    category,
    stars,
    reviews,
    distanceLabel,
    address,
    description,
    todayHours,
    lunchTime,
    priceLevel,
    phone,
    website,
    tags = [],
    todayMenu = [],
  } = restaurant;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.8 }}
      className="bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-3"
    >
      <div className="flex gap-3 items-start">
        <div className="w-24 h-24 rounded-xl bg-gray flex items-center justify-center text-4xl text-dark/40 shrink-0">
          <IoImageOutline />
        </div>
        <div className=" flex flex-row min-w-0 justify-between">
          <div className="flex flex-col gap-1 pt-1">
            <span className="font-bold text-lg text-dark leading-tight">{name}</span>
            <span className="text-secondary font-medium text-sm">{category}</span>
            <Rating stars={stars} reviews={reviews} />
          </div>
        </div>
        {distanceLabel && (
          <div className="flex items-center gap-1 text-2xl font-semibold text-primary pb-12">
            <IoLocationOutline className="text-base" />
            <span>{distanceLabel}</span>
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              {description && (
                <div className="bg-neutral rounded-xl p-3">
                  <span className="text-sm leading-relaxed text-dark/90">{description}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {todayHours && (
                  <div className="rounded-xl border border-dark/10 p-3 bg-white">
                    <div className="flex items-center gap-2 text-secondary font-semibold text-sm mb-1">
                      <IoTimeOutline />
                      <span>Today</span>
                    </div>
                    <div className="text-sm text-dark/90">{todayHours}</div>
                    {lunchTime && <div className="text-xs text-dark/70 mt-1">Lounas: {lunchTime}</div>}
                  </div>
                )}

                {priceLevel && (
                  <div className="rounded-xl border border-dark/10 p-3 bg-white">
                    <div className="flex items-center gap-2 text-secondary font-semibold text-sm mb-1">
                      <IoPricetagsOutline />
                      <span>Hinta</span>
                    </div>
                    <div className="text-sm text-dark/90">{priceLevel}</div>
                  </div>
                )}
              </div>

              {todayMenu.length > 0 && (
                <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-3">
                  <div className="font-semibold text-sm text-secondary mb-2">Ruokalista tänään</div>
                  <ul className="flex flex-col gap-2">
                    {todayMenu.map((item) => (
                      <li key={item} className="text-sm text-dark/90 leading-snug bg-white/70 rounded-lg px-2 py-1">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(phone || website || tags.length > 0 || address) && (
                <div className="rounded-xl bg-secondary/5 p-3 flex flex-col gap-2 border border-secondary/30">
                  {phone && (
                    <div className="flex items-center gap-2 text-sm text-dark/85">
                      <IoCallOutline className="text-secondary" />
                      <span>{phone}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-2 text-sm text-dark/85">
                      <IoEarthOutline className="text-secondary" />
                      <a href={website} target="_blank" rel="noreferrer" className="underline decoration-secondary/60 underline-offset-2">
                        {website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                  {address && (
                    <div className="flex items-center gap-2 text-sm text-dark/85">
                      <IoLocationOutline className="text-secondary" />
                      <span>{address}</span>
                    </div>
                  )}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-secondary font-semibold rounded-full bg-white px-2 py-1 border border-dark/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHOW MORE INFO BUTTON*/}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Button
            variant="primary"
            onClick={() => {
              onToggleMoreInfo?.();
            }}
          >
            {isExpanded ? "Hide" : "More"} Info
          </Button>
        </div>
        <FavouriteButton size={40} />
      </div>
    </motion.div>
  );
};

export default RestaurantCard;