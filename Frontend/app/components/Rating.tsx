import { IoStarSharp } from "react-icons/io5";
import { Link } from "@tanstack/react-router";

/*
Rating
This component displays a star icon followed by the number of stars and the number of reviews in parentheses. 
It is designed to be used within the CardHeader component to show the restaurant's rating information. 
The component uses the Link component from react-router to allow users to click on the rating and navigate to a page with more detailed reviews or ratings for the restaurant.
*/
const Rating = ({ stars, reviews }: { stars: number, reviews: number }) => {
	return (
		<Link to="/" className="flex items-center gap-1 no-underline hover:underline">
			<span className="text-tertiary"><IoStarSharp /></span>
			<span className="text-sm font-medium text-gray-900">{stars}</span>
			<span className="text-sm text-gray-600">({reviews} reviews)</span>
		</Link>

	);
};

export default Rating;
