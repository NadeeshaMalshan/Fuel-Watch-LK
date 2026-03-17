import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, MapPin, Clock, Users, Fuel, TrendingUp } from 'lucide-react';
import { mockUpdates } from '../data/mockData';
import { UserUpdate } from '../types';
import { formatDistanceToNow } from 'date-fns';

export function LiveFeedPage() {
  const [updates, setUpdates] = useState<UserUpdate[]>(mockUpdates);
  const [isLive, setIsLive] = useState(true);

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
        return 'text-green-600 bg-green-50 border-green-200';
      case 'limited':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'out-of-stock':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="font-semibold text-gray-900">Live Community Feed</h1>
                <p className="text-sm text-gray-500">Real-time updates from users</p>
              </div>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-700">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Summary */}
        <div className="mb-6 p-4 rounded-xl backdrop-blur-xl bg-white/60 border border-gray-200/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Community Activity</h2>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{updates.length}</span> updates in the last hour from community members
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
              <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 hover:shadow-xl hover:border-gray-300/50 active:scale-[0.99] transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {update.stationName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">{update.userName}</span>
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
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
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
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-700 italic">"{update.message}"</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Load More (placeholder) */}
        <div className="mt-6 text-center">
          <button className="px-6 py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm transition-all">
            Load More Updates
          </button>
        </div>
      </main>
    </div>
  );
}
