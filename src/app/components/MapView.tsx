import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FuelStation, MapBounds } from '../types';
import { useTheme } from '../context/ThemeContext';

interface MapViewProps {
  stations: FuelStation[];
  onStationClick: (station: FuelStation) => void;
  center: [number, number];
  zoom?: number;
  onBoundsChange?: (center: [number, number], zoom: number, bounds: MapBounds) => void;
  userLocation?: [number, number] | null;
}

export function MapView({ stations, onStationClick, center, zoom = 13, onBoundsChange, userLocation }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const { theme } = useTheme();
  const lastCenterPropRef = useRef<string>("");
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onStationClickRef = useRef(onStationClick);
  const stationsRef = useRef(stations);

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

      const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      
      tileLayerRef.current = L.tileLayer(theme === 'dark' ? darkTiles : lightTiles, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
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

      // Handle custom popup button click
      mapInstanceRef.current.on('popupopen', (e) => {
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
    
    const lightTiles = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    
    tileLayerRef.current.setUrl(theme === 'dark' ? darkTiles : lightTiles);
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

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Helper function to get marker color
    const getMarkerColor = (status: string) => {
      switch (status) {
        case 'available':
          return '#00C853'; // vibrant green-A700 (fuel available)
        case 'limited':
          return '#FFAB00'; // vibrant amber-A700
        case 'out-of-stock':
          return '#D50000'; // vibrant red-A700 (no fuel)
        default:
          return '#757575'; // gray
      }
    };

    // Create custom icon function
    const createCustomIcon = (status: string) => {
      const color = getMarkerColor(status);
      
      return L.divIcon({
        html: `
          <div style="position: relative; width: 32px; height: 40px;">
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.163 24.837 0 16 0Z" fill="${color}"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
            </svg>
            <div style="position: absolute; top: 14px; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; background: ${color}; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });
    };

    // Add markers for each station
    stations.forEach((station) => {
      const marker = L.marker(station.coordinates, {
        icon: createCustomIcon(station.status),
      }).addTo(mapInstanceRef.current!);

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
              ${station.status === 'available' 
                ? theme === 'dark' ? 'background: rgba(34, 197, 94, 0.1); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2);' : 'background: #dcfce7; color: #15803d;' 
                : station.status === 'limited' 
                ? theme === 'dark' ? 'background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2);' : 'background: #fef3c7; color: #b45309;' 
                : theme === 'dark' ? 'background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2);' : 'background: #fee2e2; color: #b91c1c;'}
            ">
              ${station.status === 'available' ? 'In Stock' : station.status === 'limited' ? 'Limited' : 'Dry'}
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
                  ${station.queueLength}
                </div>
              </div>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 8px; font-weight: 700; color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px;">Wait</span>
                <div style="display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: ${theme === 'dark' ? '#f3f4f6' : '#374151'};">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  ${station.waitingTime}m
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

      markersRef.current.push(marker);
    });
  }, [stations, theme]);

  return <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden shadow-lg" />;
}