import { IoHeartSharp } from "react-icons/io5";

/*
FavouriteButton
This component renders a circular button with a heart icon, which is typically used to indicate a "favorite" or "like" action. 
The size of the button can be customized through the size prop, which adjusts both the width and height of the button as well as the font size of the icon. 
The button has a specific background color and text color, and it is styled to be centered and rounded, making it visually appealing and easy to interact with for users who want to mark something as a favorite.
*/
const FavouriteButton = ({ size = 30 }: { size?: number }) => {

	return (
		<div
			style={{ width: size, height: size, fontSize: size * 0.6 }}
			className={`bg-[#B1F0CE] rounded-full text-[#2D6A4F] flex items-center justify-center`}
		>
			<IoHeartSharp />
		</div>
	);
};

export default FavouriteButton;