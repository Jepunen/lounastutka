import Button from "../Button";
import FavouriteButton from "../FavouriteButton";


const CardActions = ({ isExpanded, onToggleMoreInfo }: { isExpanded: boolean; onToggleMoreInfo?: () => void }) => {

  return (
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
  );
}

export default CardActions;