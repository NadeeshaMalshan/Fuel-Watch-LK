import { Fuel, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

type FuelType = 'all' | 'petrol92' | 'petrol95' | 'autoDiesel' | 'superDiesel' | 'kerosene';

interface FilterChipsProps {
  onFilterChange: (filter: FuelType) => void;
  variant?: 'panel' | 'overlay';
  className?: string;
}

export function FilterChips({ onFilterChange, variant = 'panel', className }: FilterChipsProps) {
  const [activeFilter, setActiveFilter] = useState<FuelType>('all');
  const { theme, t } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filters = [
    { id: 'all', label: t('filter.all'), icon: Fuel },
    { id: 'petrol92', label: t('fuel.petrol92'), icon: Fuel },
    { id: 'petrol95', label: t('fuel.petrol95'), icon: Fuel },
    { id: 'autoDiesel', label: t('fuel.diesel'), icon: Fuel },
    { id: 'superDiesel', label: t('fuel.superDiesel'), icon: Fuel },
    { id: 'kerosene', label: t('fuel.kerosene'), icon: Fuel },
  ];

  const handleFilterClick = (filterId: FuelType) => {
    setActiveFilter(filterId);
    onFilterChange(filterId);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -160 : 160, behavior: 'smooth' });
    }
  };

  const chipsBtnClass = `p-1.5 rounded-full shrink-0 transition-all active:scale-90 ${
    theme === 'dark'
      ? 'bg-[#1e1e1e] border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#444]'
      : 'bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 shadow-sm'
  }`;

  const chips = (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <button onClick={() => scroll('left')} className={`hidden sm:flex ${chipsBtnClass}`} aria-label="Scroll left">
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth flex-1">
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
                  ? theme === 'dark' ? 'bg-blue-600 text-white border border-blue-500/40 shadow-lg shadow-blue-900/40' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
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

      <button onClick={() => scroll('right')} className={`hidden sm:flex ${chipsBtnClass}`} aria-label="Scroll right">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  if (variant === 'overlay') return chips;

  return (
    <div className={`sticky top-[152px] z-40 w-full backdrop-blur-xl border-b py-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212]/90 border-[#2a2a2a]' : 'bg-white/60 border-gray-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {chips}
      </div>
    </div>
  );
}