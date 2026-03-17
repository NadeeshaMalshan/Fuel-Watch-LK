import { Fuel } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

type FuelType = 'all' | 'petrol92' | 'petrol95' | 'diesel' | 'kerosene';

interface FilterChipsProps {
  onFilterChange: (filter: FuelType) => void;
}

export function FilterChips({ onFilterChange }: FilterChipsProps) {
  const [activeFilter, setActiveFilter] = useState<FuelType>('all');
  const { theme } = useTheme();

  const filters = [
    { id: 'all', label: 'All Stations', icon: Fuel },
    { id: 'petrol92', label: 'Petrol 92', icon: Fuel },
    { id: 'petrol95', label: 'Petrol 95', icon: Fuel },
    { id: 'diesel', label: 'Diesel', icon: Fuel },
    { id: 'kerosene', label: 'Kerosene', icon: Fuel },
  ];

  const handleFilterClick = (filterId: FuelType) => {
    setActiveFilter(filterId);
    onFilterChange(filterId);
  };

  return (
    <div className={`sticky top-[152px] z-40 w-full backdrop-blur-xl border-b py-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212]/90 border-[#2a2a2a]' : 'bg-white/60 border-gray-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id as FuelType)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0
                  ${isActive 
                    ? theme === 'dark' ? 'bg-white/15 text-white border border-white/10 shadow-lg' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : theme === 'dark'
                      ? 'bg-[#1e1e1e] text-gray-400 border border-[#2a2a2a] hover:border-[#444] hover:bg-[#242424] active:scale-95'
                      : 'bg-white/80 text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}