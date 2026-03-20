import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowLeft, MapPin, Navigation, Share2, Fuel, TrendingUp, AlertCircle, Send, CheckCircle, X, PlusCircle, User, Clock, MessageSquare } from 'lucide-react';
// import { fetchFuelStations } from '../services/osmService';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import type { FuelStation, UserUpdate, FuelStatus, SubmitUpdateForm } from '../types';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../services/api';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

interface RecentUpdate {
  id: number;
  stationId: number;
  userName: string | null;
  message: string | null;
  status: string | null;
  petrol92: string | null;
  petrol95: string | null;
  autoDiesel: string | null;
  superDiesel: string | null;
  kerosene: string | null;
  timestamp: string | null;
}

export function StationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, t, localize } = useTheme();
  
  const [station] = useState<FuelStation | null>((location.state?.station as FuelStation) || null);
  const [stationUpdates] = useState<UserUpdate[]>([]);
  const [isLoading] = useState(!station);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);

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
  

  // Fetch last 5 updates
  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/stations/${id}/recent-updates`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setRecentUpdates(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName) {
      toast.error('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/stations/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(t('submit.success'), {
          icon: <CheckCircle className="w-5 h-5" />,
        });
        setIsUpdating(false);
        // Refresh station data here if needed, or redirect
        navigate('/');
      } else {
        toast.error('Failed to submit update');
      }
    } catch (error) {
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
                    "Please update true details only. One wrong detail can affect everyone because all data is from the community.\n\n" +
                    "කරුණාකර නිවැරදි තොරතුරු පමණක් යාවත්කාලීන කරන්න. එක් වැරදි විස්තරයක් හෝ සැමට බලපෑ හැකිය, මන්ද සියලුම දත්ත ප්රජාවෙන් ලබාගත් ඒවා බැවිනි.\n\n" +
                    "தயவுசெய்து துல்லியமான விவரங்களை மட்டுமே பதிவேற்றவும். அனைத்து தரவுகளும் சமூகத்திலிருந்து பெறப்படுவதால், ஒரு தவறான விவரம் கூட அனைவரையும் பாதிக்கக்கூடும்.";
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

        {/* Recent Reports */}
        {recentUpdates.length > 0 && (
          <div className={`p-6 rounded-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-card/80 border-border' : 'bg-white/80 border-gray-200/50'} border shadow-sm`}>
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
              <User className="w-5 h-5 text-blue-500" />
              Recent Reports
              <span className={`ml-auto text-xs font-normal px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-card text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                Last {recentUpdates.length}
              </span>
            </h2>

            <div className="space-y-3">
              {recentUpdates.map((update, index) => {
                const fuelLabels: { key: keyof RecentUpdate; label: string }[] = [
                  { key: 'petrol92', label: 'Petrol 92' },
                  { key: 'petrol95', label: 'Petrol 95' },
                  { key: 'autoDiesel', label: 'Auto Diesel' },
                  { key: 'superDiesel', label: 'Super Diesel' },
                  { key: 'kerosene', label: 'Kerosene' },
                ];
                const reported = fuelLabels.filter(f => update[f.key] && update[f.key] !== 'not-available');

                return (
                  <div key={update.id} className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-card/40 border-border' : 'bg-gray-50 border-gray-100'} space-y-2.5`}>
                    {/* Name, badge & time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
                          ${index === 0
                            ? theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                            : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                          }`}>
                          {update.userName ? update.userName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {update.userName || 'Anonymous'}
                          </span>
                          {index === 0 && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                      </div>
                      {update.timestamp && (
                        <div className={`flex items-center gap-1 text-xs flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <Clock className="w-3 h-3" />
                          <span title={format(new Date(update.timestamp), 'PPpp')}>
                            {formatDistanceToNow(new Date(update.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Fuel status badges */}
                    {reported.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {reported.map(({ key, label }) => {
                          const cfg = getStatusConfig(update[key] as string);
                          return (
                            <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${cfg.bgColor} ${cfg.borderColor} ${cfg.textColor}`}>
                              <Fuel className="w-2.5 h-2.5" />
                              {label}: {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Message */}
                    {update.message && (
                      <div className={`flex items-start gap-2 pt-1 border-t ${theme === 'dark' ? 'border-border' : 'border-gray-200'}`}>
                        <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-xs italic ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          "{update.message}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Updates */}
        {stationUpdates.length > 0 && (
          <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('station.recentUpdates')}</h2>
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
    </>
  );
}
