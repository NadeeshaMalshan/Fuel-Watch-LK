import { SL_DISTRICTS } from '../data/sriLankaDistricts';
import type { FuelStation } from '../types';

function distSq(lat: number, lng: number, refLat: number, refLng: number): number {
  const dLat = lat - refLat;
  const dLng = lng - refLng;
  return dLat * dLat + dLng * dLng;
}

function nearestDistrictId(lat: number, lng: number): string {
  let bestId = SL_DISTRICTS[0].id;
  let best = Infinity;
  for (const d of SL_DISTRICTS) {
    const [rlat, rlng] = d.ref;
    const sq = distSq(lat, lng, rlat, rlng);
    if (sq < best) {
      best = sq;
      bestId = d.id;
    }
  }
  return bestId;
}

/** Buckets stations by administrative district using nearest district reference point. */
export function groupStationsByDistrict(stations: FuelStation[]): Map<string, FuelStation[]> {
  const out = new Map<string, FuelStation[]>();
  for (const s of stations) {
    const id = nearestDistrictId(s.coordinates[0], s.coordinates[1]);
    const list = out.get(id);
    if (list) list.push(s);
    else out.set(id, [s]);
  }
  return out;
}

/** Mean latitude/longitude of the given stations (MapView uses this as the district bubble position). */
export function stationCentroid(stations: FuelStation[]): [number, number] {
  const [first] = stations;
  if (!first) return [7.8731, 80.7718];
  let sumLat = 0;
  let sumLng = 0;
  for (const s of stations) {
    sumLat += s.coordinates[0];
    sumLng += s.coordinates[1];
  }
  const n = stations.length;
  return [sumLat / n, sumLng / n];
}
