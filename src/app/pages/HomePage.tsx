import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { FilterChips } from '../components/FilterChips';
import { MapView } from '../components/MapView';
import { StationBottomSheet } from '../components/StationBottomSheet';
import type { FuelStation } from '../types';
import { fetchFuelStations } from '../services/osmService';
import { toast, Toaster } from 'sonner';
import { List, Map, TrendingUp, Loader2, Search, Locate, Clock, Users, MapPin, Activity, Home, PlusCircle } from 'lucide-react';

type FuelType = 'all' | 'petrol92' | 'petrol95' | 'diesel' | 'kerosene';
type SortBy = 'status' | 'distance' | 'queue';

export function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FuelType>('all');
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('status');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(8);

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
  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      toast.promise(
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
              setUserLocation(coords);
              setMapZoom(13);
              
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
            (error) => reject(error)
          );
        }),
        {
          loading: 'Getting your location...',
          success: 'Location found! Showing nearest stations.',
          error: 'Could not get your location.',
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const filteredStations = stations.filter((station) => {
    const matchesFilter = activeFilter === 'all' || station.fuelTypes[activeFilter as keyof typeof station.fuelTypes] !== undefined;
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         station.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort stations
  const sortedStations = [...filteredStations].sort((a, b) => {
    if (sortBy === 'distance' && a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    if (sortBy === 'queue') {
      return a.queueLength - b.queueLength;
    }
    // Sort by status: available > limited > out-of-stock
    const statusOrder = { available: 0, limited: 1, 'out-of-stock': 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const handleStationClick = (station: FuelStation) => {
    setSelectedStation(station);
    setIsBottomSheetOpen(true);
  };

  const handleConfirmStatus = (stationId: string) => {
    const station = stations.find((s: FuelStation) => s.id === stationId);
    toast.success(`Thank you for confirming the status of ${station?.name}!`, {
      description: 'Your confirmation helps others in the community.',
      duration: 3000,
    });
  };

  const mapCenter = userLocation || [7.8731, 80.7718];

  return (
    <>
      <Toaster position="top-center" richColors />
      
      {/* Mobile Top Header - Hidden on Desktop */}
      <div className="lg:hidden">
        <Header />
      </div>

      <div className="flex flex-col lg:flex-row h-screen lg:h-screen overflow-hidden bg-white/50">
        {/* Dashboard Side Panel - Hidden on small screens if map is active */}
        <aside className={`
          flex-col w-full lg:w-[400px] xl:w-[450px] lg:h-full bg-white/40 backdrop-blur-2xl border-r border-gray-200/50 z-40
          ${viewMode === 'list' ? 'flex' : 'hidden lg:flex'}
        `}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fuel Watch</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">SRI LANKA REAL-TIME</p>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">All Island</span>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Fuel Type</p>
                <FilterChips onFilterChange={setActiveFilter} />
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-3xl bg-white/50 border border-gray-100 flex flex-col items-center text-center shadow-sm">
                  <p className="text-2xl font-black text-gray-900">{isLoading ? '--' : sortedStations.length}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Found</p>
                </div>
                <div className="p-4 rounded-3xl bg-green-50/50 border border-green-100 flex flex-col items-center text-center shadow-sm">
                  <p className="text-2xl font-black text-green-600">
                    {isLoading ? '--' : sortedStations.filter(s => s.status === 'available').length}
                  </p>
                  <p className="text-[9px] text-green-600 font-bold uppercase tracking-wider mt-1">Stock</p>
                </div>
              </div>

              {/* Sorting & Search (Mobile only, Desktop uses map overlay) */}
              <div className="lg:hidden flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Station List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nearby Stations</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="text-xs font-bold text-blue-600 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="status">Status</option>
                      <option value="distance">Distance</option>
                      <option value="queue">Queue</option>
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
                      <div className="p-5 rounded-3xl bg-white border border-gray-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-2">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{station.name}</h3>
                            <p className="text-[11px] text-gray-400 font-medium line-clamp-1 mt-0.5">{station.address}</p>
                          </div>
                          <div className={`
                            px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter
                            ${station.status === 'available' ? 'bg-green-100 text-green-700' : ''}
                            ${station.status === 'limited' ? 'bg-amber-100 text-amber-700' : ''}
                            ${station.status === 'out-of-stock' ? 'bg-red-100 text-red-700' : ''}
                          `}>
                            {station.status === 'available' ? 'In Stock' : station.status === 'limited' ? 'Limited' : 'Dry'}
                          </div>
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
                              {type.replace('petrol', 'P').replace('diesel', 'DSL').replace('kerosene', 'KRS')}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-4">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Queue</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                <Users className="w-3 h-3 text-blue-500" />
                                {station.queueLength}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Wait</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                <Clock className="w-3 h-3 text-blue-500" />
                                {station.waitingTime}m
                              </div>
                            </div>
                          </div>
                          {station.distance && (
                            <div className="flex flex-col items-end">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Distance</span>
                              <span className="text-xs font-black text-blue-600">
                                {station.distance.toFixed(1)} <span className="text-[10px]">KM</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {!isLoading && sortedStations.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Search className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm font-bold text-gray-400">No stations found</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest px-6 mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Side Panel Footer - Integrated Navigation */}
          <div className="p-4 border-t border-gray-100 bg-white/50 hidden lg:block">
            <div className="flex items-center justify-between px-2">
              <Link to="/" className="p-3 rounded-2xl bg-blue-50 text-blue-600 transition-all hover:scale-110">
                <Home className="w-5 h-5" />
              </Link>
              <Link to="/submit" className="p-3 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-110">
                <PlusCircle className="w-5 h-5" />
              </Link>
              <Link to="/feed" className="p-3 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-110">
                <Activity className="w-5 h-5" />
              </Link>
              <button className="p-3 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-110">
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Map Section */}
        <main className={`
          flex-1 relative h-full bg-gray-50
          ${viewMode === 'map' ? 'block' : 'hidden lg:block'}
        `}>
          {/* Map Overlay Search Bar (Desktop only) */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-1000 w-full max-w-xl px-4 hidden lg:block">
            <div className="relative group">
              <div className="absolute inset-x-0 -bottom-4 h-8 bg-black/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[2rem] px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:bg-white focus-within:scale-[1.02] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                <Search className="w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  placeholder="Search by station name, brand or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 font-medium placeholder:text-gray-400 ml-4 text-base"
                />
                <div className="h-6 w-px bg-gray-100 mx-4" />
                <button 
                  onClick={getUserLocation}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all duration-300"
                >
                  <Locate className="w-4 h-4" />
                  LOCATE ME
                </button>
              </div>
            </div>
          </div>

          {/* Map View Toggle (Mobile only) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-1000 lg:hidden">
            <div className="flex p-1.5 bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2rem] shadow-2xl">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-7 py-3 rounded-[1.5rem] text-sm font-black transition-all duration-500 ${viewMode === 'map' ? 'bg-gray-900 text-white shadow-xl shadow-black/20' : 'text-gray-500 hover:bg-white'}`}
              >
                <Map className="w-4 h-4" />
                MAP
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-7 py-3 rounded-[1.5rem] text-sm font-black transition-all duration-500 ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-xl shadow-black/20' : 'text-gray-500 hover:bg-white'}`}
              >
                <List className="w-4 h-4" />
                LIST
              </button>
            </div>
          </div>

          <MapView
            stations={sortedStations}
            onStationClick={handleStationClick}
            center={mapCenter}
            zoom={mapZoom}
          />

          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/20 backdrop-blur-xs transition-all duration-1000">
              <div className="p-8 rounded-[3rem] bg-white/90 backdrop-blur-2xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex flex-col items-center border border-white/50 animate-in zoom-in-95 duration-500">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative" />
                </div>
                <p className="text-gray-900 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Live Syncing</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Sheet */}
      <StationBottomSheet
        station={selectedStation}
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onConfirm={handleConfirmStatus}
      />
    </>
  );
}
