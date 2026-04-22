import { div } from "framer-motion/client"
import { IoImageOutline, IoLocationOutline } from "react-icons/io5";
import Rating from "../Rating";



const CardHeader = ({ name, category, stars, reviews, distanceLabel }: { name: string; category: string; stars: number; reviews: number; distanceLabel?: string }) => {
  return (

    <div className="flex gap-3 items-start">
      <div className="w-24 h-24 rounded-xl bg-gray flex items-center justify-center text-4xl text-dark/40 shrink-0">
        <IoImageOutline />
      </div>
      <div className=" flex flex-row min-w-0 justify-between">
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex flex-row justify-between items-start gap-2">
            <span className="font-bold text-xl text-dark leading-tight">{name}</span>
            {
              distanceLabel && (
                <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                  <IoLocationOutline className="text-base" />
                  <span>{distanceLabel}</span>
                </div>
              )
            }
          </div>
          <span className="text-secondary font-medium text-sm">{category}</span>
          <Rating stars={stars} reviews={reviews} />
        </div>
      </div>

    </div >
  );
}

export default CardHeader;