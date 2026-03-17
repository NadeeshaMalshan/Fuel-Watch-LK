import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, Home, PlusCircle, Activity, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchFuelStations } from '../services/osmService';
import type { FuelStation, FuelStatus, SubmitUpdateForm } from '../types';
import { toast } from 'sonner';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { MapView } from '../components/MapView';

export function SubmitUpdatePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [formData, setFormData] = useState<SubmitUpdateForm>({
    stationId: '',
    userName: '',
    status: 'available',
    queueLength: 0,
    waitingTime: 0,
    petrol92: 'not-available',
    petrol95: 'not-available',
    diesel: 'not-available',
    kerosene: 'not-available',
    message: '',
  });

  useEffect(() => {
    fetchFuelStations().then(setStations);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stationId || !formData.userName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Update submitted successfully!', {
      description: 'Thank you for helping the community!',
      icon: <CheckCircle className="w-5 h-5" />,
    });

    setIsSubmitting(false);
    navigate('/feed');
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
          px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
          ${isSelected 
            ? value === 'available' 
              ? 'bg-green-500 text-white border-green-500' 
              : value === 'limited'
              ? 'bg-amber-500 text-white border-amber-500'
              : value === 'out-of-stock'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-gray-500 text-white border-gray-500'
            : theme === 'dark'
              ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={`flex flex-col lg:flex-row h-screen lg:h-screen overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      
      {/* Left Panel - Contains Form */}
      <aside className={`flex flex-col w-full lg:w-[400px] xl:w-[450px] lg:h-full backdrop-blur-2xl border-r z-40 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1a1a1a]/80 border-[#2a2a2a]' : 'bg-white/40 backdrop-blur-2xl border-gray-200/50'}`}>
        <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm px-4 py-4 shrink-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#161616]/90 border-[#2a2a2a]' : 'bg-white/80 border-gray-200/50'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-xl active:scale-95 transition-all ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className={`font-semibold transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Submit Update</h1>
              <p className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Help the community with real-time info</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full">
          <main className="px-4 py-6 w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Station */}
          <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
            <Label htmlFor="station" className={`text-sm font-semibold mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
              Select Fuel Station *
            </Label>
            <select
              id="station"
              required
              value={formData.stationId}
              onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="">Choose a station...</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.address}
                </option>
              ))}
            </select>
          </div>

          {/* Your Name */}
          <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
            <Label htmlFor="userName" className={`text-sm font-semibold mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
              Your Name *
            </Label>
            <Input
              id="userName"
              type="text"
              required
              placeholder="e.g., Kamal Silva"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className={`w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-600' : ''}`}
            />
          </div>

          {/* Overall Status */}
          <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
            <Label className={`text-sm font-semibold mb-3 block transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
              Overall Station Status *
            </Label>
            <div className="flex gap-2 flex-wrap">
              <StatusButton value="available" label="Available" fieldName="status" />
              <StatusButton value="limited" label="Limited" fieldName="status" />
              <StatusButton value="out-of-stock" label="Out of Stock" fieldName="status" />
            </div>
          </div>

          {/* Queue & Wait Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
              <Label htmlFor="queue" className={`text-sm font-semibold mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                Queue Length (vehicles)
              </Label>
              <Input
                id="queue"
                type="number"
                min="0"
                value={formData.queueLength}
                onChange={(e) => setFormData({ ...formData, queueLength: parseInt(e.target.value) || 0 })}
                className={`w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              />
            </div>
            <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
              <Label htmlFor="wait" className={`text-sm font-semibold mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                Waiting Time (minutes)
              </Label>
              <Input
                id="wait"
                type="number"
                min="0"
                value={formData.waitingTime}
                onChange={(e) => setFormData({ ...formData, waitingTime: parseInt(e.target.value) || 0 })}
                className={`w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
              />
            </div>
          </div>

          {/* Fuel Types */}
          <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm space-y-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
            <h3 className={`text-sm font-semibold transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Fuel Type Availability</h3>
            
            {/* Petrol 92 */}
            <div>
              <Label className={`text-sm mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Petrol 92</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="petrol92" />
                <StatusButton value="limited" label="Limited" fieldName="petrol92" />
                <StatusButton value="out-of-stock" label="Out" fieldName="petrol92" />
                <StatusButton value="not-available" label="N/A" fieldName="petrol92" />
              </div>
            </div>

            {/* Petrol 95 */}
            <div>
              <Label className={`text-sm mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Petrol 95</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="petrol95" />
                <StatusButton value="limited" label="Limited" fieldName="petrol95" />
                <StatusButton value="out-of-stock" label="Out" fieldName="petrol95" />
                <StatusButton value="not-available" label="N/A" fieldName="petrol95" />
              </div>
            </div>

            {/* Diesel */}
            <div>
              <Label className={`text-sm mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Diesel</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="diesel" />
                <StatusButton value="limited" label="Limited" fieldName="diesel" />
                <StatusButton value="out-of-stock" label="Out" fieldName="diesel" />
                <StatusButton value="not-available" label="N/A" fieldName="diesel" />
              </div>
            </div>

            {/* Kerosene */}
            <div>
              <Label className={`text-sm mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Kerosene</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="kerosene" />
                <StatusButton value="limited" label="Limited" fieldName="kerosene" />
                <StatusButton value="out-of-stock" label="Out" fieldName="kerosene" />
                <StatusButton value="not-available" label="N/A" fieldName="kerosene" />
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className={`p-5 rounded-2xl backdrop-blur-xl border shadow-sm transition-colors duration-500 ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
            <Label htmlFor="message" className={`text-sm font-semibold mb-2 block transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
              Additional Information (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="e.g., Queue moving fast, diesel finishing soon..."
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`w-full ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-600' : ''}`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] text-white font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Update
              </>
            )}
          </button>
        </form>
          </main>
        </div>
        
        {/* Desktop Side Panel Footer - Integrated Navigation */}
        <div className={`p-4 border-t hidden lg:block shrink-0 mt-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white/50 border-gray-100'}`}>
          <div className="flex items-center justify-between px-2">
            <Link to="/" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
              <Home className="w-5 h-5" />
            </Link>
            <Link to="/submit" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
              <PlusCircle className="w-5 h-5" />
            </Link>
            <Link to="/feed" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
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
