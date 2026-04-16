import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoImageOutline } from "react-icons/io5";
import Button from "~/components/Button";
import FavouriteButton from "~/components/FavouriteButton";
import Rating from "~/components/Rating";

export interface RestaurantCardProps {
  name: string;
  category: string;
  stars: number;
  reviews: number;
  address?: string;
  description?: string;
  isExpanded?: boolean;
  onToggleMoreInfo?: () => void;
  onViewMenu?: () => void;
}

const RestaurantCard = ({
  name,
  category,
  stars,
  reviews,
  address,
  description,
  isExpanded = false,
  onToggleMoreInfo,
  onViewMenu,
}: RestaurantCardProps) => {

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
        <div className="flex flex-col gap-1 pt-1">
          <span className="font-bold text-lg text-dark leading-tight">{name}</span>
          <span className="text-secondary font-medium text-sm">{category}</span>
          <span className="text-md">{address}</span>
          <Rating stars={stars} reviews={reviews} />

        </div>
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
              <div>
                <span className="text-md">{description}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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