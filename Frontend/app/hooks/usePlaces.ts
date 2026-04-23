import { useState, useEffect } from "react";
import { getRestaurants } from "~/services/public/restaurant";
import type { Place } from "~/data/places";

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRestaurants()
      .then(setPlaces)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { places, loading, error };
}
