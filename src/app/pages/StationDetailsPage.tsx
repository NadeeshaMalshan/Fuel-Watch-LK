import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowLeft, MapPin, Navigation, Share2, Fuel, TrendingUp, AlertCircle, Send, CheckCircle, X, PlusCircle, Bell, BellOff } from 'lucide-react';
// import { fetchFuelStations } from '../services/osmService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { FuelStation, UserUpdate, FuelStatus, SubmitUpdateForm } from '../types';
import { useState, useEffect, type ReactNode } from 'react';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../services/api';
import { seedLastSeenFromServer } from '../services/stationWatchApi';
import { ensureServiceWorkerForNotifications } from '../utils/showWebNotification';
import {
  addWatchedStation,
  isWatchedStation,
  removeWatchedStation,
  WATCH_CHANGED_EVENT,
} from '../services/stationWatchStorage';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export function StationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, t, localize } = useTheme();
  
  const [station] = useState<FuelStation | null>((location.state?.station as FuelStation) || null);
  const [stationUpdates, setStationUpdates] = useState<UserUpdate[]>([]);
  const [isLoading] = useState(!station);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertsOn, setAlertsOn] = useState(() => (id ? isWatchedStation(id) : false));

  const [formData, setFormData] = useState<SubmitUpdateForm>({
    stationId: id || '',
    userName: '',
    petrolQueueLength: station?.petrolQueueLength || 0,
    petrolWaitingTime: station?.petrolWaitingTime || 0,
    dieselQueueLength: station?.dieselQueueLength || 0,
    dieselWaitingTime: station?.dieselWaitingTime || 0,
    status: (station?.status as FuelStatus) || 'available',
    petrol92: (station?.fuelTypes?.petrol92 as FuelStatus | 'not-available') || 'not-available',
    petrol95: (station?.fuelTypes?.petrol95 as FuelStatus | 'not-available') || 'not-available',
    autoDiesel: (station?.fuelTypes?.autoDiesel as FuelStatus | 'not-available') || 'not-available',
    superDiesel: (station?.fuelTypes?.superDiesel as FuelStatus | 'not-available') || 'not-available',
    kerosene: (station?.fuelTypes?.kerosene as FuelStatus | 'not-available') || 'not-available',
    message: '',
  });
  

  // Automatically calculate overall status based on individual fuel types
  useEffect(() => {
    const fuelStatuses = [formData.petrol92, formData.petrol95, formData.autoDiesel, formData.superDiesel, formData.kerosene];
    
    let newStatus: FuelStatus = 'out-of-stock';
    if (fuelStatuses.some(s => s === 'available')) {
      newStatus = 'available';
    } else if (fuelStatuses.some(s => s === 'limited')) {
      newStatus = 'limited';
    }
    if (newStatus !== formData.status) {
      setFormData(prev => ({ ...prev, status: newStatus }));
    }
  }, [formData.petrol92, formData.petrol95, formData.autoDiesel, formData.superDiesel, formData.kerosene]);

  useEffect(() => {
    if (!id) return;
    setAlertsOn(isWatchedStation(id));
    const sync = () => setAlertsOn(isWatchedStation(id));
    window.addEventListener(WATCH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(WATCH_CHANGED_EVENT, sync);
  }, [id]);

  // Load last 5 community updates for this station
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const loadUpdates = async () => {
      try {
        const response = await fetch(`${API_BASE}/stations/${id}/updates`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          toast.error(`Failed to load recent updates (${response.status})`);
          return setStationUpdates([]);
        }

        const updates = await response.json();

        const mapped: UserUpdate[] = (Array.isArray(updates) ? updates : []).map((u: any) => ({
          id: String(u.id),
          stationId: String(u.stationId ?? ''),
          stationName: String(u.stationName ?? ''),
          userName: String(u.userName ?? ''),
          timestamp: new Date(u.timestamp),
          status: (u.status as any) || 'out-of-stock',
          petrolQueueLength: Number(u.petrolQueueLength ?? 0),
          petrolWaitingTime: Number(u.petrolWaitingTime ?? 0),
          dieselQueueLength: Number(u.dieselQueueLength ?? 0),
          dieselWaitingTime: Number(u.dieselWaitingTime ?? 0),
          fuelTypes: {
            petrol92: u.petrol92 ?? undefined,
            petrol95: u.petrol95 ?? undefined,
            autoDiesel: u.autoDiesel ?? undefined,
            superDiesel: u.superDiesel ?? undefined,
            kerosene: u.kerosene ?? undefined,
          },
          message: u.message ?? undefined,
        }));

        setStationUpdates(mapped);
      } catch {
        // Silent fail: UI will just hide updates if backend is unreachable.
        toast.error('Failed to load recent updates');
        setStationUpdates([]);
      }
    };

    loadUpdates();
    return () => controller.abort();
  }, [id]);

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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('feed.noUpdates')}</h2>
          <Link to="/" className="text-blue-600 hover:underline">{t('nav.home')}</Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-green-500',
          label: t('status.available'),
          textColor: theme === 'dark' ? 'text-green-400' : 'text-green-700',
          bgColor: theme === 'dark' ? 'bg-secondary/40' : 'bg-green-50',
          borderColor: theme === 'dark' ? 'border-green-500/20' : 'border-green-200',
        };
      case 'limited':
        return {
          color: 'bg-amber-500',
          label: t('status.limited'),
          textColor: theme === 'dark' ? 'text-amber-400' : 'text-amber-700',
          bgColor: theme === 'dark' ? 'bg-secondary/40' : 'bg-amber-50',
          borderColor: theme === 'dark' ? 'border-amber-500/20' : 'border-amber-200',
        };
      case 'out-of-stock':
        return {
          color: 'bg-red-500',
          label: t('status.out-of-stock'),
          textColor: theme === 'dark' ? 'text-red-400' : 'text-red-700',
          bgColor: theme === 'dark' ? 'bg-secondary/40' : 'bg-red-50',
          borderColor: theme === 'dark' ? 'border-red-500/20' : 'border-red-200',
        };
      default:
        return {
          color: 'bg-gray-500',
          label: t('status.unknown'),
          textColor: theme === 'dark' ? 'text-gray-400' : 'text-gray-700',
          bgColor: theme === 'dark' ? 'bg-secondary/40' : 'bg-gray-50',
          borderColor: theme === 'dark' ? 'border-gray-500/20' : 'border-gray-200',
        };
    }
  };

  const statusConfig = getStatusConfig(station.status);

  const getReportedFuelBadges = (update: UserUpdate): ReactNode => {
    const fuelItems: Array<{
      key: string;
      short: string;
      value: any;
    }> = [
      { key: 'petrol92', short: 'P92', value: update.fuelTypes?.petrol92 },
      { key: 'petrol95', short: 'P95', value: update.fuelTypes?.petrol95 },
      { key: 'autoDiesel', short: 'AD', value: update.fuelTypes?.autoDiesel },
      { key: 'superDiesel', short: 'SD', value: update.fuelTypes?.superDiesel },
      { key: 'kerosene', short: 'KRS', value: update.fuelTypes?.kerosene },
    ];

    const reported = fuelItems.filter((i) => i.value && i.value !== 'not-available');
    if (reported.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {reported.map((item) => {
          const cfg = getStatusConfig(String(item.value));
          return (
            <span
              key={item.key}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${cfg.bgColor} ${cfg.borderColor} ${cfg.textColor}`}
              title={`${item.short} (${cfg.label})`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  item.value === 'available'
                    ? 'bg-green-500'
                    : item.value === 'limited'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />
              {item.short}
            </span>
          );
        })}
      </div>
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: localize(station, 'name'),
        text: `${t('station.shareText')} ${localize(station, 'name')}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('station.linkCopied'));
    }
  };

  const handleNavigate = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates[0]},${station.coordinates[1]}`,
      '_blank'
    );
  };

  const handleNotifyToggle = async () => {
    if (!id || !station) return;
    if (isWatchedStation(id)) {
      removeWatchedStation(id);
      toast.success(t('notify.disabled'));
      return;
    }
    if (!('Notification' in window)) {
      toast.error(t('notify.unsupported'));
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      toast.error(t('notify.permissionDenied'));
      return;
    }
    await ensureServiceWorkerForNotifications();
    addWatchedStation({ id, name: localize(station, 'name') });
    await seedLastSeenFromServer(id);
    toast.success(t('notify.enabled'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName) {
      toast.error('Please enter your name');
      return;
    }

    const getFriendlyGeoError = (error: GeolocationPositionError) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          return t('submit.geoPermissionDenied');
        case error.POSITION_UNAVAILABLE:
          return t('submit.geoUnavailable');
        case error.TIMEOUT:
          return t('submit.geoTimeout');
        default:
          return t('submit.locationRequired');
      }
    };

    setIsSubmitting(true);
    try {
      let userLat: number;
      let userLng: number;
      try {
        if (!('geolocation' in navigator)) {
          toast.error(t('submit.geoUnsupported'));
          return;
        }
        if (!window.isSecureContext) {
          toast.error(t('submit.httpsRequired'));
          return;
        }
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 30000,
          });
        });
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
      } catch (geoErr) {
        toast.error(
          geoErr && typeof geoErr === 'object' && 'code' in geoErr
            ? getFriendlyGeoError(geoErr as GeolocationPositionError)
            : t('submit.locationRequired')
        );
        return;
      }

      const response = await fetch(`${API_BASE}/stations/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userLat, userLng }),
      });

      if (response.ok) {
        toast.success(t('submit.success'), {
          icon: <CheckCircle className="w-5 h-5" />,
        });
        setIsUpdating(false);
        // Refresh station data here if needed, or redirect
        navigate('/');
      } else {
        let payload: { code?: string; error?: string } = {};
        try {
          payload = await response.json();
        } catch {
          /* ignore */
        }
        if (payload.code === 'TOO_FAR') {
          toast.error(t('submit.tooFar'));
        } else if (payload.code === 'LOCATION_REQUIRED') {
          toast.error(t('submit.locationRequired'));
        } else {
          toast.error(payload.error || 'Failed to submit update');
        }
      }
    } catch {
      toast.error('Error submitting update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusButton = ({ 
    value, 
    label, 
    fieldName 
  }: { 
    value: FuelStatus | 'not-available'; 
    label: string; 
    fieldName: keyof SubmitUpdateForm;
  }) => {
    const isSelected = formData[fieldName] === value;
    
    return (
      <button
        type="button"
        onClick={() => setFormData({ ...formData, [fieldName]: value })}
        className={`
          px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 border
          ${isSelected 
            ? value === 'available' 
              ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' 
              : value === 'limited'
              ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
              : value === 'out-of-stock'
              ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
              : 'bg-gray-500 text-white border-gray-500 shadow-lg shadow-gray-500/20'
            : theme === 'dark'
              ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {label === 'Available' ? t('status.available') : label === 'Limited' ? t('status.limited') : label === 'Out of Stock' ? t('status.out-of-stock') : label === 'Out' ? t('submit.out') : label === 'N/A' ? t('submit.notAvailable') : label}
      </button>
    );
  };

  const stationName = station?.name || 'Fuel Station';
  const stationCity = station?.address?.split(',').slice(-2).join(',').trim() || 'Sri Lanka';

  return (
    <>
      <SEO
        title={`${stationName} — Fuel Availability`}
        description={`Check real-time fuel availability, queue length, and waiting time at ${stationName} in ${stationCity}. Updated by the community.`}
        url={`/station/${id}`}
      />
    <div className={`h-full overflow-y-auto ${theme === 'dark' ? 'bg-background text-foreground' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} pb-24 transition-colors duration-500 scroll-smooth`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl ${theme === 'dark' ? 'bg-background/80 border-border' : 'bg-white/80 border-gray-200/50'} border-b shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl active:scale-95 transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
            </button>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleNotifyToggle}
                title={alertsOn ? t('notify.disable') : t('notify.enable')}
                aria-pressed={alertsOn}
                className={`p-2 rounded-xl active:scale-95 transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                {alertsOn ? (
                  <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
                ) : (
                  <BellOff className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className={`p-2 rounded-xl active:scale-95 transition-all ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <Share2 className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Station Info Card */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-card/80 border-border' : 'bg-white/80 border-gray-200/50'} border shadow-lg`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 rounded-xl ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <Fuel className={`w-8 h-8 ${statusConfig.textColor}`} />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>{localize(station, 'name')}</h1>
              <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                <MapPin className="w-4 h-4" />
                <span>{localize(station, 'address')}</span>
              </div>
              <div className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.color} text-white shadow-md`}>
                {statusConfig.label}
              </div>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Petrol Queue */}
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-card/40 border-border' : 'bg-blue-50 border-blue-100'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Fuel className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {t('fuel.petrol')} {t('station.queue')}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{station.petrolQueueLength ?? '--'}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-tight">{t('station.vehicles')}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{station.petrolWaitingTime ?? '--'}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-tight">{t('station.mins')} {t('station.waiting')}</p>
                </div>
              </div>
            </div>

            {/* Diesel Queue */}
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-card/20 border-border' : 'bg-orange-50 border-orange-100'} border`}>
              <div className="flex items-center gap-2 mb-2">
                <Fuel className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                  {t('fuel.diesel')} {t('station.queue')}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{station.dieselQueueLength ?? '--'}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-tight">{t('station.vehicles')}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{station.dieselWaitingTime ?? '--'}</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-tight">{t('station.mins')} {t('station.waiting')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            <TrendingUp className="w-4 h-4" />
            <span>{t('station.lastUpdated')} {station.lastUpdated}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleNavigate}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white font-medium shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              {t('station.getDirections')}
            </button>
            <button
              onClick={() => {
                if (!isUpdating) {
                  const trilingualMsg = 
                    "COMMUNITY GUIDELINES:\n" +
                    "1. Please update true details only. One wrong detail affects everyone.\n" +
                    "2. You MUST be within 300m from this particular fuel station to submit an update. This ensures that only those physically present can report fuel and queue status.\n\n" +
                    "ප්‍රජා මාර්ගෝපදේශ:\n" +
                    "1. කරුණාකර නිවැරදි තොරතුරු පමණක් යාවත්කාලීන කරන්න.\n" +
                    "2. යාවත්කාලීන කිරීමක් කිරීමට ඔබ මෙම පිරවුම්හලේ සිට මීටර් 300ක් ඇතුළත සිටිය යුතුය. මෙයින් අදහස් කරන්නේ පෝලිම් සහ ඉන්ධන තොග පිළිබඳ තොරතුරු ලබාදිය හැක්කේ එම ස්ථානයේ සිටින අයට පමණක් බවයි.\n\n" +
                    "சமூக வழிகாட்டுதல்கள்:\n" +
                    "1. தயவுசெய்து துல்லியமான விவரங்களை மட்டுமே பதிவேற்றவும்.\n" +
                    "2. புதுப்பிப்பைச் சமர்ப்பிக்க நீங்கள் இந்த குறிப்பிட்ட எரிபொருள் நிலையத்திலிருந்து 300 மீட்டருக்குள் இருக்க வேண்டும். வரிசை மற்றும் எரிபொருள் விபரங்களை அங்கிருப்பவர்கள் மட்டுமே வழங்க முடியும் என்பதை இது உறுதிப்படுத்துகிறது.";
                  alert(trilingualMsg);
                }
                setIsUpdating(!isUpdating);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 border-2 ${isUpdating ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50'}`}
            >
              {isUpdating ? <X className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
              {isUpdating ? 'Cancel' : t('station.updateStatus')}
            </button>
          </div>

          {/* Inline Update Form */}
          {isUpdating && (
            <form onSubmit={handleSubmit} className={`mt-8 space-y-6 pt-6 border-t ${theme === 'dark' ? 'border-border' : 'border-gray-100'} animate-in slide-in-from-top-4 duration-300`}>
               <h3 className="text-lg font-bold flex items-center gap-2">
                 <PlusCircle className="w-5 h-5 text-blue-500" />
                 Submit Fresh Update
               </h3>

               {/* Your Name */}
               <div className="space-y-3">
                 <Label className="text-sm font-bold flex items-center gap-2">
                   Your Name
                 </Label>
                 <Input
                   type="text"
                   required
                   value={formData.userName}
                   onChange={e => setFormData({ ...formData, userName: e.target.value })}
                   placeholder="Enter your name"
                   className={theme === 'dark' ? 'bg-card border-border' : ''}
                 />
               </div>

               {/* Fuel Stocks */}
               <div className="space-y-4">
                 <Label className="text-sm font-bold">Fuel Availability</Label>
                 <div className="grid gap-4">
                   {['petrol92', 'petrol95', 'autoDiesel', 'superDiesel', 'kerosene'].map((fuel) => (
                     <div key={fuel} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50/50 dark:bg-card/40 border border-gray-100 dark:border-border">
                       <span className="text-xs font-bold uppercase tracking-wider">{t(fuel === 'autoDiesel' ? 'fuel.diesel' : fuel === 'superDiesel' ? 'fuel.superDiesel' : `fuel.${fuel}`)}</span>
                       <div className="flex gap-1.5 flex-wrap">
                         <StatusButton value="available" label="Available" fieldName={fuel as any} />
                         <StatusButton value="limited" label="Limited" fieldName={fuel as any} />
                         <StatusButton value="out-of-stock" label="Out" fieldName={fuel as any} />
                         <StatusButton value="not-available" label="N/A" fieldName={fuel as any} />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

                {/* Petrol Queue */}
                <div className="p-4 rounded-2xl bg-blue-50/30 dark:bg-card/20 border border-blue-100 dark:border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-blue-600 dark:text-foreground">Petrol Queue Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Queue (Vehicles)</Label>
                      <Input 
                        type="number" 
                        value={formData.petrolQueueLength} 
                        onChange={e => setFormData({ ...formData, petrolQueueLength: parseInt(e.target.value) || 0 })}
                        className={theme === 'dark' ? 'bg-card border-border h-9' : 'h-9'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Wait (Minutes)</Label>
                      <Input 
                        type="number" 
                        value={formData.petrolWaitingTime} 
                        onChange={e => setFormData({ ...formData, petrolWaitingTime: parseInt(e.target.value) || 0 })}
                        className={theme === 'dark' ? 'bg-card border-border h-9' : 'h-9'}
                      />
                    </div>
                  </div>
                </div>

                {/* Diesel Queue */}
                <div className="p-4 rounded-2xl bg-orange-50/30 dark:bg-card/20 border border-orange-100 dark:border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600 dark:text-foreground">Diesel Queue Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Queue (Vehicles)</Label>
                      <Input 
                        type="number" 
                        value={formData.dieselQueueLength} 
                        onChange={e => setFormData({ ...formData, dieselQueueLength: parseInt(e.target.value) || 0 })}
                        className={theme === 'dark' ? 'bg-card border-border h-9' : 'h-9'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Wait (Minutes)</Label>
                      <Input 
                        type="number" 
                        value={formData.dieselWaitingTime} 
                        onChange={e => setFormData({ ...formData, dieselWaitingTime: parseInt(e.target.value) || 0 })}
                        className={theme === 'dark' ? 'bg-card border-border h-9' : 'h-9'}
                      />
                    </div>
                  </div>
                </div>

               <div className="space-y-2">
                 <Label className="text-xs font-bold">Additional Message (Optional)</Label>
                 <Textarea 
                   value={formData.message} 
                   onChange={e => setFormData({ ...formData, message: e.target.value })}
                   placeholder="Any more info?"
                   className={theme === 'dark' ? 'bg-card border-border' : ''}
                 />
               </div>

               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
               >
                 {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                 Submit Update Now
               </button>
            </form>
          )}

          {/* Feedback / Report Incorrect Link */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
            <Link 
              to={`/feedback?type=update_station&stationId=${station.id}`}
              className={`text-xs flex items-center gap-1.5 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'}`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Report incorrect information
            </Link>
          </div>
        </div>



        {/* Fuel Availability */}
        <div className={`p-6 rounded-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-card/80 border-border' : 'bg-white/80 border-gray-200/50'} border shadow-sm`}>
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>{t('details.availability')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {station.fuelTypes?.petrol92 && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.petrol92).bgColor} ${getStatusConfig(station.fuelTypes.petrol92).borderColor}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('fuel.petrol92')}</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.petrol92).textColor}`}>
                  {getStatusConfig(station.fuelTypes.petrol92).label}
                </p>
              </div>
            )}
            {station.fuelTypes?.petrol95 && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.petrol95).bgColor} ${getStatusConfig(station.fuelTypes.petrol95).borderColor}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('fuel.petrol95')}</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.petrol95).textColor}`}>
                  {getStatusConfig(station.fuelTypes.petrol95).label}
                </p>
              </div>
            )}
             {station.fuelTypes?.autoDiesel && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.autoDiesel).bgColor} ${getStatusConfig(station.fuelTypes.autoDiesel).borderColor}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('fuel.diesel')}</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.autoDiesel).textColor}`}>
                  {getStatusConfig(station.fuelTypes.autoDiesel).label}
                </p>
              </div>
            )}
            {station.fuelTypes?.superDiesel && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.superDiesel).bgColor} ${getStatusConfig(station.fuelTypes.superDiesel).borderColor}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('fuel.superDiesel')}</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.superDiesel).textColor}`}>
                  {getStatusConfig(station.fuelTypes.superDiesel).label}
                </p>
              </div>
            )}
            {station.fuelTypes?.kerosene && (
              <div className={`p-4 rounded-xl border ${getStatusConfig(station.fuelTypes.kerosene).bgColor} ${getStatusConfig(station.fuelTypes.kerosene).borderColor}`}>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>{t('fuel.kerosene')}</p>
                <p className={`text-lg font-bold ${getStatusConfig(station.fuelTypes.kerosene).textColor}`}>
                  {getStatusConfig(station.fuelTypes.kerosene).label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Updates */}
        <div
          className={`p-6 rounded-2xl backdrop-blur-xl ${
            theme === 'dark' ? 'bg-card/80 border-border' : 'bg-white/80 border-gray-200/50'
          } border shadow-sm`}
        >
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('station.recentUpdates')}
          </h2>
          {stationUpdates.length === 0 ? (
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              No community reports yet.
            </p>
          ) : (
            <div className="space-y-3">
              {stationUpdates.map((update: UserUpdate) => (
                <div
                  key={update.id}
                  className={`p-4 rounded-2xl ${
                    theme === 'dark' ? 'bg-card/40 border-border' : 'bg-gray-50 border-gray-100'
                  } border flex flex-col gap-2`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                        {update.userName}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {(() => {
                          const ts = update.timestamp;
                          if (!(ts instanceof Date)) return '';
                          if (isNaN(ts.getTime())) return '';
                          return format(ts, 'PPpp');
                        })()}
                      </p>
                    </div>

                    <div
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border ${getStatusConfig(update.status).bgColor} ${getStatusConfig(update.status).borderColor} ${getStatusConfig(update.status).textColor}`}
                    >
                      {getStatusConfig(update.status).label}
                    </div>
                  </div>

                  {(() => {
                    return getReportedFuelBadges(update);
                  })()}

                  {update.message ? (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} italic leading-snug`}>
                      "{update.message}"
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}
