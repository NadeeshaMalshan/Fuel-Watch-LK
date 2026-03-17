import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { mockStations } from '../data/mockData';
import { FuelStatus, SubmitUpdateForm } from '../types';
import { toast } from 'sonner';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export function SubmitUpdatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="font-semibold text-gray-900">Submit Update</h1>
              <p className="text-sm text-gray-500">Help the community with real-time info</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Station */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-sm">
            <Label htmlFor="station" className="text-sm font-semibold text-gray-900 mb-2 block">
              Select Fuel Station *
            </Label>
            <select
              id="station"
              required
              value={formData.stationId}
              onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-900"
            >
              <option value="">Choose a station...</option>
              {mockStations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.address}
                </option>
              ))}
            </select>
          </div>

          {/* Your Name */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-sm">
            <Label htmlFor="userName" className="text-sm font-semibold text-gray-900 mb-2 block">
              Your Name *
            </Label>
            <Input
              id="userName"
              type="text"
              required
              placeholder="e.g., Kamal Silva"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Overall Status */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-sm">
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">
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
            <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-sm">
              <Label htmlFor="queue" className="text-sm font-semibold text-gray-900 mb-2 block">
                Queue Length (vehicles)
              </Label>
              <Input
                id="queue"
                type="number"
                min="0"
                value={formData.queueLength}
                onChange={(e) => setFormData({ ...formData, queueLength: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-sm">
              <Label htmlFor="wait" className="text-sm font-semibold text-gray-900 mb-2 block">
                Waiting Time (minutes)
              </Label>
              <Input
                id="wait"
                type="number"
                min="0"
                value={formData.waitingTime}
                onChange={(e) => setFormData({ ...formData, waitingTime: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
          </div>

          {/* Fuel Types */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Fuel Type Availability</h3>
            
            {/* Petrol 92 */}
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">Petrol 92</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="petrol92" />
                <StatusButton value="limited" label="Limited" fieldName="petrol92" />
                <StatusButton value="out-of-stock" label="Out" fieldName="petrol92" />
                <StatusButton value="not-available" label="N/A" fieldName="petrol92" />
              </div>
            </div>

            {/* Petrol 95 */}
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">Petrol 95</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="petrol95" />
                <StatusButton value="limited" label="Limited" fieldName="petrol95" />
                <StatusButton value="out-of-stock" label="Out" fieldName="petrol95" />
                <StatusButton value="not-available" label="N/A" fieldName="petrol95" />
              </div>
            </div>

            {/* Diesel */}
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">Diesel</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="diesel" />
                <StatusButton value="limited" label="Limited" fieldName="diesel" />
                <StatusButton value="out-of-stock" label="Out" fieldName="diesel" />
                <StatusButton value="not-available" label="N/A" fieldName="diesel" />
              </div>
            </div>

            {/* Kerosene */}
            <div>
              <Label className="text-sm text-gray-700 mb-2 block">Kerosene</Label>
              <div className="flex gap-2 flex-wrap">
                <StatusButton value="available" label="Available" fieldName="kerosene" />
                <StatusButton value="limited" label="Limited" fieldName="kerosene" />
                <StatusButton value="out-of-stock" label="Out" fieldName="kerosene" />
                <StatusButton value="not-available" label="N/A" fieldName="kerosene" />
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-sm">
            <Label htmlFor="message" className="text-sm font-semibold text-gray-900 mb-2 block">
              Additional Information (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="e.g., Queue moving fast, diesel finishing soon..."
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full"
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
  );
}
