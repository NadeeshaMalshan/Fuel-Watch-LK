import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {ArrowLeft, MessageSquare, Send, CheckCircle, MapPin, Plus, AlertCircle} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchFuelStations } from '../services/osmService';
import type { FuelStation } from '../types';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

export function FeedbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, t, localize } = useTheme();
  
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
      }
    }
  }, [initialStationId, stations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback/request', {
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
    <div className={`min-h-screen py-0 lg:py-12 flex justify-center transition-colors duration-500 pb-20 lg:pb-12 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      
      <div className={`flex flex-col w-full max-w-2xl min-h-screen lg:min-h-0 lg:rounded-3xl backdrop-blur-2xl lg:border z-40 shadow-none lg:shadow-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a1a1a]/80 border-[#2a2a2a]' : 'bg-white/60 border-gray-200/50'}`}>
        <header className={`sticky top-0 z-50 backdrop-blur-xl lg:rounded-t-3xl border-b shadow-sm px-4 py-4 shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#161616]/90 border-[#2a2a2a]' : 'bg-white/80 border-gray-200/50'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl active:scale-95 transition-all ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold">{requestType === 'add_station' ? 'Report Missing Station' : 'Request Station Update'}</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tell us about changes or missing fuel stations</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full p-4 lg:p-6">
          <div className="space-y-6">
            {/* Request Type Selection */}
            {!initialStationId && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType('add_station')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${requestType === 'add_station' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800/10 hover:border-blue-500/30'}`}
                >
                  <Plus className={`w-6 h-6 ${requestType === 'add_station' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold">Missing Station</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRequestType('update_station')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${requestType === 'update_station' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800/10 hover:border-blue-500/30'}`}
                >
                  <AlertCircle className={`w-6 h-6 ${requestType === 'update_station' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-semibold">Update Station</span>
                </button>
              </div>
            )}

            {/* Form Section - Unified for Add and Update */}
            {requestType === 'add_station' || (requestType === 'update_station' && initialStationId) ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className={`p-5 rounded-2xl border shadow-sm space-y-6 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                  
                  {/* Context Header for Update Request */}
                  {requestType === 'update_station' && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold">Proposing changes for:</p>
                        <p className="text-xs opacity-70 italic truncate">
                          {stations.find(s => s.id === initialStationId)?.name || 'Selected Station'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Station Name (English)</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="e.g. CEYPETCO - Colombo 07" 
                        required 
                        className={theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : ''}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Latitude</Label>
                        <Input 
                          type="number" 
                          step="0.000001" 
                          value={formData.lat} 
                          onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})} 
                          required 
                          className={theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Longitude</Label>
                        <Input 
                          type="number" 
                          step="0.000001" 
                          value={formData.lng} 
                          onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})} 
                          required 
                          className={theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : ''}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Station Code (Optional)</Label>
                      <Input 
                        value={formData.stationCode} 
                        onChange={e => setFormData({...formData, stationCode: e.target.value})} 
                        placeholder="e.g. CP-001 or W- Colombo 10" 
                        className={theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider opacity-60">Full Address</Label>
                      <Input 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        placeholder="No. 123, Main Street, City" 
                        required 
                        className={theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : ''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider opacity-60">
                        {requestType === 'add_station' ? 'Additional Info' : 'Describe what\'s wrong'}
                      </Label>
                      <Textarea 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                        placeholder={requestType === 'add_station' ? 'Anything else to share?' : 'Please tell us what exactly is incorrect...'}
                        rows={4}
                        required={requestType === 'update_station'}
                        className={theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : ''}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-7 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98] ${
                    isSubmitting 
                      ? 'bg-gray-400 opacity-50 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {requestType === 'add_station' ? <Send className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      {requestType === 'add_station' ? 'Submit New Station' : 'Request Official Update'}
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              /* Notice for Selection required */
              <div className="space-y-6">
                <div className={`p-8 rounded-2xl border space-y-4 text-center ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-500/5">
                    <AlertCircle className="w-7 h-7 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-black text-xl">Select a Station First</h3>
                    <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      To request corrections for an existing station, please find it on the map or list and click the **"Report incorrect information"** link.
                    </p>
                    <div className={`p-4 rounded-xl text-left space-y-2 inline-block mx-auto ${theme === 'dark' ? 'bg-black/20' : 'bg-white/50'}`}>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">How to do it:</p>
                      <ul className={`text-[11px] font-medium space-y-2 list-none ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <li className="flex items-center gap-2 decoration-blue-500/30 underline underline-offset-4 decoration-dashed">
                          <span className="w-1 h-1 rounded-full bg-blue-500" /> Go to the <strong className="text-blue-500">Home Page</strong>
                        </li>
                        <li className="flex items-center gap-2 decoration-blue-500/30 underline underline-offset-4 decoration-dashed">
                          <span className="w-1 h-1 rounded-full bg-blue-500" /> Select a fuel station
                        </li>
                        <li className="flex items-center gap-2 decoration-blue-500/30 underline underline-offset-4 decoration-dashed">
                          <span className="w-1 h-1 rounded-full bg-blue-500" /> Click <strong className="text-blue-500">"Report incorrect information"</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <Button 
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold mt-4"
                    onClick={() => navigate('/')}
                  >
                    Return to Map
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
