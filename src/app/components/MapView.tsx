import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster';
import type { FuelStation, MapBounds } from '../types';
import { useTheme } from '../context/ThemeContext';
import { districtLabel, getDistrictById } from '../data/sriLankaDistricts';
import { groupStationsByDistrict, stationCentroid } from '../utils/districtCluster';

type ClusterFuelStatus = 'available' | 'limited' | 'out-of-stock' | 'not-available';

const MARKER_EFFECTIVE_STATUS = '_fuelEffectiveStatus' as const;

function readMarkerEffectiveStatus(m: L.Marker): ClusterFuelStatus {
  const v = (m as L.Marker & { [MARKER_EFFECTIVE_STATUS]?: ClusterFuelStatus })[
    MARKER_EFFECTIVE_STATUS
  ];
  if (v === 'available' || v === 'limited' || v === 'out-of-stock' || v === 'not-available') {
    return v;
  }
  return 'not-available';
}

/** Majority status inside a cluster; ties break in favour of earlier key (available first). */
function dominantClusterStatus(markers: L.Marker[]): ClusterFuelStatus {
  const counts: Record<ClusterFuelStatus, number> = {
    available: 0,
    limited: 0,
    'out-of-stock': 0,
    'not-available': 0,
  };
  for (const m of markers) {
    counts[readMarkerEffectiveStatus(m)] += 1;
  }
  const priority: ClusterFuelStatus[] = [
    'available',
    'limited',
    'out-of-stock',
    'not-available',
  ];
  return priority.reduce((best, k) => (counts[k] > counts[best] ? k : best), 'not-available');
}

function dominantStationListStatus(
  stations: FuelStation[],
  getEffective: (s: FuelStation) => ClusterFuelStatus,
): ClusterFuelStatus {
  const counts: Record<ClusterFuelStatus, number> = {
    available: 0,
    limited: 0,
    'out-of-stock': 0,
    'not-available': 0,
  };
  for (const s of stations) {
    counts[getEffective(s)] += 1;
  }
  const priority: ClusterFuelStatus[] = [
    'available',
    'limited',
    'out-of-stock',
    'not-available',
  ];
  return priority.reduce((best, k) => (counts[k] > counts[best] ? k : best), 'not-available');
}

function escapeHtmlAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Shorter map labels; exact count on hover via tooltip title. */
function formatClusterCount(n: number): { label: string; title: string } {
  const title = `${n} ${n === 1 ? 'station' : 'stations'}`;
  if (n < 1000) return { label: String(n), title };
  if (n < 10000) {
    const k = n / 1000;
    const rounded = Math.round(k * 10) / 10;
    const label = (Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)) + 'k';
    return { label, title };
  }
  return { label: `${Math.round(n / 1000)}k`, title };
}

/** Minimal pump glyph (white on status-colored cluster disc). */
const CLUSTER_PUMP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 22V6h12v16H3z"/><path d="M5 8h8"/><path d="M15 11h2a2 2 0 0 1 2 2v2.5"/><path d="M19 15.5V11a2 2 0 0 0-2-2h-2"/><path d="M17 18h.01"/></svg>`;

/** Shared circular cluster bubble (markercluster + district aggregates). */
function buildClusterDiscMarkup(
  n: number,
  dominant: ClusterFuelStatus,
  theme: 'light' | 'dark',
  bg: string,
  titleAttr: string,
): { html: string; size: number } {
  const { label } = formatClusterCount(n);
  const size = n >= 500 ? 52 : n >= 100 ? 48 : n >= 10 ? 44 : 40;
  const border =
    theme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.92)';
  const shadow =
    dominant === 'available'
      ? '0 2px 12px rgba(0, 200, 83, 0.45)'
      : dominant === 'limited'
        ? '0 2px 12px rgba(255, 171, 0, 0.4)'
        : dominant === 'out-of-stock'
          ? '0 2px 12px rgba(213, 0, 0, 0.4)'
          : '0 2px 10px rgba(0,0,0,0.28)';
  const countSize = label.length > 3 ? 10 : n >= 100 ? 11 : 12;
  const html = `<div title="${escapeHtmlAttr(titleAttr)}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:${size}px;height:${size}px;background:${bg};color:#fff;font-weight:700;border-radius:50%;border:2px solid ${border};box-shadow:${shadow};text-shadow:0 1px 2px rgba(0,0,0,0.35);cursor:pointer;">${CLUSTER_PUMP_SVG}<span style="font-size:${countSize}px;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;opacity:0.95">${label}</span></div>`;
  return { html, size };
}

