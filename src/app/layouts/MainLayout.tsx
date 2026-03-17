import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation } from '../components/BottomNavigation';

export function MainLayout() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col pb-20 lg:pb-0 overflow-hidden">
      <Outlet />
      <BottomNavigation />
    </div>
  );
}
