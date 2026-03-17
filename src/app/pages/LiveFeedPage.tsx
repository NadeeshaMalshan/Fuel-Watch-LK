import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, TrendingUp, Home, PlusCircle, Activity, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { UserUpdate, FuelStation } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { MapView } from '../components/MapView';
import { fetchFuelStations } from '../services/osmService';

export function LiveFeedPage() {
  const { theme } = useTheme();
  const [updates, setUpdates] = useState<UserUpdate[]>([]);
  const [isLive] = useState(true);
  const [stations, setStations] = useState<FuelStation[]>([]);

  useEffect(() => {
    fetchFuelStations().then(setStations);
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate a new update appearing randomly
      if (Math.random() > 0.7) {
        const newUpdate: UserUpdate = {
          id: Date.now().toString(),
          stationId: '1',
          stationName: 'Ceypetco - New Town',
          userName: 'Community User',
          timestamp: new Date(),
          status: 'available',
          queueLength: Math.floor(Math.random() * 30),
          waitingTime: Math.floor(Math.random() * 45),
          fuelTypes: {
            petrol92: 'available',
            diesel: 'available',
          },
          message: 'Just updated!',
        };
        
        setUpdates(prev => [newUpdate, ...prev].slice(0, 20));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return theme === 'dark' 
          ? 'text-green-400 bg-green-500/10 border-green-500/20' 
          : 'text-green-600 bg-green-50 border-green-200';
      case 'limited':
        return theme === 'dark'
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          : 'text-amber-600 bg-amber-50 border-amber-200';
      case 'out-of-stock':
        return theme === 'dark'
          ? 'text-red-400 bg-red-500/10 border-red-500/20'
          : 'text-red-600 bg-red-50 border-red-200';
      default:
        return theme === 'dark'
          ? 'text-gray-400 bg-gray-800 border-gray-700'
          : 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row h-screen lg:h-screen overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      
      {/* Left Panel - Contains Feed */}
      <aside className={`flex flex-col w-full lg:w-[400px] xl:w-[450px] lg:h-full backdrop-blur-2xl border-r z-40 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a1a1a]/80 border-[#2a2a2a]' : 'bg-white/40 border-gray-200/50'}`}>
        <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm px-4 py-4 shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#161616]/90 border-[#2a2a2a]' : 'bg-white/80 border-gray-200/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
              >
                <ArrowLeft className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`} />
              </Link>
              <div>
                <h1 className={`font-semibold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Live Community Feed</h1>
                <p className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Real-time updates from users</p>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-700">LIVE</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <main className="px-4 py-6 w-full">
        {/* Stats Summary */}
        <div className={`mb-6 p-4 rounded-xl backdrop-blur-xl border transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/60 border-gray-200/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`} />
            <h2 className={`font-semibold transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Community Activity</h2>
          </div>
          <p className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className={`font-semibold transition-colors ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{updates.length}</span> updates in the last hour from community members
          </p>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {updates.map((update) => (
            <Link
              key={update.id}
              to={`/station/${update.stationId}`}
              className="block group"
            >
              <div className={`p-5 rounded-2xl backdrop-blur-xl border active:scale-[0.99] transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60' : 'bg-white/80 border-gray-200/50 hover:shadow-xl hover:border-gray-300/50'}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-blue-50 border-blue-200'}`}>
                      <MapPin className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-1 transition-colors ${theme === 'dark' ? 'text-gray-100 group-hover:text-white' : 'text-gray-900 group-hover:text-blue-600'}`}>
                        {update.stationName}
                      </h3>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        <span className={`font-medium transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{update.userName}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(update.timestamp, { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(update.status)}`}>
                    {update.status === 'available' ? 'Available' : ''}
                    {update.status === 'limited' ? 'Limited' : ''}
                    {update.status === 'out-of-stock' ? 'Out of Stock' : ''}
                  </div>
                </div>

                {/* Fuel Types */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {update.fuelTypes.petrol92 && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(update.fuelTypes.petrol92)}`}>
                      Petrol 92
                    </div>
                  )}
                  {update.fuelTypes.petrol95 && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(update.fuelTypes.petrol95)}`}>
                      Petrol 95
                    </div>
                  )}
                  {update.fuelTypes.diesel && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(update.fuelTypes.diesel)}`}>
                      Diesel
                    </div>
                  )}
                  {update.fuelTypes.kerosene && (
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(update.fuelTypes.kerosene)}`}>
                      Kerosene
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className={`flex items-center gap-4 mb-3 text-sm transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{update.queueLength} in queue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{update.waitingTime} min wait</span>
                  </div>
                </div>

                {/* Message */}
                {update.message && (
                  <div className={`p-3 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
                    <p className={`text-sm italic transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>"{update.message}"</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Load More (placeholder) */}
        <div className="mt-6 text-center">
          <button className={`px-6 py-3 rounded-xl border font-medium text-sm transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'}`}>
            Load More Updates
          </button>
        </div>
          </main>
        </div>
        
        {/* Desktop Side Panel Footer - Integrated Navigation */}
        <div className={`p-4 border-t hidden lg:block shrink-0 mt-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white/50 border-gray-100'}`}>
          <div className="flex items-center justify-between px-2">
            <Link to="/" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
              <Home className="w-5 h-5" />
            </Link>
            <Link to="/submit" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
              <PlusCircle className="w-5 h-5" />
            </Link>
            <Link to="/feed" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
              <Activity className="w-5 h-5" />
            </Link>
            <Link to="/settings" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Right Panel - Map (Desktop only) */}
      <main className="hidden lg:block flex-1 relative h-full bg-gray-50">
        <MapView
          stations={stations}
          onStationClick={() => {}}
          center={[7.8731, 80.7718]}
          zoom={8}
        />
      </main>
    </div>
  );
}
