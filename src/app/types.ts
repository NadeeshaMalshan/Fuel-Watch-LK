export type FuelStatus = 'available' | 'limited' | 'out-of-stock';

export interface FuelStation {
  id: string;
  name: string;
  status: FuelStatus;
  lastUpdated: string;
  queueLength: number;
  waitingTime: number; // in minutes
  coordinates: [number, number]; // [latitude, longitude]
  address: string;
  fuelTypes: {
    petrol92?: FuelStatus;
    petrol95?: FuelStatus;
    diesel?: FuelStatus;
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
  queueLength: number;
  waitingTime: number;
  fuelTypes: {
    petrol92?: FuelStatus;
    petrol95?: FuelStatus;
    diesel?: FuelStatus;
    kerosene?: FuelStatus;
  };
  message?: string;
}

export interface SubmitUpdateForm {
  stationId: string;
  userName: string;
  status: FuelStatus;
  queueLength: number;
  waitingTime: number;
  petrol92: FuelStatus | 'not-available';
  petrol95: FuelStatus | 'not-available';
  diesel: FuelStatus | 'not-available';
  kerosene: FuelStatus | 'not-available';
  message?: string;
}
