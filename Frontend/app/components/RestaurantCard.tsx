import { IoImageOutline } from "react-icons/io5";
import Button from "~/components/Button";
import FavouriteButton from "~/components/FavouriteButton";
import Rating from "~/components/Rating";

export interface RestaurantCardProps {
  name: string;
  category: string;
  stars: number;
  reviews: number;
  onViewMenu?: () => void;
}

const RestaurantCard = ({ name, category, stars, reviews, onViewMenu }: RestaurantCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        <div className="w-20 h-20 rounded-xl bg-gray flex items-center justify-center text-4xl text-dark/40 shrink-0">
          <IoImageOutline />
        </div>
        <div className="flex flex-col gap-1 pt-1">
          <span className="font-bold text-lg text-dark leading-tight">{name}</span>
          <span className="text-secondary font-medium text-sm">{category}</span>
          <Rating stars={stars} reviews={reviews} />
        </div>
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

export default RestaurantCard;
