# Map and List View Behavior

## Map View (`/`)

The map view is the primary interface for browsing restaurants. It combines an interactive Leaflet map with sidebar and mobile sheet overlays for restaurant discovery and selection.

### Core Components

- **MapContainer**: Root React Leaflet container rendering OpenStreetMap tiles (OSM).
- **MapBehavior components**: Pluggable controllers handling map interactions:
  - `SetViewOnClick`: Listener for map clicks; clears restaurant selection when user taps the map.
  - `MapBoundsTracker`: Tracks visible restaurants within current map bounds; updates sidebar and sheet in real time as user pans or zooms.
  - `MapSelectionFocus`: When a restaurant is selected, recenters the map to keep the pin visible while accounting for mobile UI overlays (sheet + bottom nav).
  - `UserLocationControl`: Floating button to locate user; displays a circle marker at user position; handles geolocation errors.

### Interaction Flow

1. **Load**: Map initializes at hardcoded center (Lappeenranta); fetches all restaurants from API.
2. **Pan/Zoom**: Map bounds change → `MapBoundsTracker` filters visible restaurants → sidebar updates.
3. **Select**: User clicks pin or sidebar item → `setRestaurantSelected()` → `MapSelectionFocus` animates map to keep selection in frame.
4. **Deselect**: User clicks map (not a pin) or closes sheet → selection clears.
5. **Search**: Global search bar (top-center) filters visible restaurants by name, category, or tags.

### Responsive Behavior

- **Desktop**: Sidebar is persistent on the left; shows full list of visible restaurants.
- **Mobile**: Sidebar is not visible; selected restaurant shows in a container under search bar so that map is still visible a bit
- **Recentering**: On mobile, `MapSelectionFocus` calculates optimal center point to avoid obscuring pins behind the sheet and navigation.

## List View (`/list`)

The list view displays all restaurants in a vertically scrollable feed, with client-side search and filtering.

### Core Features

- **Search**: Text input filters restaurants by name, category, or tags (case-insensitive substring match).
- **Type Filter**: Pills for "Kaikki" (all), "Ravintola" (restaurant), "Pizza", and "Kasvis" (vegan).
- **Distance Sort**: Sorted by distance from user location if available; falls back to no distance if geolocation fails.
- **Expandable Cards**: Each restaurant card expands on click to show full details (description, hours, menu, contact).
- **Animations**: Framer Motion animates card entrance and expansion smoothly.

### Data Flow

1. Fetch all restaurants from API via `usePlaces()`.
2. Get user location via `useUserLocation()`.
3. Compute distance for each restaurant; filter by search query and active type.
4. Sort by distance; memoize result to avoid recomputation on every render.
5. Render filtered list with animations.

### State Management

- `search`: Current search query.
- `activeType`: Selected restaurant type filter (or null for all).
- `expandedId`: ID of currently expanded card (or null).
- Memoization via `useMemo` ensures filtering and sorting only run when inputs change.

## Key Behaviors

### Distance Calculation

Both views use `calculateDistanceMeters(from, to)` to compute geodetic distance from user to restaurant. The distance is displayed as a human-readable label (e.g., "2.5 km") via `formatDistance()`.

### Location Permissions

- If user denies geolocation, distance fields remain empty; sorting falls back to default order.
- `UserLocationControl` (map only) shows error message if geolocation fails (e.g., timeout).

### Performance

- `useMemo` caches filtered/sorted results to avoid recomputation when only UI state changes.
- Map bounds tracking is event-driven (moveend/zoomend) to avoid constant filtering.
- Restaurant card expansion is local state; no re-renders of sibling cards.
