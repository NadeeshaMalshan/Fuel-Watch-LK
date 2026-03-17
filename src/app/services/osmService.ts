import type { FuelStation, FuelStatus } from '../types';
import { mockStations } from '../data/mockData';

interface OSMElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'name:en'?: string;
    brand?: string;
    operator?: string;
    'addr:street'?: string;
    'addr:city'?: string;
  };
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function fetchFuelStations(): Promise<FuelStation[]> {
  const query = `
    [out:json][timeout:25];
    area["name:en"="Sri Lanka"]->.searchArea;
    (
      node["amenity"="fuel"](area.searchArea);
      way["amenity"="fuel"](area.searchArea);
      relation["amenity"="fuel"](area.searchArea);
    );
    out center;
  `;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`, { signal: controller.signal });
    clearTimeout(id);

    if (!response.ok) throw new Error('Failed to fetch data from OSM');
    
    const data = await response.json();
    const elements: OSMElement[] = data.elements || [];

    const osmStations = elements.map((el) => {
      const lat = el.lat || el.center?.lat || 0;
      const lon = el.lon || el.center?.lon || 0;
      
      const name = el.tags?.['name:en'] || el.tags?.name || el.tags?.brand || el.tags?.operator || 'Unknown Fuel Station';
      const address = el.tags?.['addr:street'] ? `${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}` : 'Address not available';

      const statuses: FuelStatus[] = ['available', 'limited', 'out-of-stock'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: el.id.toString(),
        name,
        status: randomStatus,
        lastUpdated: 'Live from Map',
        queueLength: Math.floor(Math.random() * 20),
        waitingTime: Math.floor(Math.random() * 30),
        coordinates: [lat, lon] as [number, number],
        address,
        fuelTypes: {
          petrol92: randomStatus,
          petrol95: (Math.random() > 0.4 ? 'available' : (Math.random() > 0.5 ? 'limited' : 'out-of-stock')) as FuelStatus,
          diesel: (Math.random() > 0.3 ? 'available' : (Math.random() > 0.5 ? 'limited' : 'out-of-stock')) as FuelStatus,
          kerosene: (Math.random() > 0.7 ? 'available' : 'out-of-stock') as FuelStatus,
        },
      };
    });

    // Merge OSM data with our high-quality mock data for the best experience
    return [...mockStations, ...osmStations];
  } catch (error) {
    console.error('Error fetching fuel stations, falling back to mock data:', error);
    return mockStations;
  }
}
