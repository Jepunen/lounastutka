import { AppError } from "../utils/error.ts";
import type {
  RestaurantModel,
  MenuItemModel,
  RawMenuDataModel
} from "../database/models.ts";
import db from "../database/helpers";

// Type to be returned to the frontend, extension of restaurantmodel with the Menuitems basically
export type AllRestaurantData = RestaurantModel & {
  menu: MenuItemModel[];
};

// Well, with around 17000 potential entries within Finland: 
//  https://www.mara.fi/toimiala/tilastot/yritysten-ja-tyollisten-maara/ravintolayritysten-maara.html, 
//  we might need the dedicated DB query for this route.
//  I suppose there could be localized restaurant information fetching to limit the returned rows
//  and maybe even caching to have unchanged data ready at hand to prevent IO overhead
//  But for now this shall do.
export async function getAllRestaurantData(): Promise<AllRestaurantData[]> {
  // Get a list of all restaurants found from DB
  const restaurants: RestaurantModel[] = await db.getAllRestaurants();
  if (!restaurants || (restaurants.length === 0)) {
    throw new AppError("Could not find restaurant data.", 404);
  }

  // Get each all menuitems with the dedicated query, there might not be any, so return empty list
  const rawMenuItems: RawMenuDataModel[] = await db.getAllRestaurantsMenus();
  if (!rawMenuItems) throw new AppError("Database query failed", 500);

  // We need to parse the data to format where restaurants and their menus can be linked via ID:
  const menuMap = new Map<number, MenuItemModel[]>();

  for (const row of rawMenuItems) {
    // First, if the menumap does not have particular restaurant menu setup, add it as empty
    // So for each restaurant, we have a list of its menu items.
    if (!menuMap.has(row.restaurantId)) {
      menuMap.set(row.restaurantId, []);
    }
    // Then add items to the restaurants menu, so push to the 
    // maps menulist based on restaurant id position:
    menuMap.get(row.restaurantId)!.push({
      id: row.id,
      menuId: row.menuId,
      name: row.name
    });
  }

  // Form the final data to be returned:
  const data: AllRestaurantData[] = restaurants.map((rest) => ({
    ...rest,
    menu: menuMap.get(rest.id!) ?? []
  }));

  return data;
};

