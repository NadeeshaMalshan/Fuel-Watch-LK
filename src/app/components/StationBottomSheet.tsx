import { Fuel, Clock, Users, CheckCircle2, X, Navigation } from 'lucide-react';
import { FuelStation } from '../types';
import { Badge } from './ui/badge';

interface StationBottomSheetProps {
  station: FuelStation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (stationId: string) => void;
}

export function StationBottomSheet({ station, isOpen, onClose, onConfirm }: StationBottomSheetProps) {
  if (!station || !isOpen) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-green-500',
          label: 'Available',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          glowColor: 'shadow-green-500/20',
        };
      case 'limited':
        return {
          color: 'bg-amber-500',
          label: 'Limited',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          glowColor: 'shadow-amber-500/20',
        };
      case 'out-of-stock':
        return {
          color: 'bg-red-500',
          label: 'Out of Stock',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          glowColor: 'shadow-red-500/20',
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Unknown',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          glowColor: 'shadow-gray-500/20',
        };
    }
  };

  const statusConfig = getStatusConfig(station.status);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-2xl">
          <div className="backdrop-blur-xl bg-white/95 border-t border-gray-200/50 rounded-t-3xl shadow-2xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Content */}
            <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-3 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                    <Fuel className={`w-6 h-6 ${statusConfig.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 text-lg mb-1">{station.name}</h2>
                    <Badge 
                      className={`
                        ${statusConfig.color} hover:${statusConfig.color}
                        text-white border-0 shadow-md ${statusConfig.glowColor}
                      `}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Fuel Types */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Available Fuel Types</p>
                <div className="flex flex-wrap gap-2">
                  {station.fuelTypes.petrol92 && (
                    <div className={`
                      flex-1 min-w-[100px] px-4 py-3 rounded-xl text-sm font-medium border text-center
                      ${getStatusConfig(station.fuelTypes.petrol92).bgColor}
                      ${getStatusConfig(station.fuelTypes.petrol92).textColor}
                      ${getStatusConfig(station.fuelTypes.petrol92).borderColor}
                    `}>
                      Petrol 92
                    </div>
                  )}
                  {station.fuelTypes.petrol95 && (
                    <div className={`
                      flex-1 min-w-[100px] px-4 py-3 rounded-xl text-sm font-medium border text-center
                      ${getStatusConfig(station.fuelTypes.petrol95).bgColor}
                      ${getStatusConfig(station.fuelTypes.petrol95).textColor}
                      ${getStatusConfig(station.fuelTypes.petrol95).borderColor}
                    `}>
                      Petrol 95
                    </div>
                  )}
                  {station.fuelTypes.diesel && (
                    <div className={`
                      flex-1 min-w-[100px] px-4 py-3 rounded-xl text-sm font-medium border text-center
                      ${getStatusConfig(station.fuelTypes.diesel).bgColor}
                      ${getStatusConfig(station.fuelTypes.diesel).textColor}
                      ${getStatusConfig(station.fuelTypes.diesel).borderColor}
                    `}>
                      Diesel
                    </div>
                  )}
                  {station.fuelTypes.kerosene && (
                    <div className={`
                      flex-1 min-w-[100px] px-4 py-3 rounded-xl text-sm font-medium border text-center
                      ${getStatusConfig(station.fuelTypes.kerosene).bgColor}
                      ${getStatusConfig(station.fuelTypes.kerosene).textColor}
                      ${getStatusConfig(station.fuelTypes.kerosene).borderColor}
                    `}>
                      Kerosene
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500">Last Updated</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{station.lastUpdated}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500">Queue Length</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{station.queueLength} vehicles</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Open in maps app
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}`, '_blank');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 active:scale-[0.98] text-gray-700 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </button>
                <button
                  onClick={() => {
                    onConfirm(station.id);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white font-medium text-sm shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}