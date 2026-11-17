import type { LocationResult, RouteCoordinate } from '../types';

export function geometryToCoordinates(geometry: LocationResult['polyline']): RouteCoordinate[] {
  if (!geometry) return [];
  const toCoordinate = ([longitude, latitude]: number[]) => ({ latitude, longitude });
  if (geometry.type === 'LineString') return (geometry.coordinates as number[][]).map(toCoordinate);
  if (geometry.type === 'MultiLineString') return (geometry.coordinates as number[][][]).flat().map(toCoordinate);
  return [];
}

export function routeMapKey(points: RouteCoordinate[]) {
  if (!points.length) return 'destination';
  const first = points[0];
  const last = points[points.length - 1];
  return `route-${points.length}-${first.latitude}-${first.longitude}-${last.latitude}-${last.longitude}`;
}

export function destinationRegion(point?: RouteCoordinate) {
  if (point) return { latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
}
