export type FuelStatus = 'available' | 'limited' | 'out-of-stock';

export interface FuelStation {
  id: string;
  stationCode?: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  status: FuelStatus;
  lastUpdated: string;
  petrolQueueLength: number;
  petrolWaitingTime: number; // in minutes
  dieselQueueLength: number;
  dieselWaitingTime: number; // in minutes
  /** Optional aggregate values used by some UI components. */
  queueLength?: number;
  waitingTime?: number; // in minutes
  coordinates: [number, number]; // [latitude, longitude]
  address: string;
  addressSi?: string;
  addressTa?: string;
  fuelTypes: {
    petrol92?: FuelStatus;
    petrol95?: FuelStatus;
    autoDiesel?: FuelStatus;
    superDiesel?: FuelStatus;
    kerosene?: FuelStatus;
  };
  distance?: number; // distance from user in km
}

export interface UserUpdate {
  id: string;
  stationId: string;
  stationName: string;
  userName: string;
  timestamp: Date;
  status: FuelStatus;
  petrolQueueLength: number;
  petrolWaitingTime: number;
  dieselQueueLength: number;
  dieselWaitingTime: number;
  fuelTypes: {
    petrol92?: FuelStatus;
    petrol95?: FuelStatus;
    autoDiesel?: FuelStatus;
    superDiesel?: FuelStatus;
    kerosene?: FuelStatus;
  };
  message?: string;
}

export interface SubmitUpdateForm {
  stationId: string;
  userName: string;
  status: FuelStatus;
  petrolQueueLength: number;
  petrolWaitingTime: number;
  dieselQueueLength: number;
  dieselWaitingTime: number;
  petrol92: FuelStatus | 'not-available';
  petrol95: FuelStatus | 'not-available';
  autoDiesel: FuelStatus | 'not-available';
  superDiesel: FuelStatus | 'not-available';
  kerosene: FuelStatus | 'not-available';
  message?: string;
}
export interface SearchSuggestion {
  id: string;
  type: 'station' | 'location';
  title: string;
  subtitle: string;
  coordinates: [number, number];
  station?: FuelStation;
}

export type Theme = 'light' | 'dark';
export type Language = 'en' | 'si' | 'ta';

export interface MapBounds {
  northEast: [number, number];
  southWest: [number, number];
}
