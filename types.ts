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
};

export type InfoResult = {
  type: 'info';
  query: string;
  title: string;
  summary: string;
};

export type QueryResult = LocationResult | InfoResult;
