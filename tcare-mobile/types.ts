export type RouteCoordinate = {
  latitude: number;
  longitude: number;
};

export type TravelMode = 'bike' | 'car' | 'walk' | 'transit';

export type SupportResources = {
  title?: string;
  intro?: string;
  campusHeading?: string;
  primaryDestination?: string;
  campusLocations: { name: string; location: string; detail: string; campus?: 'utsg' | 'utsc' | 'utm' }[];
  links: { group: string; title: string; description: string; url: string }[];
};

// When a result is opened from a Resources-tab card, this holds that card's
// exact label so the result screen header can show the resource name the
// student tapped, even if the backend resolves the answer to a building or
// campus-office title (e.g. "Student Centre").
export type ResourcesTabLabel = string;

export type LocationResult = {
  type: 'location';
  query: string;
  title: string;
  summary: string;
  resourcesTabLabel?: ResourcesTabLabel;
  placeName: string;
  placeSubtitle: string;
  walkMinutes: number;
  // Time returned for the currently selected travel mode. walkMinutes remains
  // available for initial walking routes and older API responses.
  travelMinutes?: number;
  distanceText?: string | null;
  steps?: { instruction: string; distance: string }[];
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
  supportResources?: SupportResources;
  serviceId?: string;
};

export type InfoResult = {
  type: 'info';
  query: string;
  title: string;
  summary: string;
  resourcesTabLabel?: ResourcesTabLabel;
  supportResources?: SupportResources;
  serviceId?: string;
};

export type RecoveryKind = 'connection' | 'location' | 'service';

export type RecoveryResult = {
  type: 'recovery';
  query: string;
  title: string;
  summary: string;
  recoveryKind: RecoveryKind;
  supportResources: SupportResources;
};

export type QueryResult = LocationResult | InfoResult | RecoveryResult;
