import { CRS, latLng } from "leaflet";

type Coordinates = [number, number];

export function calculateDistanceMeters(from: Coordinates, to: Coordinates) {
  return CRS.Earth.distance(latLng(from[0], from[1]), latLng(to[0], to[1]));
}

export function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`;
  }

  const kilometers = distanceMeters / 1000;
  return `${kilometers < 10 ? kilometers.toFixed(1) : Math.round(kilometers)}km`;
}
