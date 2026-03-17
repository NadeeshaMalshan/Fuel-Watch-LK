import { Outlet } from 'react-router';
import { BottomNavigation } from '../components/BottomNavigation';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col pb-20">
      <Outlet />
      <BottomNavigation />
    </div>
  );
}
