import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { FilterChips } from '../components/FilterChips';
import { MapView } from '../components/MapView';
import { StationBottomSheet } from '../components/StationBottomSheet';
import type { FuelStation } from '../types';
import { useTheme } from '../context/ThemeContext';
import { fetchFuelStations } from '../services/osmService';
import { toast, Toaster } from 'sonner';
import { List, TrendingUp, Loader2, Search, Locate, Clock, Settings, Users, MapPin, Home, AlertCircle, Plus, MessageSquare, BookOpen, PlayCircle } from 'lucide-react';
import type { MapBounds, SearchSuggestion } from '../types';

type FuelType = 'all' | 'petrol92' | 'petrol95' | 'autoDiesel' | 'superDiesel' | 'kerosene';
type SortBy = 'status' | 'distance' | 'queue';

const REVERSE_GEO_DEBOUNCE_MS = 600;
const VIEWPORT_FILTER_MIN_ZOOM = 9;
const VIEWPORT_PADDING_RATIO = 0.08;
const SEARCH_DEBOUNCE_MS = 180;
const SEARCH_STATION_LIMIT = 5;
const SEARCH_LOCATION_LIMIT = 5;

type NominatimSearchHit = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

/** Default zoom (fractional); mobile vs desktop. */
function initialMapZoom(): number {
  if (typeof window === 'undefined') return 7.9;
  return window.matchMedia('(max-width: 1023px)').matches ? 6.9 : 7.9;
}

