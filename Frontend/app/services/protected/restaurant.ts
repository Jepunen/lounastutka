import { postJSON } from "../auth/api";

export type RestaurantPreview = {
  name: string;
  address: string;
  position: [number, number];
  category?: string;
  description?: string;
  todayHours?: string;
  lunchTime?: string;
  priceLevel?: string;
  phone?: string;
  website?: string;
  tags?: string[];
  todayMenu?: string[];
  stars?: number;
  reviews?: number;
};

export async function previewRestaurantFromUrl(url: string): Promise<RestaurantPreview> {
  return postJSON<RestaurantPreview>("/protected/preview-from-site", { restaurantUrl: url });
}

export async function sendRestaurantUrl(url: string) {
  return postJSON("/protected/parse-from-site", { restaurantUrl: url });
}

export async function addRestaurantManually(data: RestaurantPreview) {
  return postJSON("/protected/add-restaurant-information", { restaurantData: data });
}
