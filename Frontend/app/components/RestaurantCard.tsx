import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import CardHeader from "./_RestaurantCard/CardHeader";
import CardActions from "./_RestaurantCard/CardActions";
import CardContactSection from "./_RestaurantCard/CardContactSection";
import CardMetaGrid from "./_RestaurantCard/CardMetaGrid";
import CardMenu from "./_RestaurantCard/CardMenu";

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

/*
RestaurantCard
This component is responsible for displaying a restaurant's information in a card format. 
It includes a header with the restaurant's name, category, rating, and distance, as well as an expandable section that shows additional details such as the restaurant's description, today's hours, lunch time, price level, menu, and contact information. 
The component uses framer-motion for smooth animations when expanding and collapsing the details section. 
The onToggleMoreInfo callback is triggered when the user clicks the button to show more information, allowing the parent component to control the expanded state of the card.
*/
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
      <CardHeader
        name={name}
        category={category}
        stars={stars}
        reviews={reviews}
        distanceLabel={distanceLabel}
      />
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
              <CardMetaGrid
                description={description}
                todayHours={todayHours}
                lunchTime={lunchTime}
                priceLevel={priceLevel}
              />
              <CardMenu todayMenu={todayMenu} />

              <CardContactSection phone={phone} website={website} tags={tags} address={address} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHOW MORE INFO BUTTON*/}
      <CardActions isExpanded={isExpanded} onToggleMoreInfo={onToggleMoreInfo} />

    </motion.div>
  );
};

export default RestaurantCard;