export function HomePage() {
  const navigate = useNavigate();
  const { theme, t, localize, language } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FuelType>('all');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('status');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState(t('location.allIsland'));
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentMapCenter, setCurrentMapCenter] = useState<[number, number]>([7.8731, 80.7718]);
  const [currentMapZoom, setCurrentMapZoom] = useState(initialMapZoom);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [isStationSheetOpen, setIsStationSheetOpen] = useState(false);
  /** Last zoom from the map (moveend); not synced into center/zoom props to avoid fighting user pan. */
  const [viewportZoom, setViewportZoom] = useState(initialMapZoom);

  const reverseGeoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseGeoAbortRef = useRef<AbortController | null>(null);
  const searchSuggestSeqRef = useRef(0);
  const localizeRef = useRef(localize);
  localizeRef.current = localize;

  const isMobile = useMemo(() => window.matchMedia?.('(max-width: 1023px)')?.matches ?? true, []);

  useEffect(() => {
    return () => {
      if (reverseGeoDebounceRef.current) clearTimeout(reverseGeoDebounceRef.current);
      reverseGeoAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true);
      try {
        const data = await fetchFuelStations();
        setStations(data);
      } catch (error) {
        toast.error('Failed to load fuel stations');
      } finally {
        setIsLoading(false);
      }
    };
    loadStations();
  }, []);

  // Calculate distance from user location
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      toast.error('GPS is not supported by your browser.');
      return;
    }

    // Mobile browsers require a secure context (HTTPS) for geolocation.
    // Localhost is considered secure, but LAN IPs over http are not.
    if (!window.isSecureContext) {
      toast.error('GPS needs HTTPS. Open the app via https:// or install it as a PWA.');
      return;
    }

    const getFriendlyGeoError = (error: GeolocationPositionError) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          return 'Location permission denied. Enable location access in your browser settings.';
        case error.POSITION_UNAVAILABLE:
          return 'Location unavailable. Turn on GPS and try again.';
        case error.TIMEOUT:
          return 'Location request timed out. Try again (or move to an open area).';
        default:
          return 'Could not get your location.';
      }
    };

    toast.promise(
      new Promise<[number, number]>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
            setUserLocation(coords);
            setCurrentMapCenter(coords);
            setCurrentMapZoom(13);

            // Calculate distances for all stations
            const stationsWithDistance = stations.map((station: FuelStation) => ({
              ...station,
              distance: calculateDistance(
                coords[0], coords[1],
                station.coordinates[0], station.coordinates[1]
              )
            }));
            setStations(stationsWithDistance);
            resolve(coords);
          },
          (error) => reject(error),
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 60000,
          }
        );
      }),
      {
        loading: 'Getting your location...',
        success: 'Location found! Showing nearest stations.',
        error: (e) => (e && typeof e === 'object' && 'code' in (e as any))
          ? getFriendlyGeoError(e as GeolocationPositionError)
          : 'Could not get your location.',
      }
    );
  }, [stations]);

  const handleBoundsChange = useCallback((center: [number, number], zoom: number, bounds: MapBounds) => {
    setMapBounds(bounds);
    setViewportZoom(zoom);

    if (zoom < VIEWPORT_FILTER_MIN_ZOOM) {
      if (reverseGeoDebounceRef.current) {
        clearTimeout(reverseGeoDebounceRef.current);
        reverseGeoDebounceRef.current = null;
      }
      reverseGeoAbortRef.current?.abort();
      reverseGeoAbortRef.current = null;
      setLocationName((prev) => (prev === t('location.allIsland') ? prev : t('location.allIsland')));
      return;
    }

    if (reverseGeoDebounceRef.current) clearTimeout(reverseGeoDebounceRef.current);

    reverseGeoDebounceRef.current = setTimeout(() => {
      reverseGeoDebounceRef.current = null;
      reverseGeoAbortRef.current?.abort();
      const ac = new AbortController();
      reverseGeoAbortRef.current = ac;

      const nominatimZoom = Math.min(Math.max(Math.floor(zoom), 3), 18);
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${center[0]}&lon=${center[1]}&format=json&zoom=${nominatimZoom}`;

      void (async () => {
        try {
          const response = await fetch(url, {
            signal: ac.signal,
            headers: { Accept: 'application/json' },
          });
          if (!response.ok || ac.signal.aborted) return;
          const data = (await response.json()) as { address?: Record<string, string> };
          if (ac.signal.aborted) return;

          const address = data.address;
          let newLocationName = 'All Island';
          if (address) {
            if (zoom >= 11) {
              const localName =
                address.neighbourhood ||
                address.suburb ||
                address.village ||
                address.town ||
                address.city ||
                address.county;
              if (localName) {
                newLocationName = localName.replace(/ District$/i, '').replace(/ Division$/i, '').trim();
              } else if (address.state) {
                const provinceName = address.state;
                newLocationName = provinceName.toLowerCase().includes('province')
                  ? provinceName
                  : `${provinceName} Province`;
              }
            } else if (zoom >= VIEWPORT_FILTER_MIN_ZOOM) {
              const provinceName = address.state;
              if (provinceName) {
                newLocationName = provinceName.toLowerCase().includes('province')
                  ? provinceName
                  : `${provinceName} Province`;
              }
            }
          }

          setLocationName((prev) => (newLocationName !== prev ? newLocationName : prev));
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return;
        }
      })();
    }, REVERSE_GEO_DEBOUNCE_MS);
  }, [t]);

  // Debounced search: show local stations as soon as the timer fires; merge Nominatim when it returns.
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const seq = ++searchSuggestSeqRef.current;
    const ac = new AbortController();
    const qLower = trimmed.toLowerCase();

    const timer = setTimeout(() => {
      const loc = localizeRef.current;
      const stationMatches: SearchSuggestion[] = [];
      for (const s of stations) {
        const title = loc(s, 'name');
        const subtitle = loc(s, 'address');
        if (title.toLowerCase().includes(qLower) || subtitle.toLowerCase().includes(qLower)) {
          stationMatches.push({
            id: s.id,
            type: 'station',
            title,
            subtitle,
            coordinates: s.coordinates,
            station: s,
          });
          if (stationMatches.length >= SEARCH_STATION_LIMIT) break;
        }
      }

      if (seq !== searchSuggestSeqRef.current) return;
      setSuggestions(stationMatches);

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=${SEARCH_LOCATION_LIMIT}&countrycodes=lk`;

      void (async () => {
        let locationMatches: SearchSuggestion[] = [];
        try {
          const res = await fetch(url, {
            signal: ac.signal,
            headers: { Accept: 'application/json' },
          });
          if (!res.ok || seq !== searchSuggestSeqRef.current) return;
          const data = (await res.json()) as NominatimSearchHit[];
          if (!Array.isArray(data) || seq !== searchSuggestSeqRef.current) return;
          locationMatches = data.map((item) => {
            const parts = item.display_name.split(',');
            return {
              id: `loc-${item.place_id}`,
              type: 'location' as const,
              title: parts[0]?.trim() ?? item.display_name,
              subtitle: parts.slice(1).join(',').trim(),
              coordinates: [parseFloat(item.lat), parseFloat(item.lon)] as [number, number],
            };
          });
        } catch (e) {
          if (e instanceof Error && e.name === 'AbortError') return;
        }
        if (seq !== searchSuggestSeqRef.current) return;
        setSuggestions([...stationMatches, ...locationMatches]);
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [searchQuery, stations, language]);

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setCurrentMapCenter(suggestion.coordinates);
    setViewMode('map');
    if (suggestion.type === 'station') {
      setCurrentMapZoom(17);
      if (suggestion.station) {
        handleStationSelect(suggestion.station);
      }
    } else {
      setCurrentMapZoom(14);
    }
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchFocused(false);
  };

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesFilter =
        activeFilter === 'all' ||
        station.fuelTypes[activeFilter as keyof typeof station.fuelTypes] !== undefined;
      if (!matchesFilter) return false;

      if (mapBounds && viewportZoom >= VIEWPORT_FILTER_MIN_ZOOM) {
        const { northEast, southWest } = mapBounds;
        const latSpan = northEast[0] - southWest[0];
        const lngSpan = northEast[1] - southWest[1];
        const padLat = latSpan * VIEWPORT_PADDING_RATIO;
        const padLng = lngSpan * VIEWPORT_PADDING_RATIO;
        const neLat = northEast[0] + padLat;
        const swLat = southWest[0] - padLat;
        const neLng = northEast[1] + padLng;
        const swLng = southWest[1] - padLng;
        const [lat, lng] = station.coordinates;
        return lat <= neLat && lat >= swLat && lng <= neLng && lng >= swLng;
      }

      return true;
    });
  }, [stations, activeFilter, mapBounds, viewportZoom]);

  const sortedStations = useMemo(() => {
    const list = [...filteredStations];
    list.sort((a, b) => {
      if (sortBy === 'distance' && a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      if (sortBy === 'queue') {
        return a.petrolQueueLength + a.dieselQueueLength - (b.petrolQueueLength + b.dieselQueueLength);
      }
      const statusOrder = { available: 0, limited: 1, 'out-of-stock': 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
    return list;
  }, [filteredStations, sortBy]);

  const handleStationClick = useCallback((station: FuelStation) => {
    navigate(`/station/${station.id}`, { state: { station } });
  }, [navigate]);

  const handleStationSelect = useCallback((station: FuelStation) => {
    setSelectedStation(station);
    setIsStationSheetOpen(true);
  }, []);

  const handleSheetConfirm = useCallback((stationId: string) => {
    const station = stations.find(s => s.id === stationId) ?? selectedStation;
    if (station) {
      navigate(`/station/${station.id}`, { state: { station } });
    }
  }, [navigate, selectedStation, stations]);




  return (
    <>
      <SEO
        title="Find Fuel Stations in Sri Lanka"
        description="Real-time fuel availability map for Sri Lanka. Check petrol and diesel stock, live queue lengths, and waiting times at stations near you."
        url="/"
      />
      <Toaster position="top-center" richColors />

      <div className={`flex flex-col lg:flex-row h-screen lg:h-screen overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white/50 text-gray-900'}`}>
        {/* Dashboard Side Panel - Hidden on small screens if map is active */}
        <aside className={`
          flex-col w-full lg:w-[400px] xl:w-[450px] lg:h-full backdrop-blur-2xl border-r z-40 transition-colors duration-500
          ${theme === 'dark' ? 'bg-card/80 border-border' : 'bg-white/40 border-gray-200/50'}
          ${viewMode === 'list' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'}`}>{t('app.title')}</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{t('app.subtitle')}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-blue-50 border border-blue-100'}`}>
                  <MapPin className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`} />
                  <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-blue-700'}`}>{locationName}</span>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('submit.station')}</p>
                <FilterChips onFilterChange={setActiveFilter} />
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-3xl border flex flex-col items-center text-center shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/50 border-gray-100'}`}>
                  <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{isLoading ? '--' : sortedStations.length}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('filter.found')}</p>
                </div>
                <div className={`p-4 rounded-3xl border flex flex-col items-center text-center shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50/50 border-green-100'}`}>
                  <p className={`text-2xl font-black ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    {isLoading ? '--' : sortedStations.filter(s => s.status === 'available').length}
                  </p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${theme === 'dark' ? 'text-green-500/60' : 'text-green-600'}`}>{t('filter.stock')}</p>
                </div>
              </div>

              {/* Community Feedback Prompt */}
              <div className={`p-5 rounded-3xl border border-dashed flex flex-col items-center text-center gap-3 transition-colors duration-500 ${theme === 'dark' ? 'bg-card/40 border-gray-700' : 'bg-blue-50/30 border-blue-200'}`}>
                <div className="flex -space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${theme === 'dark' ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">Missing a station or see a mistake?</p>
                  <p className={`text-[10px] leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Help the community by requesting an update or adding a missing fuel station.</p>
                </div>
                <Link 
                  to="/feedback"
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'}`}
                >
                  Request / Feedback
                </Link>
              </div>

              {/* Station List */}
              <div className="space-y-4">
                <div className={`flex items-center justify-between pb-2 border-b transition-colors duration-500 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('station.nearby')}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className={`text-xs font-bold bg-transparent focus:outline-none cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}
                    >
                      <option value="status">{t('sort.status')}</option>
                      <option value="distance">{t('sort.distance')}</option>
                      <option value="queue">{t('sort.queue')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4 pb-10">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-32 rounded-3xl bg-gray-50 animate-pulse" />
                    ))
                  ) : sortedStations.map((station) => (
                    <Link
                      key={station.id}
                      to={`/station/${station.id}`}
                      state={{ station }}
                      className="block group"
                    >
                      <div className={`p-5 rounded-3xl border transition-all duration-500 ${theme === 'dark' ? 'bg-card border-border hover:bg-accent/10 hover:border-accent/20' : 'bg-white border-gray-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <h3 className={`font-bold transition-colors line-clamp-1 ${theme === 'dark' ? 'text-gray-100 group-hover:text-white' : 'text-gray-900 group-hover:text-blue-600'}`}>{localize(station, 'name')}</h3>
                            <p className={`text-[11px] font-medium line-clamp-1 mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{localize(station, 'address')}</p>
                          </div>
                          {(() => {
                            const hasAnyFuel = Object.values(station.fuelTypes).some(v => v !== undefined);
                            const effStatus = hasAnyFuel ? station.status : 'not-available';
                            return (
                              <div className={`
                                px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter
                                ${effStatus === 'available' 
                                  ? (theme === 'dark' ? 'bg-card border-green-500/40 text-green-400' : 'bg-green-100 text-green-700') 
                                  : ''}
                                ${effStatus === 'limited' 
                                  ? (theme === 'dark' ? 'bg-card border-amber-500/40 text-amber-400' : 'bg-amber-100 text-amber-700') 
                                  : ''}
                                ${effStatus === 'out-of-stock' 
                                  ? (theme === 'dark' ? 'bg-card border-red-500/40 text-red-400' : 'bg-red-100 text-red-700') 
                                  : ''}
                                ${effStatus === 'not-available' 
                                  ? (theme === 'dark' ? 'bg-card border-gray-500/40 text-gray-400' : 'bg-gray-100 text-gray-500') 
                                  : ''}
                              `}>
                                {effStatus === 'available' ? t('status.available') : effStatus === 'limited' ? t('status.limited') : effStatus === 'not-available' ? 'N/A' : t('status.out-of-stock')}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Fuel Type Mini Indicators */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Object.entries(station.fuelTypes).map(([type, status]) => (
                            <div 
                              key={type}
                              className={`
                                flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-tighter
                                ${status === 'available' ? 'bg-green-50 border-green-100 text-green-700' : 
                                  status === 'limited' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                                  'bg-red-50 border-red-100 text-red-700'}
                              `}
                            >
                              <div className={`w-1 h-1 rounded-full ${status === 'available' ? 'bg-green-500' : status === 'limited' ? 'bg-amber-500' : 'bg-red-500'}`} />
                              {type.replace('petrol', 'P').replace('autoDiesel', 'AD').replace('superDiesel', 'SD').replace('kerosene', 'KRS')}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-4">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t('station.queue')}</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                <Users className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-500' : 'text-blue-500'}`} />
                                {station.petrolQueueLength} / {station.dieselQueueLength}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t('station.wait')}</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                <Clock className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-500' : 'text-blue-500'}`} />
                                {station.petrolWaitingTime}m / {station.dieselWaitingTime}m
                              </div>
                            </div>
                          </div>
                          {station.distance && (
                            <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Distance</span>
                              <span className={`text-xs font-black ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`}>
                                {station.distance.toFixed(1)} <span className="text-[10px]">KM</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {!isLoading && sortedStations.length === 0 && (
                    <div className={`text-center py-20 rounded-3xl border border-dashed transition-colors duration-500 ${theme === 'dark' ? 'bg-card border-border' : 'bg-gray-50/50 border-gray-200'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm transition-colors ${theme === 'dark' ? 'bg-gray-800 text-gray-600' : 'bg-white text-gray-300'}`}>
                        <Search className="w-6 h-6" />
                      </div>
                      <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('feed.noUpdates')}</p>
                      <p className={`text-[10px] uppercase tracking-widest px-6 mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>{t('filter.adjustSearch')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Side Panel Footer - Integrated Navigation */}
          <div className={`p-4 border-t hidden lg:block transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] border-border' : 'bg-white/50 border-gray-100'}`}>
            <div className="flex items-center justify-between px-2">
              <Link to="/" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <Home className="w-5 h-5" />
              </Link>
              <Link to="/feedback" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                <MessageSquare className="w-5 h-5" />
              </Link>
              <Link to="/guide" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                <BookOpen className="w-5 h-5" />
              </Link>
              <Link to="/guide#demo" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title="Watch Demo">
                <PlayCircle className="w-5 h-5" />
              </Link>
              <Link to="/settings" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Map Section */}
        <main className={`
          flex-1 relative h-full bg-gray-50
          ${viewMode === 'map' ? 'block' : 'hidden lg:block'}
        `}>
          {/* Mobile Google-Maps-style top overlay */}
          <div className="absolute top-3 left-0 right-0 z-2000 px-4 lg:hidden">
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <div className={`relative flex items-center backdrop-blur-3xl border rounded-4xl px-4 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.12)] transition-colors duration-500 ${theme === 'dark' ? 'bg-card/90 border-border' : 'bg-white/90 border-white/50'}`}>
                  <Search className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-blue-500'}`} />
                  <input
                    type="text"
                    placeholder={t('app.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className={`flex-1 bg-transparent border-none focus:ring-0 font-semibold ml-3 text-sm transition-colors ${theme === 'dark' ? 'text-gray-100 placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400'}`}
                  />
                  <div className={`h-5 w-px mx-3 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                  <button
                    onClick={getUserLocation}
                    className={`p-2 rounded-2xl transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    aria-label={t('view.locate')}
                  >
                    <Locate className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Suggestions Dropdown */}
                {isSearchFocused && suggestions.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-3 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] border overflow-hidden z-2000 animate-in fade-in slide-in-from-top-4 duration-200 ${theme === 'dark' ? 'bg-card/95 border-border shadow-black/60' : 'bg-white/95 border-white/50'}`}>
                    <div className="p-2 space-y-1">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectSuggestion(suggestion);
                          }}
                          className={`w-full px-4 py-3 flex items-center gap-4 rounded-2xl transition-all text-left ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-blue-50/50'}`}
                        >
                          <div className={`p-2.5 rounded-xl ${suggestion.type === 'station' ? (theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-blue-100 text-blue-600') : (theme === 'dark' ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400')}`}>
                            {suggestion.type === 'station' ? <List className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>{suggestion.title}</p>
                            <p className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{suggestion.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 px-1">
                <FilterChips onFilterChange={setActiveFilter} variant="overlay" className="px-1" />
              </div>
            </div>
          </div>

          {/* Map Overlay Search Bar (Desktop only) */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-1000 w-full max-w-xl px-4 hidden lg:block">
            <div className="relative group">
              <div className="absolute inset-x-0 -bottom-4 h-8 bg-black/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className={`relative flex items-center backdrop-blur-3xl border rounded-4xl px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 focus-within:ring-2 focus-within:ring-white/20 focus-within:scale-[1.02] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] ${theme === 'dark' ? 'bg-card/90 border-border focus-within:bg-card' : 'bg-white/80 border-white/50 focus-within:bg-white'}`}>
                <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-blue-500'}`} />
                <input
                  type="text"
                  placeholder="Search stations, cities or towns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className={`flex-1 bg-transparent border-none focus:ring-0 font-medium ml-4 text-base transition-colors ${theme === 'dark' ? 'text-gray-100 placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400'}`}
                />
                <div className={`h-6 w-px mx-4 transition-colors ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                <button 
                  onClick={getUserLocation}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all duration-300 ${theme === 'dark' ? 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                >
                  <Locate className="w-4 h-4" />
                  {t('view.locate')}
                </button>
              </div>

              {/* Desktop Suggestions Dropdown */}
              {isSearchFocused && suggestions.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-3 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.15)] border overflow-hidden z-2000 animate-in fade-in slide-in-from-top-4 duration-300 ${theme === 'dark' ? 'bg-card/95 border-border shadow-black/60' : 'bg-white/90 border-white/50'}`}>
                  <div className="p-2 space-y-1">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(suggestion);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-4 rounded-2xl transition-all group/item text-left ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-blue-50/50'}`}
                      >
                        <div className={`p-2.5 rounded-xl transition-all ${suggestion.type === 'station' ? (theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-blue-100 text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white') : (theme === 'dark' ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400 group-hover/item:bg-gray-200')}`}>
                          {suggestion.type === 'station' ? <List className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold transition-colors truncate ${theme === 'dark' ? 'text-gray-200 group-hover/item:text-white' : 'text-gray-900 group-hover/item:text-blue-600'}`}>{suggestion.title}</p>
                          <p className={`text-[11px] font-medium truncate ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{suggestion.subtitle}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest hidden group-hover/item:block ${theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                          {suggestion.type}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <MapView
            stations={sortedStations}
            onStationClick={handleStationClick}
            onStationSelect={handleStationSelect}
            center={currentMapCenter}
            zoom={currentMapZoom}
            onBoundsChange={handleBoundsChange}
            userLocation={userLocation}
            variant={isMobile ? 'select' : 'popup'}
            clusterByDistrict={viewportZoom < VIEWPORT_FILTER_MIN_ZOOM}
            className="w-full h-full"
          />

          {/* Floating Action Buttons (Desktop) */}
          <div className="absolute bottom-8 right-8 z-1000 hidden lg:flex flex-col gap-3">
            <Link
              to="/feedback"
              className={`flex items-center gap-3 px-6 py-4 rounded-3xl font-black text-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:scale-95 ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'}`}
            >
              <Plus className="w-5 h-5" />
              Report Missing Station
            </Link>
          </div>

          {isLoading && (
            <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-xs transition-all duration-1000 ${theme === 'dark' ? 'bg-black/40' : 'bg-white/20'}`}>
              <div className={`p-8 rounded-[3rem] backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex flex-col items-center border animate-in zoom-in-95 duration-500 ${theme === 'dark' ? 'bg-card/95 border-border' : 'bg-white/90 border-white/50'}`}>
                <div className="relative mb-6">
                  <div className={`absolute inset-0 blur-2xl opacity-20 animate-pulse ${theme === 'dark' ? 'bg-gray-400' : 'bg-blue-500'}`} />
                  <Loader2 className={`w-12 h-12 animate-spin relative ${theme === 'dark' ? 'text-gray-300' : 'text-blue-600'}`} />
                </div>
                <p className={`font-black uppercase tracking-[0.3em] text-[10px] mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-900'}`}>Live Syncing</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${theme === 'dark' ? 'bg-gray-400' : 'bg-blue-500'}`} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${theme === 'dark' ? 'bg-gray-400' : 'bg-blue-500'}`} />
                  <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${theme === 'dark' ? 'bg-gray-400' : 'bg-blue-500'}`} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <StationBottomSheet
        station={selectedStation}
        isOpen={isStationSheetOpen}
        onClose={() => setIsStationSheetOpen(false)}
        onConfirm={handleSheetConfirm}
      />

      </>
  );
}
