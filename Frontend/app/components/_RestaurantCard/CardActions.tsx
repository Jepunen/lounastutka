import Button from "../Button";
import FavouriteButton from "../FavouriteButton";


const CardActions = ({ isExpanded, onToggleMoreInfo }: { isExpanded: boolean; onToggleMoreInfo?: () => void }) => {

  // Card Actions component is responsible for rendering the buttons that allow users to interact with the restaurant card. It includes a "More Info" button that toggles additional information about the restaurant and a "Favourite" button that allows users to mark the restaurant as a favorite.
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