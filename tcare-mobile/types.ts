export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export type LocationResult = {
  type: 'location';
  query: string;
  title: string;
  summary: string;
  placeName: string;
  placeSubtitle: string;
  walkMinutes: number;
  fee: string;
  hours: string;
  // GeoJSON geometry returned by the backend (from Geoapify)
  polyline?: {
    type: string;
    coordinates: number[][] | number[][][];
  } | null;
  // Where the student was standing when they asked
  origin?: RouteCoordinate;
  // Destination coordinates, if backend includes them
  destination?: RouteCoordinate;
};

export type InfoResult = {
  type: 'info';
  query: string;
  title: string;
  summary: string;
};

export type QueryResult = LocationResult | InfoResult;