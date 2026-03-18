import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {ArrowLeft, Send, CheckCircle, MapPin, Plus, AlertCircle} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchFuelStations } from '../services/osmService';
import { API_BASE } from '../services/api';
import type { FuelStation } from '../types';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { MapView } from '../components/MapView';
import { Locate } from 'lucide-react';

export function FeedbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [requestType, setRequestType] = useState<'add_station' | 'update_station'>(
    (searchParams.get('type') as any) || 'add_station'
  );
  
  const initialStationId = searchParams.get('stationId') || '';

  const [formData, setFormData] = useState({
    stationId: initialStationId,
    name: '',
    nameSi: '',
    nameTa: '',
    address: '',
    addressSi: '',
    addressTa: '',
    lat: 7.8731, // Default SL center
    lng: 80.7718,
    stationCode: '',
    message: ''
  });

  const [isSelectingFromMap, setIsSelectingFromMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([7.8731, 80.7718]);
  const [mapZoom, setMapZoom] = useState(8);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const mobileMapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchFuelStations().then(setStations);
  }, []);

  useEffect(() => {
    if (initialStationId && stations.length > 0) {
      const station = stations.find(s => s.id === initialStationId);
      if (station) {
        setRequestType('update_station');
        setFormData(prev => ({
          ...prev,
          stationId: station.id,
          name: station.name || '',
          nameSi: station.nameSi || '',
          nameTa: station.nameTa || '',
          address: station.address || '',
          addressSi: station.addressSi || '',
          addressTa: station.addressTa || '',
          lat: station.coordinates[0],
          lng: station.coordinates[1],
          stationCode: station.stationCode || ''
        }));
        setMapCenter(station.coordinates);
        setMapZoom(17);
      }
    }
  }, [initialStationId, stations]);

  const handleLocationSelect = (lat: number, lng: number) => {
    if (isSelectingFromMap) {
      setFormData(prev => ({ ...prev, lat, lng }));
      setIsSelectingFromMap(false);
      toast.success('Location selected from map!');
    }
  };

  useEffect(() => {
    if (!isSelectingFromMap) return;
    // Mobile-only UX: bring the expanded map into view.
    // Use rAF so the DOM has applied the expanded height first.
    requestAnimationFrame(() => {
      mobileMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isSelectingFromMap]);

  const handleManualLocationChange = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: numValue || 0 }));
    
    // Only update map if we have valid-ish coordinates
    if (!isNaN(numValue) && numValue > 0) {
      const newLat = field === 'lat' ? numValue : formData.lat;
      const newLng = field === 'lng' ? numValue : formData.lng;
      setMapCenter([newLat, newLng]);
      setMapZoom(17);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/feedback/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: requestType
        })
      });

      if (response.ok) {
        toast.success('Request submitted successfully!', {
          description: 'Our admins will review your request soon.',
          icon: <CheckCircle className="w-5 h-5" />
        });
        navigate(-1);
      } else {
        toast.error('Failed to submit request');
      }
    } catch (error) {
      toast.error('Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-[#f8fafc]'}`}>
      
      {/* Form Section */}
      <div className={`flex flex-col w-full lg:w-[500px] xl:w-[550px] lg:h-screen overflow-hidden border-r shadow-2xl z-50 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]' : 'bg-white border-gray-100'}`}>
        <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-5 shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a1a1a]/90 border-[#2a2a2a]' : 'bg-white/80 border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`p-2.5 rounded-2xl active:scale-95 transition-all ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight">{requestType === 'add_station' ? 'Report Missing Station' : 'Request Station Update'}</h1>
              <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Community Contribution</p>
            </div>
          </div>
        </header>

        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto w-full px-6 py-8">
          <div className="max-w-xl mx-auto space-y-8">
            {/* Request Type Selection */}
            {!initialStationId && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType('add_station')}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${requestType === 'add_station' ? 'border-blue-600 bg-blue-600/5' : 'border-gray-500/10 hover:border-blue-600/30'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${requestType === 'add_station' ? 'bg-blue-600 text-white' : 'bg-gray-500/10 text-gray-400'}`}>
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${requestType === 'add_station' ? 'text-blue-600' : 'text-gray-400'}`}>New Station</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('update_station')}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 text-center ${requestType === 'update_station' ? 'border-blue-600 bg-blue-600/5' : 'border-gray-500/10 hover:border-blue-600/30'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${requestType === 'update_station' ? 'bg-blue-600 text-white' : 'bg-gray-500/10 text-gray-400'}`}>
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${requestType === 'update_station' ? 'text-blue-600' : 'text-gray-400'}`}>Update Info</span>
                </button>
              </div>
            )}

            {/* Form Section */}
            {requestType === 'add_station' || (requestType === 'update_station' && initialStationId) ? (
              <form onSubmit={handleSubmit} className="space-y-8 pb-20">
                <div className="space-y-6">
                  {requestType === 'update_station' && (
                    <div className="flex items-center gap-4 p-5 rounded-3xl bg-blue-600/10 border border-blue-600/20">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-70 mb-0.5">Editing Station</p>
                        <p className="text-sm font-bold truncate">
                          {stations.find(s => s.id === initialStationId)?.name || 'Selected Station'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Station Name</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="e.g. CEYPETCO - Colombo 07" 
                        required 
                        className={`h-14 px-5 rounded-2xl border-2 transition-all hover:bg-white/5 focus:ring-0 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Location Coordinates</Label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSelectingFromMap(true);
                            toast.info('Click anywhere on the map to pick the location');
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelectingFromMap ? 'bg-blue-600 text-white' : 'bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {isSelectingFromMap ? 'Selecting...' : 'Select from Map'}
                        </button>
                      </div>

                      {/* Mobile Map Picker (expands above the form content) */}
                      <div ref={mobileMapRef} className="lg:hidden">
                        <div
                          className={`
                            w-full overflow-hidden rounded-3xl border transition-all duration-300
                            ${isSelectingFromMap ? 'max-h-[44vh] opacity-100' : 'max-h-0 opacity-0 border-transparent'}
                            ${theme === 'dark' ? 'bg-[#0f0f0f] border-[#2a2a2a]' : 'bg-white border-gray-200/70'}
                          `}
                        >
                          <div className="relative h-[44vh]">
                            <MapView
                              stations={stations}
                              onStationClick={() => {}}
                              center={mapCenter}
                              zoom={mapZoom}
                              selectedLocation={[formData.lat, formData.lng]}
                              onLocationSelect={handleLocationSelect}
                              variant="select"
                              className="w-full h-full"
                            />

                            {/* Instruction Overlay */}
                            <div className="absolute top-3 left-3 right-3 z-[6001]">
                              <div className={`px-4 py-3 rounded-3xl backdrop-blur-2xl border shadow-xl flex items-center gap-3 ${theme === 'dark' ? 'bg-[#1a1a1a]/90 border-blue-500/30 text-white' : 'bg-white/90 border-blue-200/60 text-gray-900'}`}>
                                <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                                  <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black uppercase tracking-widest">Tap map to pick location</p>
                                  <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsSelectingFromMap(false)}
                                  className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Input 
                            type="number" 
                            step="0.000001" 
                            value={formData.lat} 
                            onChange={e => handleManualLocationChange('lat', e.target.value)} 
                            placeholder="Latitude"
                            required 
                            className={`h-14 px-5 rounded-2xl border-2 transition-all hover:bg-white/5 focus:ring-0 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Input 
                            type="number" 
                            step="0.000001" 
                            value={formData.lng} 
                            onChange={e => handleManualLocationChange('lng', e.target.value)} 
                            placeholder="Longitude"
                            required 
                            className={`h-14 px-5 rounded-2xl border-2 transition-all hover:bg-white/5 focus:ring-0 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Full Address</Label>
                      <Input 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder="No. 123, Main Street, City" 
                        required 
                        className={`h-14 px-5 rounded-2xl border-2 transition-all hover:bg-white/5 focus:ring-0 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
                        {requestType === 'add_station' ? 'Additional Info' : 'Details of Error'}
                      </Label>
                      <Textarea 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                        placeholder={requestType === 'add_station' ? 'e.g. Operating hours, current queue status...' : 'Please describe exactly what needs correction...'}
                        rows={4}
                        required={requestType === 'update_station'}
                        className={`px-5 py-4 rounded-2xl border-2 transition-all hover:bg-white/5 focus:ring-0 resize-none ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-8 rounded-3xl font-black text-lg transition-all active:scale-[0.98] ${
                      isSubmitting 
                        ? 'bg-gray-400 opacity-50' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xl shadow-blue-600/40'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        SUBMITTING...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {requestType === 'add_station' ? <Send className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                        {requestType === 'add_station' ? 'SUBMIT STATION' : 'REQUEST UPDATE'}
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Notice for Selection required */
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-600 shadow-inner">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black">Select a Station First</h3>
                  <p className={`text-sm leading-relaxed max-w-xs mx-auto ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    To propose corrections, please find the station on the home map and click <strong>"Report incorrect information"</strong>.
                  </p>
                </div>
                <Button 
                  className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold"
                  onClick={() => navigate('/')}
                >
                  Return to Home Map
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden hidden lg:block">
        <div className="absolute inset-0 z-0">
          <MapView
            stations={stations}
            onStationClick={() => {}}
            center={mapCenter}
            zoom={mapZoom}
            selectedLocation={[formData.lat, formData.lng]}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Floating Overlay for selection instructions */}
        {isSelectingFromMap && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={`px-8 py-4 rounded-3xl backdrop-blur-3xl border shadow-2xl flex items-center gap-4 ${theme === 'dark' ? 'bg-[#1a1a1a]/95 border-blue-500/50' : 'bg-white/95 border-blue-200'}`}>
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white animate-pulse">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black">PICK LOCATION FROM MAP</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider opacity-60 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Click anywhere to set coordinates</p>
              </div>
              <button 
                onClick={() => setIsSelectingFromMap(false)}
                className="ml-4 p-2 rounded-xl hover:bg-gray-500/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </div>
        )}

        {/* Map Legend/Status Overlay */}
        <div className="absolute bottom-10 right-10 z-50">
           <div className={`p-6 rounded-[2.5rem] backdrop-blur-3xl border shadow-2xl space-y-4 ${theme === 'dark' ? 'bg-[#1a1a1a]/95 border-[#2a2a2a]' : 'bg-white/95 border-white/50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-500/10 flex items-center justify-center">
                   <Locate className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Previewing</p>
                  <p className="text-sm font-black">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
