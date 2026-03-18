import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, Globe, Users, Clock, MapPin, Heart, Github, ExternalLink, Code } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const aboutContent = {
  en: {
    title: 'About Fuel Watch LK',
    subtitle: 'Real-time Fuel Availability & Queue Tracker for Sri Lanka',
    description:
      'Fuel Watch LK is a community-powered platform designed to help citizens of Sri Lanka find fuel stations with available stock and minimal queues. During fuel shortages or high-demand periods, this tool provides real-time updates sourced directly from the public.',
    mission: 'Our Mission',
    missionText:
      'To provide accurate, timely, and community-sourced fuel availability information across Sri Lanka — reducing wasted time and helping people plan their journeys efficiently.',
    features: 'Key Features',
    featureList: [
      'Real-time fuel availability at stations island-wide',
      'Live queue length and estimated waiting time',
      'Community-submitted status updates',
      'Interactive map view of fuel stations',
      'Support for Petrol 92, Petrol 95, Diesel & more',
      'Available in English, Sinhala, and Tamil',
    ],
    developedBy: 'Developed By',
    version: 'Version',
    openSource: 'Open Source',
    openSourceText: 'This project is open source and community-driven.',
  },
  si: {
    title: 'Fuel Watch LK ගැන',
    subtitle: 'ශ්‍රී ලංකාවේ ඉන්ධන ලබා ගත හැකි බව සජීවීව දැනගන්න',
    description:
      'Fuel Watch LK යනු ශ්‍රී ලංකාවේ ජනතාවට ඉන්ධන ඇති පිරවුම්හල් සහ අඩු පෝලිම් ඇති ස්ථාන සොයා ගැනීමට උදවු කිරීම සඳහා ප්‍රජා බලයෙන් ගොඩනැඟූ වේදිකාවකි. ඉන්ධන හිඟකම් හෝ ඉහළ ඉල්ලුම් කාල පරිච්ඡේද තුළ, මෙම මෙවලම ජනතාව විසින්ම සජීවීව ලබා දෙන යාවත්කාලීන තොරතුරු ලබා දෙයි.',
    mission: 'අපේ අරමුණ',
    missionText:
      'ශ්‍රී ලංකාව පුරා නිවැරදි, කාලෝචිත, ප්‍රජා-ප්‍රභවය ඉන්ධන ලබා ගැනීම් තොරතුරු ලබා දීම — නාස්ති වන කාලය අඩු කිරීම සහ ජනතාවට ඔවුන්ගේ ගමන් ඵලදායිව සැලසුම් කිරීමට උදව් කිරීම.',
    features: 'ප්‍රධාන විශේෂාංග',
    featureList: [
      'දිවයිනේ ස්ථාන නොයෙකුත් ස්ථානවල සජීවී ඉන්ධන ලබා ගත හැකි බව',
      'ජීවී පෝලිම් දිග සහ ඇස්තමේන්තු බලා සිටීමේ කාලය',
      'ප්‍රජාව ඉදිරිපත් කළ තත්ත්ව යාවත්කාලීන',
      'ඉන්ධන පිරවුම්හල්වල අන්තර්ක්‍රියාකාරී සිතියම් දසුන',
      'පෙට්‍රල් 92, පෙට්‍රල් 95, ඩීසල් සහ තවත් සහය',
      'ඉංග්‍රීසි, සිංහල සහ දමිළ භාෂාවලින් ලබා ගත හැකිය',
    ],
    developedBy: 'නිර්මාණය කළේ',
    version: 'සංස්කරණය',
    openSource: 'විවෘත කේත',
    openSourceText: 'මෙම ව්‍යාපෘතිය විවෘත කේත සහ ප්‍රජා-ප්‍රගාමිතාවෙන් යුක්ත වේ.',
  },
  ta: {
    title: 'Fuel Watch LK பற்றி',
    subtitle: 'இலங்கையில் எரிபொருள் கிடைக்கும் தன்மையை நேரடியாக அறியுங்கள்',
    description:
      'Fuel Watch LK என்பது இலங்கை குடிமக்கள் கையிருப்பு உள்ள எரிபொருள் நிலையங்கள் மற்றும் குறைந்த வரிசைகள் உள்ள இடங்களைக் கண்டறிய உதவும் ஒரு சமூக இயக்கப்படும் தளமாகும். எரிபொருள் பற்றாக்குறை அல்லது அதிக தேவை காலங்களில், இந்த கருவி பொதுமக்களிடமிருந்து நேரடியாக பெறப்பட்ட நேரடி புதுப்பிப்புகளை வழங்குகிறது.',
    mission: 'எங்கள் நோக்கம்',
    missionText:
      'இலங்கை முழுவதும் துல்லியமான, சரியான நேரத்தில், சமூக மூலத்திலிருந்து பெறப்பட்ட எரிபொருள் கிடைக்கும் தகவல்களை வழங்குவது — வீணாகும் நேரத்தை குறைத்து மக்கள் தங்கள் பயணங்களை திறம்பட திட்டமிட உதவுவது.',
    features: 'முக்கிய அம்சங்கள்',
    featureList: [
      'தீவு முழுவதும் உள்ள நிலையங்களில் நேரடி எரிபொருள் கிடைக்கும் தன்மை',
      'நேரடி வரிசை நீளம் மற்றும் மதிப்பிடப்பட்ட காத்திருக்கும் நேரம்',
      'சமூகம் சமர்ப்பித்த நிலை புதுப்பிப்புகள்',
      'எரிபொருள் நிலையங்களின் ஊடாடும் வரைபட காட்சி',
      'பெட்ரோல் 92, பெட்ரோல் 95, டீசல் மற்றும் பலவற்றிற்கான ஆதரவு',
      'ஆங்கிலம், சிங்களம் மற்றும் தமிழில் கிடைக்கும்',
    ],
    developedBy: 'உருவாக்கியவர்கள்',
    version: 'பதிப்பு',
    openSource: 'திறந்த மூலம்',
    openSourceText: 'இந்த திட்டம் திறந்த மூலம் மற்றும் சமூக இயக்கம் கொண்டது.',
  },
};

