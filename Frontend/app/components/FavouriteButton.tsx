import { IoHeartSharp } from "react-icons/io5";

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