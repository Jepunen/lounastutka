import { getJSON } from "../auth/api";
import type { Place } from "~/data/places";

type BackendRestaurant = {
  id: number;
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
  category?: string;
  description?: string;
  phone?: string;
  website?: string;
  priceLevel?: string;
  stars?: number;
  reviews?: number;
  menu: { id?: number; menuId: number; name: string }[];
};

function toPlace(r: BackendRestaurant): Place {
  return {
    id: r.id,
    type: "restaurant",
    position: [r.lat ?? 0, r.lon ?? 0],
    name: r.name,
    category: r.category ?? "Ravintola",
    stars: r.stars ?? 0,
    reviews: r.reviews ?? 0,
    address: r.address,
    description: r.description,
    priceLevel: r.priceLevel,
    phone: r.phone,
    website: r.website,
    todayMenu: r.menu.map((item) => item.name),
  };
}

export async function getRestaurants(): Promise<Place[]> {
  const data = await getJSON<BackendRestaurant[]>("/restaurant/get-restaurant-data");
  return data.map(toPlace);
}
