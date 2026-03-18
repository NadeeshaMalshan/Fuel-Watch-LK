import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Globe, ChevronRight, CheckCircle2, Home, Settings, MessageSquare, ExternalLink, Code, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast, Toaster } from 'sonner';
import { MapView } from '../components/MapView';
import { fetchFuelStations } from '../services/osmService';
import type { FuelStation } from '../types';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [stations, setStations] = useState<FuelStation[]>([]);

  useEffect(() => {
    fetchFuelStations().then(setStations);
  }, []);

  useEffect(() => {
    fetchFuelStations().then(setStations);
  }, []);

  const languages = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'si', name: 'Sinhala', native: 'සිංහල' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' }
  ] as const;

  return (
    <>
      <Toaster position="top-center" richColors />
      
      <div className={`flex flex-col lg:flex-row h-screen lg:h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white/50 text-gray-900'} transition-colors duration-500`}>
        {/* Settings Side Panel */}
        <aside className={`
          flex flex-col w-full lg:w-[400px] xl:w-[450px] lg:h-full border-r transition-colors duration-500 z-40
          ${theme === 'dark' ? 'bg-[#1a1a1a]/80 backdrop-blur-2xl border-[#2a2a2a]' : 'bg-white/40 backdrop-blur-2xl border-gray-200/50'}
        `}>
          <header className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-5 shrink-0 transition-colors duration-500
            ${theme === 'dark' ? 'bg-[#161616]/90 border-[#2a2a2a]' : 'bg-white/80 border-gray-200/50'}
          `}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-xl transition-all active:scale-95 ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black tracking-tight">{t('settings.title')}</h1>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t('settings.preference')}</p>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Appearance Section */}
              <section className="space-y-4">
                <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('settings.appearance')}
                </h2>
                <div className={`rounded-3xl border overflow-hidden shadow-sm transition-colors duration-500
                  ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100'}
                `}>
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-between p-5 transition-all ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-blue-50 text-blue-600'}`}>
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">{t('settings.darkMode')}</p>
                        <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {theme === 'dark' ? t('settings.enabled') : t('settings.disabled')}
                        </p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </button>
                </div>
              </section>

              {/* Language Section */}
              <section className="space-y-4">
                <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('settings.language')}
                </h2>
                <div className={`rounded-3xl border overflow-hidden shadow-sm divide-y transition-colors duration-500
                  ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 divide-gray-700/50' : 'bg-white border-gray-100 divide-gray-50'}
                `}>
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id);
                        toast.success(`${t('settings.langChanged')} ${lang.name}`);
                      }}
                      className={`w-full flex items-center justify-between p-5 transition-all ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-all duration-500 ${language === lang.id ? (theme === 'dark' ? 'bg-white/10 text-gray-200' : 'bg-blue-50 text-blue-600') : theme === 'dark' ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                          <Globe className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-sm">{lang.native}</p>
                          <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {lang.name}
                          </p>
                        </div>
                      </div>
                      {language === lang.id && (
                        <CheckCircle2 className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-blue-500'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </section>



              {/* About Section */}
              <section className="space-y-4">
                <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {t('settings.about')}
                </h2>
                <div className={`rounded-3xl border overflow-hidden shadow-sm transition-colors duration-500
                  ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100'}
                `}>
                  <button
                    onClick={() => navigate('/about')}
                    className={`w-full flex items-center justify-between p-5 transition-all ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm">Fuel Watch LK</p>
                        <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>About this project</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                  </button>
                </div>
              </section>

              <p className={`text-center text-[10px] font-bold uppercase tracking-[0.3em] py-8 ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`}>
                {t('settings.version')} 1.2.0 (Stable)
              </p>
            </div>
          </div>

          {/* Side Panel Footer Navigation */}
          <div className={`p-4 border-t hidden lg:block transition-colors duration-500 ${theme === 'dark' ? 'bg-[#121212] border-[#2a2a2a]' : 'bg-white/50 border-gray-100'}`}>
            <div className="flex items-center justify-between px-2">
              <Link to="/" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                <Home className="w-5 h-5" />
              </Link>
              <Link to="/settings" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <Settings className="w-5 h-5" />
              </Link>
              <Link to="/feedback" className={`p-3 rounded-2xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                <MessageSquare className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Map Section */}
        <main className={`flex-1 relative h-full hidden lg:block ${theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'}`}>
          <MapView
            stations={stations}
            onStationClick={(station) => navigate(`/station/${station.id}`, { state: { station } })}
            center={[7.8731, 80.7718]}
            zoom={8}
          />
        </main>
      </div>
    </>
  );
}
