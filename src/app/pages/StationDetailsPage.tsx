import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Navigation, Share2, Fuel, TrendingUp } from 'lucide-react';
import { fetchFuelStations } from '../services/osmService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import type { FuelStation, UserUpdate } from '../types';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export function StationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  const [station, setStation] = useState<FuelStation | null>((location.state?.station as FuelStation) || null);
  const stationUpdates: UserUpdate[] = [];
  const [isLoading, setIsLoading] = useState(!station);

  useEffect(() => {
    if (!station && id) {
      fetchFuelStations().then(stations => {
        const found = stations.find(s => s.id === id);
        if (found) setStation(found);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [id, station]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Station not found</h2>
          <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-green-500',
          label: 'Available',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'limited':
        return {
          color: 'bg-amber-500',
          label: 'Limited',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
      case 'out-of-stock':
        return {
          color: 'bg-red-500',
          label: 'Out of Stock',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Unknown',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusConfig = getStatusConfig(station.status);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: station.name,
        text: `Check fuel availability at ${station.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleNavigate = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}`,
      '_blank'
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} pb-24 transition-colors duration-500`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200/50'} border-b shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Station Info Card */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200/50'} border shadow-lg`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <Fuel className={`w-8 h-8 ${statusConfig.textColor}`} />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>{station.name}</h1>
              <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                <MapPin className="w-4 h-4" />
                <span>{station.address}</span>
              </div>
              <div className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.color} text-white shadow-md`}>
                {statusConfig.label}
              </div>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'} border`}>
              <div className="flex items-center gap-2 mb-1">
                <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Queue Length</span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{station.queueLength ?? '--'}</p>
              <p className="text-xs text-gray-500">vehicles</p>
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100'} border`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Wait Time</span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{station.waitingTime ?? '--'}</p>
              <p className="text-xs text-gray-500">minutes</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            <TrendingUp className="w-4 h-4" />
            <span>Last updated {station.lastUpdated}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleNavigate}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
            </button>
            <Link
              to="/submit"
              className="flex-1 py-3 px-4 rounded-xl bg-white border-2 border-blue-500 hover:bg-blue-50 active:scale-[0.98] text-blue-600 font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              Update Status
            </Link>
          </div>
        </div>

        {/* Fuel Availability */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200/50'} border shadow-sm`}>
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Fuel Availability</h2>
          <div className="grid grid-cols-2 gap-3">
            {station.fuelTypes?.petrol92 && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.petrol92).bgColor} ${getStatusConfig(station.fuelTypes.petrol92).borderColor}`}>
                <p className="text-sm font-medium text-gray-700 mb-1">Petrol 92</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.petrol92).textColor}`}>
                  {getStatusConfig(station.fuelTypes.petrol92).label}
                </p>
              </div>
            )}
            {station.fuelTypes?.petrol95 && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.petrol95).bgColor} ${getStatusConfig(station.fuelTypes.petrol95).borderColor}`}>
                <p className="text-sm font-medium text-gray-700 mb-1">Petrol 95</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.petrol95).textColor}`}>
                  {getStatusConfig(station.fuelTypes.petrol95).label}
                </p>
              </div>
            )}
            {station.fuelTypes?.diesel && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.diesel).bgColor} ${getStatusConfig(station.fuelTypes.diesel).borderColor}`}>
                <p className="text-sm font-medium text-gray-700 mb-1">Diesel</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.diesel).textColor}`}>
                  {getStatusConfig(station.fuelTypes.diesel).label}
                </p>
              </div>
            )}
            {station.fuelTypes?.kerosene && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.kerosene).bgColor} ${getStatusConfig(station.fuelTypes.kerosene).borderColor}`}>
                <p className="text-sm font-medium text-gray-700 mb-1">Kerosene</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.kerosene).textColor}`}>
                  {getStatusConfig(station.fuelTypes.kerosene).label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Updates */}
        {stationUpdates.length > 0 && (
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Community Updates</h2>
            <div className="space-y-3">
              {stationUpdates.map((update: UserUpdate) => (
                <div key={update.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{update.userName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusConfig(update.status).bgColor} ${getStatusConfig(update.status).borderColor} ${getStatusConfig(update.status).textColor}`}>
                      {getStatusConfig(update.status).label}
                    </div>
                  </div>
                  {update.message && (
                    <p className="text-sm text-gray-700 italic">"{update.message}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