interface MapViewProps {
  stations: FuelStation[];
  onStationClick: (station: FuelStation) => void;
  onStationSelect?: (station: FuelStation) => void;
  center: [number, number];
  zoom?: number;
  onBoundsChange?: (center: [number, number], zoom: number, bounds: MapBounds) => void;
  userLocation?: [number, number] | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  variant?: 'popup' | 'select';
  className?: string;
  /** One marker per district (nearest reference point); click zooms in and exits this mode. */
  clusterByDistrict?: boolean;
  onDistrictClusterExit?: () => void;
}

export function MapView({ 
  stations, 
  onStationClick, 
  onStationSelect,
  center, 
  zoom = 13, 
  onBoundsChange, 
  userLocation,
  onLocationSelect,
  selectedLocation,
  variant = 'popup',
  className,
  clusterByDistrict = false,
  onDistrictClusterExit,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const districtGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const { theme, language, t } = useTheme();
  const lastCenterPropRef = useRef<string>("");
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onStationClickRef = useRef(onStationClick);
  const onStationSelectRef = useRef(onStationSelect);
  const onLocationSelectRef = useRef(onLocationSelect);
  const stationsRef = useRef(stations);
  const variantRef = useRef(variant);
  const tRef = useRef(t);
  const onDistrictClusterExitRef = useRef(onDistrictClusterExit);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    onDistrictClusterExitRef.current = onDistrictClusterExit;
  }, [onDistrictClusterExit]);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    stationsRef.current = stations;
  }, [stations]);

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  useEffect(() => {
    onStationClickRef.current = onStationClick;
  }, [onStationClick]);

  useEffect(() => {
    onStationSelectRef.current = onStationSelect;
  }, [onStationSelect]);

  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      const sriLankaBounds: L.LatLngBoundsExpression = [
        [5.8, 79.5], // South West
        [9.9, 82.0], // North East
      ];

      mapInstanceRef.current = L.map(mapRef.current, {
        maxBounds: sriLankaBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 7,
      }).setView(center, zoom);

      const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
      tileLayerRef.current = L.tileLayer(osmTiles, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        className: theme === 'dark' ? 'map-tiles-dark' : '',
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.on('moveend', () => {
        if (onBoundsChangeRef.current) {
          const newCenter = mapInstanceRef.current?.getCenter();
          const newZoom = mapInstanceRef.current?.getZoom();
          const newBounds = mapInstanceRef.current?.getBounds();
          
          if (newCenter && newZoom !== undefined && newBounds) {
            onBoundsChangeRef.current(
              [newCenter.lat, newCenter.lng], 
              newZoom,
              {
                northEast: [newBounds.getNorthEast().lat, newBounds.getNorthEast().lng],
                southWest: [newBounds.getSouthWest().lat, newBounds.getSouthWest().lng]
              }
            );
          }
        }
      });

      mapInstanceRef.current.on('click', (e: L.LeafletMouseEvent) => {
        if (onLocationSelectRef.current) {
          onLocationSelectRef.current(e.latlng.lat, e.latlng.lng);
        }
      });

      // Handle custom popup button click
      mapInstanceRef.current.on('popupopen', (e) => {
        if (variantRef.current !== 'popup') return;
        const popup = e.popup;
        const container = popup.getElement();
        if (container) {
          const btn = container.querySelector('.view-details-btn');
          if (btn) {
            btn.addEventListener('click', () => {
              const stationId = btn.getAttribute('data-station-id');
              const station = stationsRef.current.find(s => s.id === stationId);
              if (station && onStationClickRef.current) {
                onStationClickRef.current(station);
              }
            });
          }
        }
      });
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('moveend');
        mapInstanceRef.current.off('popupopen');
        mapInstanceRef.current.off('click');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update map center only when prop values strictly change (e.g. from Locate Me)
    const centerKey = `${center[0]},${center[1]},${zoom}`;
    if (lastCenterPropRef.current !== centerKey) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
      lastCenterPropRef.current = centerKey;
    }
  }, [center, zoom]);

  // Handle Theme Change for Map Tiles
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    
    const osmTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current.setUrl(osmTiles);
    const tileEl = tileLayerRef.current.getContainer();
    if (tileEl) {
      tileEl.className = tileEl.className.replace('map-tiles-dark', '').trim();
      if (theme === 'dark') tileEl.classList.add('map-tiles-dark');
    }
  }, [theme]);

  // Handle User Location Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.circleMarker(userLocation, {
        radius: 8,
        fillColor: '#4285F4',
        color: 'white',
        weight: 3,
        opacity: 1,
        fillOpacity: 1
      }).addTo(mapInstanceRef.current);
      
      userMarkerRef.current.bindTooltip("You are here", {
        permanent: false,
        direction: "top"
      });
    } else {
      userMarkerRef.current.setLatLng(userLocation);
    }
  }, [userLocation]);

  // Handle Selection Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (!selectedLocation) {
      if (selectionMarkerRef.current) {
        selectionMarkerRef.current.remove();
        selectionMarkerRef.current = null;
      }
      return;
    }

    const selectionIcon = L.divIcon({
      html: `
        <div style="position: relative; width: 32px; height: 40px;">
          <div style="position: absolute; top: -10px; left: -10px; width: 52px; height: 52px; background: rgba(37, 99, 235, 0.2); border-radius: 50%; animation: pulse 2s infinite;"></div>
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="#2563eb"/>
            <circle cx="16" cy="16" r="6" fill="white"/>
          </svg>
          <style>
            @keyframes pulse {
              0% { transform: scale(0.6); opacity: 1; }
              100% { transform: scale(1.2); opacity: 0; }
            }
          </style>
        </div>
      `,
      className: 'selection-marker',
      iconSize: [32, 40],
      iconAnchor: [16, 40],
    });

    if (!selectionMarkerRef.current) {
      selectionMarkerRef.current = L.marker(selectedLocation, {
        icon: selectionIcon,
        zIndexOffset: 1000
      }).addTo(mapInstanceRef.current);
    } else {
      selectionMarkerRef.current.setLatLng(selectedLocation);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (clusterRef.current) {
      mapInstanceRef.current.removeLayer(clusterRef.current);
      clusterRef.current = null;
    }
    if (districtGroupRef.current) {
      mapInstanceRef.current.removeLayer(districtGroupRef.current);
      districtGroupRef.current = null;
    }

    if (stations.length === 0) return;

    // Helper function to get marker color
    const getMarkerColor = (status: string) => {
      switch (status) {
        case 'available':
          return '#00C853'; // vibrant green-A700 (fuel available)
        case 'limited':
          return '#FFAB00'; // vibrant amber-A700
        case 'out-of-stock':
          return '#D50000'; // vibrant red-A700 (no fuel)
        case 'not-available':
          return '#757575'; // gray — station has no fuel type data (N/A)
        default:
          return '#757575'; // gray
      }
    };

    // Returns 'not-available' when all fuel types are N/A (undefined), otherwise returns the station status
    const getEffectiveStatus = (station: FuelStation) => {
      const hasAnyFuelData = Object.values(station.fuelTypes).some((v) => v !== undefined);
      return hasAnyFuelData ? station.status : 'not-available';
    };

    if (clusterByDistrict) {
      const grouped = groupStationsByDistrict(stations);
      const layer = L.layerGroup();

      for (const [districtId, list] of grouped) {
        if (list.length === 0) continue;
        const meta = getDistrictById(districtId);
        if (!meta) continue;

        const label = districtLabel(meta, language);
        const center = stationCentroid(list);
        const dominant = dominantStationListStatus(list, getEffectiveStatus);
        const bg = getMarkerColor(dominant);
        const n = list.length;
        const countTitle = formatClusterCount(n).title;
        const titleAttr = `${label} — ${countTitle}`;
        const tip = `${titleAttr}\n${tRef.current('map.districtZoomHint')}`;
        const { html, size } = buildClusterDiscMarkup(n, dominant, theme, bg, titleAttr);
        const icon = L.divIcon({
          className: 'fuel-marker-cluster',
          html,
          iconSize: L.point(size, size),
          iconAnchor: L.point(size / 2, size / 2),
        });

        const marker = L.marker(center, { icon });
        marker.bindTooltip(tip, { direction: 'top', opacity: 0.95 });
        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          const bounds = L.latLngBounds(list.map((s) => s.coordinates));
          mapInstanceRef.current?.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 13,
            animate: true,
          });
          onDistrictClusterExitRef.current?.();
        });
        layer.addLayer(marker);
      }

      layer.addTo(mapInstanceRef.current);
      districtGroupRef.current = layer;
      return;
    }

    // Classic teardrop pin + large white “hole” in the head (flat style, status-coloured body)
    const createCustomIcon = (status: string) => {
      const color = getMarkerColor(status);
      const stroke =
        theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.98)';

      return L.divIcon({
        html: `
          <div style="width:28px;height:35px;pointer-events:auto;">
            <svg width="28" height="35" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z"
                fill="${color}"
                stroke="${stroke}"
                stroke-width="1.15"
                stroke-linejoin="round"
              />
              <circle cx="16" cy="14.5" r="7.75" fill="white" />
              <circle cx="16" cy="14.5" r="3.85" fill="${color}" />
            </svg>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [28, 35],
        iconAnchor: [14, 35],
        popupAnchor: [0, -34],
      });
    };

    const cluster = L.markerClusterGroup({
      disableClusteringAtZoom: 16,
      maxClusterRadius: (z: number) => (z <= 9 ? 72 : z <= 11 ? 64 : 52),
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: true,
      chunkedLoading: stations.length > 120,
      chunkInterval: 200,
      chunkDelay: 50,
      iconCreateFunction: (clusterGroup) => {
        const leaves = clusterGroup.getAllChildMarkers();
        const dominant = dominantClusterStatus(leaves);
        const n = clusterGroup.getChildCount();
        const { title } = formatClusterCount(n);
        const bg = getMarkerColor(dominant);
        const { html, size } = buildClusterDiscMarkup(n, dominant, theme, bg, title);
        return L.divIcon({
          html,
          className: 'fuel-marker-cluster',
          iconSize: L.point(size, size),
          iconAnchor: L.point(size / 2, size / 2),
        });
      },
    });

    const newMarkers: L.Marker[] = [];

    stations.forEach((station) => {
      const effectiveStatus = getEffectiveStatus(station);
      const marker = L.marker(station.coordinates, {
        icon: createCustomIcon(effectiveStatus),
      });
      const tagged = marker as L.Marker & Partial<Record<typeof MARKER_EFFECTIVE_STATUS, ClusterFuelStatus>>;
      tagged[MARKER_EFFECTIVE_STATUS] = effectiveStatus as ClusterFuelStatus;

      if (variant === 'select') {
        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          onStationSelectRef.current?.(station);
        });
        newMarkers.push(marker);
        return;
      }

      const getFuelStyles = (status?: string) => {
        if (status === 'available') return { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', dot: '#22c55e' };
        if (status === 'limited') return { bg: '#fffbeb', border: '#fef3c7', text: '#b45309', dot: '#f59e0b' };
        return { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', dot: '#ef4444' };
      };

      const popupContent = `
        <div style="font-family: 'Inter', system-ui, sans-serif; min-width: 260px; padding: 12px; ${theme === 'dark' ? 'color: white;' : ''}">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div style="flex: 1; padding-right: 12px;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: ${theme === 'dark' ? '#ffffff' : '#111827'}; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${station.name}</h3>
              <p style="margin: 2px 0 0; font-size: 11px; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; font-weight: 400; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${station.address}</p>
            </div>
            <div style="
              padding: 4px 8px; 
              border-radius: 8px; 
              font-size: 10px; 
              font-weight: 700; 
              text-transform: uppercase; 
              letter-spacing: -0.01em;
              white-space: nowrap;
              ${effectiveStatus === 'available' 
                ? theme === 'dark' ? 'background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2);' : 'background: #dcfce7; color: #15803d;' 
                : effectiveStatus === 'limited' 
                ? theme === 'dark' ? 'background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2);' : 'background: #fef3c7; color: #b45309;'
                : effectiveStatus === 'not-available'
                ? theme === 'dark' ? 'background: rgba(117, 117, 117, 0.15); color: #9ca3af; border: 1px solid rgba(117, 117, 117, 0.3);' : 'background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;'
                : theme === 'dark' ? 'background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2);' : 'background: #fee2e2; color: #b91c1c;'}
            ">
              ${effectiveStatus === 'available' ? 'In Stock' : effectiveStatus === 'limited' ? 'Limited' : effectiveStatus === 'not-available' ? 'N/A' : 'Dry'}
            </div>
          </div>

          <!-- Fuel Type Mini Indicators -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;">
            ${Object.entries(station.fuelTypes).map(([type, status]) => {
              const styles = getFuelStyles(status);
              return `
                <div style="
                  display: flex; 
                  align-items: center; 
                  gap: 4px; 
                  padding: 3px 6px; 
                  background: ${theme === 'dark' 
                    ? (status === 'available' ? 'rgba(6, 78, 59, 0.4)' : status === 'limited' ? 'rgba(120, 53, 15, 0.4)' : 'rgba(127, 29, 29, 0.4)') 
                    : styles.bg}; 
                  border: 1px solid ${theme === 'dark' 
                    ? (status === 'available' ? 'rgba(6, 95, 70, 0.6)' : status === 'limited' ? 'rgba(146, 64, 14, 0.6)' : 'rgba(153, 27, 27, 0.6)') 
                    : styles.border};
                  border-radius: 6px;
                  color: ${theme === 'dark' 
                    ? (status === 'available' ? '#6ee7b7' : status === 'limited' ? '#fde68a' : '#fca5a5') 
                    : styles.text};
                  font-size: 8px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: -0.01em;
                ">
                  <div style="width: 4px; height: 4px; border-radius: 50%; background: ${styles.dot};"></div>
                  ${type.replace('petrol', 'P').replace('diesel', 'DSL').replace('kerosene', 'KRS')}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Queue & Wait Stats -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-top: 12px; border-top: 1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f3f4f6'};">
            <div style="display: flex; gap: 16px;">
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 8px; font-weight: 700; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">Queue</span>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: ${theme === 'dark' ? '#f3f4f6' : '#374151'};">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  ${station.petrolQueueLength ?? 0} / ${station.dieselQueueLength ?? 0}
                </div>
              </div>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 8px; font-weight: 700; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">Wait</span>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: ${theme === 'dark' ? '#f3f4f6' : '#374151'};">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${station.petrolWaitingTime ?? 0}m / ${station.dieselWaitingTime ?? 0}m
                </div>
              </div>
            </div>
            ${station.distance ? `
              <div style="display: flex; flex-direction: column; align-items: end;">
                <span style="font-size: 8px; font-weight: 700; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">Distance</span>
                <span style="font-size: 13px; font-weight: 700; color: ${theme === 'dark' ? '#f5f5f5' : '#3b82f6'};"><span style="font-size: 11px;">${station.distance.toFixed(1)}</span><span style="font-size: 9px; margin-left: 1px;">KM</span></span>
              </div>
            ` : ''}
          </div>

          <!-- Action Button -->
          <button 
            class="view-details-btn"
            data-station-id="${station.id}"
            style="
              width: 100%;
              padding: 12px;
              border: none;
              border-radius: 14px;
              background: ${theme === 'dark' ? '#2a2a2a' : '#3b82f6'};
              color: ${theme === 'dark' ? '#f5f5f5' : 'white'};
              font-family: inherit;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: ${theme === 'dark' ? 'none' : '0 8px 20px -6px rgba(59, 130, 246, 0.5)'};
              border: 1px solid ${theme === 'dark' ? '#3a3a3a' : 'rgba(255,255,255,0.1)'};
            "
          >
            Explore Station Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-station-popup',
        maxWidth: 300,
        minWidth: 240
      });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
      });

      newMarkers.push(marker);
    });

    cluster.addLayers(newMarkers);
    cluster.addTo(mapInstanceRef.current);
    clusterRef.current = cluster;
  }, [stations, theme, variant, clusterByDistrict, language]);

  return <div ref={mapRef} className={className ?? "w-full h-full overflow-hidden"} />;
}