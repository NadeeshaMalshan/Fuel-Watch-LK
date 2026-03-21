import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './routes';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';
import { StationWatchNotifier } from './components/StationWatchNotifier';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Toaster position="top-center" richColors />
        <StationWatchNotifier />
        <PwaInstallPrompt />
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  );
}
