import { Fuel, CheckCircle2, X, Navigation } from 'lucide-react';
import type { FuelStation } from '../types';
import { Badge } from './ui/badge';
import { useTheme } from '../context/ThemeContext';

interface StationBottomSheetProps {
  station: FuelStation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (stationId: string) => void;
}

export function StationBottomSheet({ station, isOpen, onClose, onConfirm }: StationBottomSheetProps) {
  const { theme, t, localize } = useTheme();
  
  if (!station || !isOpen) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-green-500',
          label: t('status.available'),
          textColor: 'text-green-700',
          bgColor: theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50',
          borderColor: theme === 'dark' ? 'border-green-500/20' : 'border-green-200',
          glowColor: 'shadow-green-500/20',
        };
      case 'limited':
        return {
          color: 'bg-amber-500',
          label: t('status.limited'),
          textColor: 'text-amber-700',
          bgColor: theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50',
          borderColor: theme === 'dark' ? 'border-amber-500/20' : 'border-amber-200',
          glowColor: 'shadow-amber-500/20',
        };
      case 'out-of-stock':
        return {
          color: 'bg-red-500',
          label: t('status.out-of-stock'),
          textColor: 'text-red-700',
          bgColor: theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50',
          borderColor: theme === 'dark' ? 'border-red-500/20' : 'border-red-200',
          glowColor: 'shadow-red-500/20',
        };
      default:
        return {
          color: 'bg-gray-500',
          label: t('status.not-available'),
          textColor: 'text-gray-700',
          bgColor: theme === 'dark' ? 'bg-gray-500/10' : 'bg-gray-50',
          borderColor: theme === 'dark' ? 'border-gray-500/20' : 'border-gray-200',
          glowColor: 'shadow-gray-500/20',
        };
    }
  };

  const statusConfig = getStatusConfig(station.status);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-[5990] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[6000] animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <div className={`backdrop-blur-2xl border transition-colors duration-500 rounded-[2.5rem] shadow-2xl overflow-hidden
            ${theme === 'dark' ? 'bg-card/90 border-border' : 'bg-white/95 border-gray-200/50'}
          `}>
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className={`w-12 h-1.5 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>

            {/* Content */}
            <div className="px-6 pb-8 max-h-[75vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-4 rounded-3xl ${statusConfig.bgColor} ${statusConfig.borderColor} border shadow-lg transition-colors duration-500`}>
                    <Fuel className={`w-6 h-6 ${statusConfig.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`font-black text-xl mb-1 truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{localize(station, 'name')}</h2>
                    <Badge 
                      className={`
                        ${statusConfig.color} hover:${statusConfig.color}
                        text-white border-0 shadow-lg ${statusConfig.glowColor} rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider
                      `}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-2xl active:scale-95 transition-all ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Fuel Types */}
              <div className="mb-6">
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 px-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('submit.status')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { id: 'petrol92', key: 'fuel.petrol92' },
                    { id: 'petrol95', key: 'fuel.petrol95' },
                    { id: 'autoDiesel', key: 'fuel.diesel' },
                    { id: 'superDiesel', key: 'fuel.superDiesel' },
                    { id: 'kerosene', key: 'fuel.kerosene' }
                  ].map((fuel) => {
                    const status = station.fuelTypes?.[fuel.id as keyof typeof station.fuelTypes];
                    if (!status) return null;
                    const config = getStatusConfig(status);
                    
                    return (
                      <div key={fuel.id} className={`
                        px-4 py-4 rounded-3xl text-xs font-bold border text-center transition-all duration-500 flex flex-col gap-1 shadow-sm
                        ${config.bgColor} ${config.textColor} ${config.borderColor}
                      `}>
                        <span className="opacity-60">{t(fuel.key)}</span>
                        <span>{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Petrol Queue */}
                <div className={`p-4 rounded-3xl border transition-colors duration-500
                  ${theme === 'dark' ? 'bg-card/40 border-border' : 'bg-blue-50 border-blue-100'}
                `}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-background text-foreground' : 'bg-white text-blue-500'} shadow-sm`}>
                      <Fuel className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-foreground' : 'text-blue-600'}`}>
                      Petrol {t('station.queue')}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className={`text-sm font-black ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {station.petrolQueueLength ?? 0} <span className="text-[10px] font-bold opacity-50">{t('station.vehicles')}</span>
                    </p>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-foreground/80' : 'text-blue-700'}`}>
                      {station.petrolWaitingTime ?? 0} <span className="text-[10px] opacity-60">mins</span>
                    </p>
                  </div>
                </div>

                {/* Diesel Queue */}
                <div className={`p-4 rounded-3xl border transition-colors duration-500
                  ${theme === 'dark' ? 'bg-card/40 border-border' : 'bg-orange-50 border-orange-100'}
                `}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-background text-foreground' : 'bg-white text-orange-500'} shadow-sm`}>
                      <Fuel className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-foreground' : 'text-orange-600'}`}>
                      Diesel {t('station.queue')}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className={`text-sm font-black ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {station.dieselQueueLength ?? 0} <span className="text-[10px] font-bold opacity-50">{t('station.vehicles')}</span>
                    </p>
                    <p className={`text-xs font-bold ${theme === 'dark' ? 'text-foreground/80' : 'text-orange-700'}`}>
                      {station.dieselWaitingTime ?? 0} <span className="text-[10px] opacity-60">mins</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}`, '_blank');
                  }}
                  className={`flex-1 py-4 px-6 rounded-3xl border-2 font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 active:scale-95
                    ${theme === 'dark' ? 'bg-transparent border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:text-gray-900 shadow-sm'}
                  `}
                >
                  <Navigation className="w-4 h-4" />
                  {t('station.getDirections')}
                </button>
                <button
                  onClick={() => {
                    onConfirm(station.id);
                    onClose();
                  }}
                  className="flex-1 py-4 px-6 rounded-3xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t('station.reportUpdate')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}