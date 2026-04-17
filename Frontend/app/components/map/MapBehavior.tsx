import { useEffect } from "react";
import type { RefObject } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import type { Place } from "~/data/places";

export function SetViewOnClick({
    animateRef,
    onMapClick,
}: {
    animateRef: RefObject<boolean>;
    onMapClick?: () => void;
}) {
    const map = useMapEvent("click", (e) => {
        onMapClick?.();
        map.setView(e.latlng, map.getZoom(), { animate: animateRef.current || false });
    });

    return null;
}

export function MapBoundsTracker({
    places,
    onBoundsChange,
}: {
    places: Place[];
    onBoundsChange: (visible: Place[]) => void;
}) {
    const map = useMap();

    const update = () => {
        const bounds = map.getBounds();
        onBoundsChange(places.filter((p) => bounds.contains(p.position)));
    };

    useMapEvent("moveend", update);
    useMapEvent("zoomend", update);

    useEffect(() => {
        update();
    }, []);

    return null;
}

export function MapSelectionFocus({
    restaurant,
    animateRef,
}: {
    restaurant: Place | null;
    animateRef: RefObject<boolean>;
}) {
    const map = useMap();

    useEffect(() => {
        if (!restaurant) {
            return;
        }

        const recenterToVisibleTarget = () => {
            const size = map.getSize();
            const isMobile = window.matchMedia("(max-width: 767px)").matches;
            const targetX = size.x / 2;
            let targetY = size.y / 2;

            if (isMobile) {
                const sheet = document.querySelector<HTMLElement>("[data-mobile-restaurant-sheet]");
                const bottomNav = document.querySelector<HTMLElement>("[data-bottom-nav]");
                const sheetBottom = Math.max(0, sheet?.getBoundingClientRect().bottom ?? 0);
                const bottomNavTop = Math.min(size.y, bottomNav?.getBoundingClientRect().top ?? size.y);

                if (bottomNavTop - sheetBottom > 24) {
                    targetY = sheetBottom + (bottomNavTop - sheetBottom) / 2;
                }
            }

            const zoom = map.getZoom();
            const pinPoint = map.project(restaurant.position, zoom);
            const desiredCenterPoint = pinPoint.subtract([targetX - size.x / 2, targetY - size.y / 2]);
            const desiredCenter = map.unproject(desiredCenterPoint, zoom);

            map.setView(desiredCenter, zoom, { animate: animateRef.current || false });
        };

        const animationFrame = requestAnimationFrame(recenterToVisibleTarget);
        const delayedRecenter = window.setTimeout(recenterToVisibleTarget, 220);
        window.addEventListener("resize", recenterToVisibleTarget);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.clearTimeout(delayedRecenter);
            window.removeEventListener("resize", recenterToVisibleTarget);
        };
    }, [animateRef, map, restaurant?.id]);

    return null;
}
