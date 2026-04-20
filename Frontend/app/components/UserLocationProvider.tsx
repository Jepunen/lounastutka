import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type UserPosition = [number, number];

const USER_LOCATION_STORAGE_KEY = "lounastutka:user-location";

type UserLocationContextValue = {
  position: UserPosition | null;
  isLocating: boolean;
  errorMessage: string | null;
  locateUser: () => Promise<UserPosition | null>;
};

const UserLocationContext = createContext<UserLocationContextValue | null>(null);

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

export function UserLocationProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState<UserPosition | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedValue = window.localStorage.getItem(USER_LOCATION_STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as unknown;
      if (
        Array.isArray(parsedValue) &&
        parsedValue.length === 2 &&
        typeof parsedValue[0] === "number" &&
        typeof parsedValue[1] === "number"
      ) {
        return [parsedValue[0], parsedValue[1]];
      }
    } catch {
      window.localStorage.removeItem(USER_LOCATION_STORAGE_KEY);
    }

    return null;
  });
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const geolocationSupported = useMemo(
    () => typeof navigator !== "undefined" && "geolocation" in navigator,
    [],
  );

  const startWatch = useCallback(() => {
    if (!geolocationSupported || watchIdRef.current !== null) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
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
  }, [geolocationSupported]);

  const locateUser = useCallback(() => {
    if (!geolocationSupported) {
      setErrorMessage("Paikannusta ei tueta tässä laitteessa.");
      return Promise.resolve<UserPosition | null>(null);
    }

    setIsLocating(true);

    return new Promise<UserPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          const coords: UserPosition = [geoPosition.coords.latitude, geoPosition.coords.longitude];
          setPosition(coords);
          setErrorMessage(null);
          setIsLocating(false);
          startWatch();
          resolve(coords);
        },
        (geoError) => {
          setErrorMessage(getGeolocationErrorMessage(geoError));
          setIsLocating(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 15000,
        },
      );
    });
  }, [geolocationSupported, startWatch]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (position) {
      window.localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(position));
    }
  }, [position]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && geolocationSupported) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [geolocationSupported]);

  const value = useMemo(
    () => ({ position, isLocating, errorMessage, locateUser }),
    [errorMessage, isLocating, locateUser, position],
  );

  return <UserLocationContext.Provider value={value}>{children}</UserLocationContext.Provider>;
}

export function useUserLocation() {
  const context = useContext(UserLocationContext);

  if (!context) {
    throw new Error("useUserLocation must be used within a UserLocationProvider");
  }

  return context;
}
