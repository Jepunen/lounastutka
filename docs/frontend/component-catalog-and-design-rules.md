# Component Catalog and Design Rules

## Shared UI Components

### Button

**Location**: `app/components/Button.tsx`

Animated, customizable button with loading state support.

- **Variants**: `primary` (blue, shadow), `secondary` (gray), `outline` (transparent border)
- **Props**: `isLoading` (shows spinner), `variant`, standard HTML button attributes
- **Behavior**: Scale animation on hover (1.02x) and tap (0.98x); disabled when loading or via `disabled` prop
- **Usage**: Form submissions, navigation, toggle actions

### SearchBar

**Location**: `app/components/SearchBar.tsx`

Search input with search icon and blue background.

- **Props**: `value`, `onChange`, `placeholder`, `className`
- **Behavior**: Max length 100 chars; icon on left; neutral text color; responsive width
- **Usage**: Filter restaurants by name/category/tags in map or list view

### BottomNav

**Location**: `app/components/BottomNav.tsx`

Fixed bottom navigation with three routes: Map, List, Settings.

- **Behavior**: Active tab has blue background; uses react-router for navigation
- **Design**: Rounded bar, icon + label, responsive (stack on mobile)
- **Usage**: Primary navigation on mobile views

### Rating

**Location**: `app/components/Rating.tsx`

Display star rating and review count.

- **Display**: Star icon, number of stars, review count in parentheses
- **Behavior**: Clickable link (currently routes to `/`)
- **Usage**: RestaurantCard header to show restaurant rating

### MapPin

**Location**: `app/components/MapPin.tsx`

Map markers with restaurant type icons.

- **MapPinVisual**: Visual representation (icon + blue circle)
- **MapPinMarker**: Leaflet marker with icon caching and popup
- **Types**: `restaurant`, `pizza`, `vegan` (different icons)
- **Design**: Configurable size; icon-centric; cached for performance
- **Usage**: Leaflet map layer for each restaurant

### SideBar

**Location**: `app/components/SideBar.tsx`

Desktop-only sidebar (md: breakpoint) showing visible restaurants.

- **Behavior**: Toggleable (collapse/expand); shows restaurant cards; highlights selected
- **Design**: Gradient background; toggle button; spring animation for cards
- **Usage**: Desktop map view; shows filtered list of restaurants in view bounds

### MobileRestaurantSheet

**Location**: `app/components/MobileRestaurantSheet.tsx`

Mobile-only bottom sheet showing selected restaurant details.

- **Behavior**: Slides in from bottom; shows full restaurant info; dismissible
- **Design**: Mobile-optimized; overlays bottom nav
- **Usage**: Mobile map/list views; displays restaurant details on selection

### RestaurantCard

**Location**: `app/components/RestaurantCard.tsx`

Expandable card displaying restaurant summary and details.

- **Collapsed**: Header (name, category, rating, distance)
- **Expanded**: Meta grid (hours, price, description), menu items, contact section
- **Animation**: Framer Motion smooth height/opacity transition on expand
- **Composition**: CardHeader, CardMetaGrid, CardMenu, CardContactSection subcomponents
- **Usage**: List view, sidebar, mobile sheet; reusable across contexts

### RestaurantCard Subcomponents

**Location**: `app/components/_RestaurantCard/`

Modular card sections:

- **CardHeader**: Name, category, rating, distance
- **CardMetaGrid**: Hours, price, description in a 2-column grid
- **CardMenu**: Today's menu items as a list
- **CardContactSection**: Phone, website, address, tags
- **CardActions**: "Show More Info" button with expand/collapse state

### FavouriteButton

**Location**: `app/components/FavouriteButton.tsx`

Heart icon button to mark/unmark favorites (if implemented).

- **Design**: Icon-based; heart outline / filled
- **Usage**: Card actions or detail views

### AuthModal

**Location**: `app/components/AuthModal.tsx`

Login and registration interface with password and passkey flows.

- **Behavior**: Tab-based (login/register); passkey support via WebAuthn
- **Design**: Form fields, buttons, error handling
- **Usage**: Settings page for user authentication

### UserLocationProvider

**Location**: `app/components/UserLocationProvider.tsx`

Context provider managing geolocation state and location-based features.

- **Exports**: `useUserLocation()` hook
- **State**: `position`, `isLocating`, `errorMessage`, `locateUser()`
- **Usage**: Global location tracking across map and list views
