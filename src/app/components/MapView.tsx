import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FuelStation } from '../types';

interface MapViewProps {
  stations: FuelStation[];
  onStationClick: (station: FuelStation) => void;
  center: [number, number];
  zoom?: number;
}

export function MapView({ stations, onStationClick, center, zoom = 13 }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Update map center when location changes
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom]);

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

      marker.bindPopup(`
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${station.name}</h3>
          <p style="font-size: 12px; color: #6b7280;">Click for details</p>
        </div>
      `);

      marker.on('click', () => {
        onStationClick(station);
      });

      markersRef.current.push(marker);
    });
  }, [stations, onStationClick]);

  return <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden shadow-lg" />;
}