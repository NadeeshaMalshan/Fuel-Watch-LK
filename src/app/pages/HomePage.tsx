import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { FilterChips } from '../components/FilterChips';
import { MapView } from '../components/MapView';
import { StationBottomSheet } from '../components/StationBottomSheet';
import { FuelStation } from '../types';
import { mockStations, locationCoordinates } from '../data/mockData';
import { toast, Toaster } from 'sonner';
import { List, Map, Navigation, TrendingUp } from 'lucide-react';

type FuelType = 'all' | 'petrol92' | 'petrol95' | 'diesel' | 'kerosene';
type SortBy = 'status' | 'distance' | 'queue';

export function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FuelType>('all');
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [currentLocation, setCurrentLocation] = useState<string>('ratnapura');
  const [stations, setStations] = useState<FuelStation[]>(mockStations);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('status');

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
              
              // Calculate distances for all stations
              const stationsWithDistance = mockStations.map(station => ({
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
    if (activeFilter === 'all') return true;
    return station.fuelTypes[activeFilter as keyof typeof station.fuelTypes] !== undefined;
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
    const station = mockStations.find((s) => s.id === stationId);
    toast.success(`Thank you for confirming the status of ${station?.name}!`, {
      description: 'Your confirmation helps others in the community.',
      duration: 3000,
    });
  };

  const mapCenter = userLocation || locationCoordinates[currentLocation] || locationCoordinates.ratnapura;

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <Header />
      <FilterChips onFilterChange={setActiveFilter} />
      
      {/* Controls Bar */}
      <div className="sticky top-[152px] z-30 backdrop-blur-xl bg-white/60 border-b border-gray-200/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 justify-between items-center flex-wrap">
            {/* Find Nearest Button */}
            <button
              onClick={getUserLocation}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 hover:from-green-600 hover:to-green-700 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              Find Nearest
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="status">Sort by Status</option>
                <option value="distance">Sort by Distance</option>
                <option value="queue">Sort by Queue</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${viewMode === 'map' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full">
        {/* Stats Bar */}
        <div className="mb-4 p-4 rounded-xl backdrop-blur-xl bg-white/60 border border-gray-200/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{sortedStations.length}</p>
              <p className="text-sm text-gray-600">Stations Found</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {sortedStations.filter((s) => s.status === 'available').length}
              </p>
              <p className="text-sm text-gray-600">Available Now</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {sortedStations.filter((s) => s.status === 'limited').length}
              </p>
              <p className="text-sm text-gray-600">Limited Stock</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {sortedStations.filter((s) => s.status === 'out-of-stock').length}
              </p>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Map or List View */}
        {viewMode === 'map' ? (
          <div className="h-[calc(100vh-480px)] min-h-[400px] mb-4">
            <MapView
              stations={sortedStations}
              onStationClick={handleStationClick}
              center={mapCenter}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {sortedStations.map((station) => (
              <Link
                key={station.id}
                to={`/station/${station.id}`}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 hover:shadow-xl hover:border-gray-300/50 active:scale-[0.98] transition-all duration-300 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                      <p className="text-xs text-gray-500">{station.address}</p>
                    </div>
                    {station.distance && (
                      <div className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700">{station.distance.toFixed(1)} km</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`
                      px-3 py-1 rounded-lg text-xs font-medium
                      ${station.status === 'available' ? 'bg-green-100 text-green-700' : ''}
                      ${station.status === 'limited' ? 'bg-amber-100 text-amber-700' : ''}
                      ${station.status === 'out-of-stock' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                      {station.status === 'available' ? 'Available' : ''}
                      {station.status === 'limited' ? 'Limited' : ''}
                      {station.status === 'out-of-stock' ? 'Out of Stock' : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Queue: {station.queueLength}</span>
                    <span>Wait: {station.waitingTime} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

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
