import { useEffect, useMemo, useState } from "react";
import type { RefObject } from "react";
import { CircleMarker, Popup, useMap, useMapEvent } from "react-leaflet";
import type { Place } from "~/data/places";
import Button from "../Button";
import { IoLocateOutline } from "react-icons/io5";

type UserPosition = [number, number];

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Paikannus estetty. Salli paikannus käyttääksesi tätä ominaisuutta.";
    case error.POSITION_UNAVAILABLE:
      return "Paikannustiedot eivät saatavilla.";
    case error.TIMEOUT:
      return "Paikannusyritys aikakatkaistiin.";
    default:
      return "Paikannuksessa tapahtui tuntematon virhe.";
  }
}

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

export function UserLocationControl() {
  const map = useMap();
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const geolocationSupported = useMemo(
    () => typeof navigator !== "undefined" && "geolocation" in navigator,
    [],
  );

  const centerToPosition = (coords: UserPosition) => {
    const zoom = Math.max(map.getZoom(), 15);
    map.setView(coords, zoom, { animate: true });
  };

  const startWatch = () => {
    if (!geolocationSupported || watchId !== null) {
      return;
    }

    const createdWatchId = navigator.geolocation.watchPosition(
      (geoPosition) => {
        setPosition([geoPosition.coords.latitude, geoPosition.coords.longitude]);
        setErrorMessage(null);
      },
      (geoError) => {
        setErrorMessage(getGeolocationErrorMessage(geoError));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      },
    );

    setWatchId(createdWatchId);
  };

  const locateUser = () => {
    if (!geolocationSupported) {
      setErrorMessage("Paikannusta ei tueta tässä laitteessa.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const coords: UserPosition = [geoPosition.coords.latitude, geoPosition.coords.longitude];
        setPosition(coords);
        setErrorMessage(null);
        centerToPosition(coords);
        startWatch();
        setIsLocating(false);
      },
      (geoError) => {
        setErrorMessage(getGeolocationErrorMessage(geoError));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      },
    );
  };

  useEffect(() => {
    return () => {
      if (watchId !== null && geolocationSupported) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [geolocationSupported, watchId]);

  return (
    <>
      <div className="pointer-events-auto fixed right-4 top-5.5 z-[1100] md:left-0 md:right-auto md:top-20">
        <Button
          variant="primary"
          onClick={locateUser}
          className="h-10 w-10 min-w-10 shrink-0 rounded-full p-0 shadow-lg"
          aria-label="Keskitä omaan sijaintiin"
        >
          <IoLocateOutline className={isLocating ? "animate-pulse" : ""} />
        </Button>
      </div>

      {position ? (
        <CircleMarker
          center={position}
          radius={8}
          pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.95 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      ) : null}

      {errorMessage ? (
        <div className="leaflet-bottom leaflet-left">
          <div className="leaflet-control rounded-md bg-white px-3 py-2 text-xs text-dark shadow-md">
            {errorMessage}
          </div>
        </div>
      ) : null}
    </>
  );
}
