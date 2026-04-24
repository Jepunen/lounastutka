## Design Patterns

### Tailwind Styling

All components use Tailwind CSS with:

- **Colors**: Primary (blue), neutral (backgrounds), dark (text)
- **Spacing**: Consistent padding/gaps (4px, 8px, 12px, 16px increments)
- **Borders/Radius**: `rounded-2xl` (cards), `rounded-4xl` (buttons/search), `rounded-3xl` (icon backgrounds)
- **Shadows**: `shadow-lg`, `shadow-md`, `shadow-sm` for depth; primary color shadows for accent
- **Responsive**: `md:` breakpoint for desktop layout; mobile-first default

### Animations

- **Framer Motion**: Spring animations for layout shifts and card expansions; instant transitions for state changes
- **Button interactions**: `whileHover` (scale 1.02), `whileTap` (scale 0.98)
- **Card expansion**: Height + opacity animation; 240ms duration
- **Entrance animations**: List items fade in with staggered delay

### Composition Strategy

- **Atomic**: Buttons, search bars are self-contained utilities
- **Modular subcomponents**: RestaurantCard delegates header/sections to subcomponents for readability
- **Context providers**: Location tracking via context rather than prop drilling
- **Route-aware**: BottomNav and AuthModal adapt to current route

### Accessibility Considerations

- **Semantic HTML**: `<button>`, `<input>`, proper form structure
- **ARIA labels**: Location button has `aria-label`
- **Keyboard support**: Inputs auto-focus when visible; tab navigation through buttons
- **Color contrast**: Blue primary + white/dark text meets WCAG AA standards

### Type Safety

All components accept TypeScript interfaces for props:

```typescript
export interface ButtonProps extends HTMLMotionProps<"button"> {
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}
```

### Performance

- **Icon caching**: `MapPin` caches rendered Leaflet icons by type/size
- **Memoization**: Card list renders memoized; expensive filters run only when inputs change
- **Event delegation**: Map events (moveend, zoomend) trigger bounds updates, not every pan frame
