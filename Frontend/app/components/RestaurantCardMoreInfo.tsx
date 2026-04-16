import { IoImageOutline } from "react-icons/io5";
import Button from "~/components/Button";
import FavouriteButton from "~/components/FavouriteButton";
import Rating from "~/components/Rating";

export interface RestaurantCardMoreInfoProps {
  restaurant: {
    name: string;
    category: string;
    stars: number;
    reviews: number;
    address?: string;
    description?: string;
  };
  onViewMenu?: () => void;

}

const RestaurantCardMoreInfo = ({ restaurant, onViewMenu }: RestaurantCardMoreInfoProps) => {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        <div className="w-40 h-40 rounded-xl bg-gray flex items-center justify-center text-4xl text-dark/40 shrink-0">
          <IoImageOutline />
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <span className="font-bold text-3xl text-dark leading-tight">{restaurant.name}</span>
          <span className="text-secondary font-medium text-xl">{restaurant.category}</span>
          <span className="text-md">{restaurant.address}</span>
          <Rating stars={restaurant.stars} reviews={restaurant.reviews} />
        </div>
      </div>
      <div>
        <span className="text-sm text-secondary">{restaurant.description}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Button variant="primary" onClick={onViewMenu}>View Menu</Button>
        </div>
        <FavouriteButton size={40} />
      </div>
    </div>
  );
};

export default RestaurantCardMoreInfo;
