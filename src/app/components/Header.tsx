import { MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-4">
          {/* Title and Location */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-gray-900 text-lg">Fuel Tracker</h1>
              <p className="text-sm text-gray-500">Real-time fuel availability</p>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <Select defaultValue="ratnapura">
                <SelectTrigger className="w-[140px] h-9 bg-white/80 border-gray-200 focus:ring-2 focus:ring-blue-400">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ratnapura">Ratnapura</SelectItem>
                  <SelectItem value="colombo">Colombo</SelectItem>
                  <SelectItem value="kandy">Kandy</SelectItem>
                  <SelectItem value="galle">Galle</SelectItem>
                  <SelectItem value="jaffna">Jaffna</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
