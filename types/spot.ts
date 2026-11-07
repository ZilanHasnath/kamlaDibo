export type Lang = "bn" | "en";

export interface Spot {
  id: string;
  en: string;
  bn: string;
  lat: number;
  lng: number;
  road: string;
  roadBn: string;
  work: string[];
  workBn: string[];
}

export interface SpotWithDistance extends Spot {
  d: number | null;
}

export interface Coords {
  lat: number;
  lng: number;
}
