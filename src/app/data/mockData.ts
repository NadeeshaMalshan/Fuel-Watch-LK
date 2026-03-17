import { FuelStation, UserUpdate } from '../types';

// Mock data for fuel stations in Ratnapura area
// Ratnapura coordinates: approximately 6.6828° N, 80.3992° E
export const mockStations: FuelStation[] = [
  {
    id: '1',
    name: 'Ceypetco - New Town',
    status: 'available',
    lastUpdated: '5 mins ago',
    queueLength: 12,
    waitingTime: 15,
    coordinates: [6.6828, 80.3992],
    address: 'New Town Road, Ratnapura',
    fuelTypes: {
      petrol92: 'available',
      petrol95: 'available',
      diesel: 'available',
      kerosene: 'available',
    },
  },
  {
    id: '2',
    name: 'IOC - Main Street',
    status: 'limited',
    lastUpdated: '15 mins ago',
    queueLength: 45,
    waitingTime: 60,
    coordinates: [6.6855, 80.4010],
    address: 'Main Street, Ratnapura',
    fuelTypes: {
      petrol92: 'limited',
      diesel: 'available',
      kerosene: 'out-of-stock',
    },
  },
  {
    id: '3',
    name: 'Ceypetco - Central',
    status: 'out-of-stock',
    lastUpdated: '1 hour ago',
    queueLength: 0,
    waitingTime: 0,
    coordinates: [6.6790, 80.3950],
    address: 'Central Road, Ratnapura',
    fuelTypes: {
      petrol92: 'out-of-stock',
      petrol95: 'out-of-stock',
      diesel: 'out-of-stock',
      kerosene: 'out-of-stock',
    },
  },
  {
    id: '4',
    name: 'Laugfs - Station Road',
    status: 'available',
    lastUpdated: '10 mins ago',
    queueLength: 8,
    waitingTime: 10,
    coordinates: [6.6900, 80.4050],
    address: 'Station Road, Ratnapura',
    fuelTypes: {
      petrol92: 'available',
      petrol95: 'limited',
      diesel: 'available',
      kerosene: 'limited',
    },
  },
  {
    id: '5',
    name: 'Sinopec - High Level Road',
    status: 'limited',
    lastUpdated: '30 mins ago',
    queueLength: 28,
    waitingTime: 45,
    coordinates: [6.6750, 80.3920],
    address: 'High Level Road, Ratnapura',
    fuelTypes: {
      diesel: 'limited',
      petrol92: 'out-of-stock',
      kerosene: 'available',
    },
  },
  {
    id: '6',
    name: 'Ceypetco - Junction',
    status: 'available',
    lastUpdated: '3 mins ago',
    queueLength: 5,
    waitingTime: 8,
    coordinates: [6.6870, 80.3880],
    address: 'Junction Road, Ratnapura',
    fuelTypes: {
      petrol92: 'available',
      petrol95: 'available',
      diesel: 'available',
      kerosene: 'available',
    },
  },
  {
    id: '7',
    name: 'IOC - Bypass Road',
    status: 'out-of-stock',
    lastUpdated: '2 hours ago',
    queueLength: 0,
    waitingTime: 0,
    coordinates: [6.6920, 80.3970],
    address: 'Bypass Road, Ratnapura',
    fuelTypes: {
      petrol92: 'out-of-stock',
      diesel: 'out-of-stock',
      kerosene: 'out-of-stock',
    },
  },
  {
    id: '8',
    name: 'Laugfs - Town Center',
    status: 'available',
    lastUpdated: '8 mins ago',
    queueLength: 15,
    waitingTime: 20,
    coordinates: [6.6810, 80.4080],
    address: 'Town Center, Ratnapura',
    fuelTypes: {
      petrol92: 'available',
      petrol95: 'available',
      diesel: 'limited',
      kerosene: 'available',
    },
  },
];

// Mock recent updates from community
export const mockUpdates: UserUpdate[] = [
  {
    id: '1',
    stationId: '1',
    stationName: 'Ceypetco - New Town',
    userName: 'Kamal Silva',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    status: 'available',
    queueLength: 12,
    waitingTime: 15,
    fuelTypes: {
      petrol92: 'available',
      petrol95: 'available',
      diesel: 'available',
      kerosene: 'available',
    },
    message: 'All fuel types available. Queue moving fast!',
  },
  {
    id: '2',
    stationId: '4',
    stationName: 'Laugfs - Station Road',
    userName: 'Nimali Perera',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    status: 'available',
    queueLength: 8,
    waitingTime: 10,
    fuelTypes: {
      petrol92: 'available',
      petrol95: 'limited',
      diesel: 'available',
    },
    message: 'Petrol 95 running low. Get here soon!',
  },
  {
    id: '3',
    stationId: '2',
    stationName: 'IOC - Main Street',
    userName: 'Saman Fernando',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    status: 'limited',
    queueLength: 45,
    waitingTime: 60,
    fuelTypes: {
      petrol92: 'limited',
      diesel: 'available',
    },
    message: 'Long queue. Wait time about 1 hour.',
  },
  {
    id: '4',
    stationId: '6',
    stationName: 'Ceypetco - Junction',
    userName: 'Dilani Jayasinghe',
    timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
    status: 'available',
    queueLength: 5,
    waitingTime: 8,
    fuelTypes: {
      petrol92: 'available',
      diesel: 'available',
      kerosene: 'available',
    },
    message: 'Short queue. Quick service!',
  },
  {
    id: '5',
    stationId: '5',
    stationName: 'Sinopec - High Level Road',
    userName: 'Ruwan Bandara',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    status: 'limited',
    queueLength: 28,
    waitingTime: 45,
    fuelTypes: {
      diesel: 'limited',
      petrol92: 'out-of-stock',
    },
    message: 'Only diesel available. Petrol 92 finished.',
  },
];

// Location coordinates for different cities
export const locationCoordinates: { [key: string]: [number, number] } = {
  ratnapura: [6.6828, 80.3992],
  colombo: [6.9271, 79.8612],
  kandy: [7.2906, 80.6337],
  galle: [6.0535, 80.2210],
  jaffna: [9.6615, 80.0255],
};
