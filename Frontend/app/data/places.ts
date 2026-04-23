export type Place = {
  id: number;
  type: "restaurant" | "pizza" | "vegan";
  position: [number, number];
  name: string;
  category: string;
  stars: number;
  reviews: number;
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

export type PlaceWithDistance = Place & {
  distanceMeters?: number;
  distanceLabel?: string;
};
