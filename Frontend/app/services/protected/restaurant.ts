import { getJSON, postJSON } from "../auth/api";

export async function sendRestaurantUrl(url: string) {
  return postJSON("/protected/add-restaurant-url", {
    restaurantUrl: url
  });
}

