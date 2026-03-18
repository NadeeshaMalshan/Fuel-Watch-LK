import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './routes';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <Toaster position="top-center" richColors />
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  );
}