type Lang = 'en' | 'si' | 'ta';

const langLabels: Record<Lang, string> = {
  en: 'EN',
  si: 'සි',
  ta: 'த',
};

export function AboutPage() {
  const navigate = useNavigate();
  const { theme, language } = useTheme();
  const currentLang = (language as Lang) in aboutContent ? (language as Lang) : 'en';
  const content = aboutContent[currentLang];

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-5 flex-shrink-0 transition-colors duration-500 ${
          isDark ? 'bg-[#161616]/90 border-[#2a2a2a]' : 'bg-white/80 border-gray-200/50'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-xl transition-all active:scale-95 ${
              isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{content.title}</h1>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {content.version} 1.2.0
              </p>
            </div>
          </div>

          {/* Language switcher pills */}
          <div className="ml-auto flex items-center gap-1">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <span
                key={l}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  currentLang === l
                    ? isDark
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-blue-50 border-blue-200 text-blue-600'
                    : isDark
                    ? 'bg-transparent border-gray-700 text-gray-500'
                    : 'bg-transparent border-gray-200 text-gray-400'
                }`}
              >
                {langLabels[l]}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
          {/* Hero banner */}
          <div
            className={`relative rounded-3xl overflow-hidden p-8 border transition-colors duration-500 ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/30 border-blue-500/20'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
            }`}
          >
            {/* Decorative circles */}
            <div
              className={`absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 ${
                isDark ? 'bg-blue-400' : 'bg-blue-300'
              }`}
            />
            <div
              className={`absolute -bottom-8 -left-4 w-24 h-24 rounded-full opacity-10 ${
                isDark ? 'bg-indigo-400' : 'bg-indigo-300'
              }`}
            />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-2xl ${
                    isDark ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Fuel className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Fuel Watch LK</h2>
                  <p
                    className={`text-xs font-semibold mt-0.5 ${
                      isDark ? 'text-blue-400' : 'text-blue-500'
                    }`}
                  >
                    🇱🇰 Sri Lanka
                  </p>
                </div>
              </div>
              <p
                className={`text-sm leading-relaxed font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {content.subtitle}
              </p>
            </div>
          </div>

          {/* Trilingual description cards */}
          <div className="space-y-4">
            {(Object.keys(aboutContent) as Lang[]).map((lang) => {
              const c = aboutContent[lang];
              const isActive = lang === currentLang;
              return (
                <div
                  key={lang}
                  className={`rounded-3xl border p-6 transition-all duration-300 ${
                    isActive
                      ? isDark
                        ? 'bg-blue-900/20 border-blue-500/30'
                        : 'bg-blue-50 border-blue-200'
                      : isDark
                      ? 'bg-gray-800/40 border-gray-700/50'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isActive
                          ? isDark
                            ? 'bg-blue-500/30 text-blue-300'
                            : 'bg-blue-100 text-blue-600'
                          : isDark
                          ? 'bg-white/5 text-gray-500'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                        isActive
                          ? isDark
                            ? 'text-blue-400'
                            : 'text-blue-600'
                          : isDark
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      isActive
                        ? isDark
                          ? 'text-gray-200'
                          : 'text-gray-800'
                        : isDark
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Mission */}
          <section
            className={`rounded-3xl border p-6 transition-colors duration-500 ${
              isDark
                ? 'bg-gray-800/40 border-gray-700/50'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2.5 rounded-2xl ${
                  isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-500'
                }`}
              >
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black">{content.mission}</h3>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {content.missionText}
            </p>
          </section>

          {/* Features */}
          <section
            className={`rounded-3xl border overflow-hidden transition-colors duration-500 ${
              isDark ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-100'
            }`}
          >
            <div className="p-6 pb-3">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2.5 rounded-2xl ${
                    isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black">{content.features}</h3>
              </div>
            </div>
            <div
              className={`divide-y ${
                isDark ? 'divide-gray-700/50' : 'divide-gray-50'
              }`}
            >
              {content.featureList.map((f, i) => (
                <div key={i} className="flex items-start gap-3 px-6 py-3.5">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                      isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {f}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Globe, label: '3 Languages', sub: 'EN / SI / TA' },
              { icon: Users, label: 'Community', sub: 'Powered' },
              { icon: Clock, label: 'Real-time', sub: 'Updates' },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className={`rounded-2xl border p-4 text-center transition-colors duration-500 ${
                  isDark
                    ? 'bg-gray-800/40 border-gray-700/50'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div
                  className={`mx-auto mb-2 p-2.5 rounded-xl w-fit ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-black">{label}</p>
                <p
                  className={`text-[10px] font-semibold ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {sub}
                </p>
              </div>
            ))}
          </div>

          {/* Developers */}
          <section
            className={`rounded-3xl border overflow-hidden transition-colors duration-500 ${
              isDark ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white border-gray-100'
            }`}
          >
            <div className="p-5 pb-2">
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {content.developedBy}
              </p>
            </div>
            <div className={`divide-y ${isDark ? 'divide-gray-700/50' : 'divide-gray-50'}`}>
              {[
                { name: 'Nadeesha Malshan', url: 'https://www.nadeesha.site/', color: 'indigo' },
                { name: 'Jayashan Manodya', url: 'https://www.jayashan.online/', color: 'blue' },
              ].map(({ name, url, color }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-5 transition-all ${
                    isDark ? 'hover:bg-gray-700/40' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        color === 'blue'
                          ? isDark
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                          : isDark
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      <Code className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">{name}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-40" />
                </a>
              ))}
            </div>
          </section>

          {/* Open Source */}
          <div
            className={`rounded-3xl border p-6 transition-colors duration-500 ${
              isDark
                ? 'bg-gray-800/40 border-gray-700/50'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-xl ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Github className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black">{content.openSource}</h3>
            </div>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {content.openSourceText}
            </p>
          </div>

          <p
            className={`text-center text-[10px] font-bold uppercase tracking-[0.3em] py-4 ${
              isDark ? 'text-gray-700' : 'text-gray-300'
            }`}
          >
            Fuel Watch LK — {content.version} 1.2.0
          </p>
        </div>
      </main>
    </div>
  );
}
