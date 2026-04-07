import { IoStarSharp } from "react-icons/io5";
import { Link } from "react-router";

const Rating = ({ stars, reviews }: {stars: number, reviews: number}) => {
	return (
		<Link to="/" className="flex items-center gap-1 no-underline hover:underline">
			<span className="text-tertiary"><IoStarSharp/></span>
			<span className="text-sm font-medium text-gray-900">{stars}</span>
			<span className="text-sm text-gray-600">({reviews} reviews)</span>
		</Link>

	);
};

export default Rating;