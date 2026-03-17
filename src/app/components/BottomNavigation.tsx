import { PlusCircle, Activity, Home, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function BottomNavigation() {
  const location = useLocation();
  const { theme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/submit', icon: PlusCircle, label: 'Submit' },
    { path: '/feed', icon: Activity, label: 'Live Feed' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t shadow-lg lg:hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212]/95 border-[#2a2a2a]' : 'bg-white/90 border-gray-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200
                  ${isActive 
                    ? theme === 'dark' ? 'text-white' : 'text-blue-600'
                    : theme === 'dark' ? 'text-gray-600 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
