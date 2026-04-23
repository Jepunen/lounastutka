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


// getGeolocationErrorMessage is a helper function that takes a GeolocationPositionError object and returns a user-friendly error message based on the error code.
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

/*
UserLocationProvider is a React context provider component that manages the user's geolocation state.
It provides the current position, a loading state, any error messages, and a function to initiate locating the user.
The component uses the browser's Geolocation API to get the user's current position and watch for changes in their location.
It also stores the user's last known position in localStorage to persist it across sessions, and it handles cleanup of the geolocation watch when the component is unmounted.
*/
export function UserLocationProvider({ children }: { children: React.ReactNode }) {
  // State for the user's current position, initialized from localStorage if available and valid.
  const [position, setPosition] = useState<UserPosition | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedValue = window.localStorage.getItem(USER_LOCATION_STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    // Attempt to parse the stored value and validate that it is a valid UserPosition. If parsing fails or the data is invalid, remove it from localStorage.
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

  // State for tracking whether the app is currently trying to locate the user and any error messages that may occur during the geolocation process.
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // gelocationSupported is a memoized value that checks if the Geolocation API is supported in the current environment.
  const geolocationSupported = useMemo(
    () => typeof navigator !== "undefined" && "geolocation" in navigator,
    [],
  );

  // startWatch is a function that initiates watching the user's position using the Geolocation API. 
  // It checks if geolocation is supported and if there isn't already an active watch before starting a new one. 
  // When the position changes, it updates the state with the new position and clears any error messages. 
  // If an error occurs while watching the position, it sets an appropriate error message based on the error code.
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

  // locateUser is a function that attempts to get the user's current position using the Geolocation API. 
  // It sets the loading state to true while trying to locate the user, and it returns a promise that resolves with the user's position or null if locating fails. 
  // If geolocation is not supported, it sets an error message and resolves with null immediately. 
  // If locating is successful, it updates the position state, clears any error messages, starts watching for position changes, and resolves with the user's coordinates. 
  // If an error occurs during locating, it sets an appropriate error message and resolves with null.
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

  // useEffect to store the user's position in localStorage whenever it changes, and to clean up the geolocation watch when the component is unmounted.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (position) {
      window.localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify(position));
    }
  }, [position]);

  // useEffect to clean up the geolocation watch when the component is unmounted. It checks if there is an active watch and if geolocation is supported before attempting to clear the watch.
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && geolocationSupported) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [geolocationSupported]);

  // Memoize the context value to prevent unnecessary re-renders of consuming components when the context value changes.
  const value = useMemo(
    () => ({ position, isLocating, errorMessage, locateUser }),
    [errorMessage, isLocating, locateUser, position],
  );

  return <UserLocationContext.Provider value={value}>{children}</UserLocationContext.Provider>;
}

// useUserLocation is a custom React hook that provides access to the user's geolocation context.
export function useUserLocation() {
  const context = useContext(UserLocationContext);

  if (!context) {
    throw new Error("useUserLocation must be used within a UserLocationProvider");
  }

  return context;
}
