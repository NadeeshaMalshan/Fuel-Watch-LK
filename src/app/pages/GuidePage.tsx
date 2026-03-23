import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Search, ShieldAlert, Activity, Clock, TrendingUp, List, PlayCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { SEO } from '../components/SEO';

type SectionData = {
  id: string;
  iconName: string;
  title: string;
  desc: string;
  bullets: string[];
};

type GuideData = {
  title: string;
  subtitle: string;
  sections: SectionData[];
  statusLabels: { available: string; limited: string; outOfStock: string };
  statusDesc: { available: string; limited: string; outOfStock: string };
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search, List, Activity, Clock, TrendingUp, ShieldAlert, PlayCircle
};

const guideContent: Record<string, GuideData> = {
  en: {
    title: 'How to Use Fuel Alert',
    subtitle: 'A step-by-step guide to finding fuel and contributing to the community',
    sections: [
      {
        id: 'demo',
        iconName: 'PlayCircle',
        title: 'System Walkthrough',
        desc: 'Watch this short video to see how Fuel Alert works and how you can use its features effectively.',
        bullets: []
      },
      {
        id: 'find',
        iconName: 'Search',
        title: 'Step 1: Finding Fuel Stations',
        desc: 'First, you need to find a station. On the Home page, you have two ways to search:',
        bullets: [
          'Use the search bar at the top to type in your city, town, or a specific station name.',
          'Click the "Locate" button to automatically find stations near your current GPS location.',
          'Switch between "Map View" (to see stations geographically) and "List View" (to scroll through nearby stations).'
        ]
      },
      {
        id: 'filter',
        iconName: 'List',
        title: 'Step 2: Filtering by Fuel Type',
        desc: "Don't waste time looking at stations that don't have what you need!",
        bullets: [
          'In the side panel, look for the "Fuel Type" filter chips.',
          'Click on "Petrol 92", "Auto Diesel", "Super Diesel", etc.',
          'The app will instantly hide any stations that do not carry your selected fuel type.'
        ]
      },
      {
        id: 'status',
        iconName: 'Activity',
        title: 'Step 3: Understanding Fuel Status Colors',
        desc: 'When you look at a station, you will see colored tags that tell you immediately if they have fuel.',
        bullets: []
      },
      {
        id: 'queues',
        iconName: 'Clock',
        title: 'Step 4: Checking Queues & Wait Times',
        desc: 'Even if a station has fuel, the queue might be too long! Check the numbers before you travel.',
        bullets: [
          'Vehicle Count: Shows approximately how many vehicles are waiting in line.',
          'Wait Time: Shows the estimated wait time in minutes.',
          'Check both the Petrol Queue and Diesel Queue separately on the station details page.'
        ]
      },
      {
        id: 'contribute',
        iconName: 'TrendingUp',
        title: 'Step 5: How You Can Help (Updating Status)',
        desc: 'This app relies on people like you! When you are at a fuel station, please tell others what the situation is.',
        bullets: [
          'Click on the station you are currently visiting.',
          'Click the "Update Status" button. Note: To ensure accuracy, only community members who are physically present (within 300m from that particular fuel station) can update fuel and queue status.',
          'Enter how many vehicles are in the queue, how long you waited, and if fuel is still Available or Out of Stock.',
          'Click "Submit" – your update will instantly help thousands of other drivers!'
        ]
      },
      {
        id: 'report',
        iconName: 'ShieldAlert',
        title: 'Step 6: Reporting Mistakes',
        desc: 'Did you see an error? Let us fix it together.',
        bullets: [
          "If a station's location is wrong, or the details are permanently incorrect, click the \"Report incorrect information\" link.",
          'If the entire station is missing from the app, go to Settings -> Feedback and request to add a new station.'
        ]
      }
    ],
    statusLabels: { available: 'Available', limited: 'Limited', outOfStock: 'Out of Stock' },
    statusDesc: {
      available: 'Good news! The station currently has plenty of fuel in stock. You can safely travel here.',
      limited: 'Fuel is running low or the station is rationing (giving limited amounts per vehicle).',
      outOfStock: 'Do not travel here. The station has completely run out of this fuel type.'
    }
  },
  si: {
    title: 'Fuel Alert භාවිතා කරන්නේ කෙසේද',
    subtitle: 'ඉන්ධන සොයා ගැනීම සහ ප්‍රජාවට දායක වීම සඳහා පියවරෙන් පියවර මාර්ගෝපදේශය',
    sections: [
      {
        id: 'demo',
        iconName: 'PlayCircle',
        title: 'පද්ධති හැඳින්වීම (Video)',
        desc: 'Fuel Alert භාවිතා කරන ආකාරය සහ එහි විශේෂාංග පිළිබඳව මෙම කෙටි වීඩියෝවෙන් නරඹන්න.',
        bullets: []
      },
      {
        id: 'find',
        iconName: 'Search',
        title: 'පියවර 1: ඉන්ධන පිරවුම්හල් සොයා ගැනීම',
        desc: 'මුලින්ම, ඔබට පිරවුම්හලක් සොයාගත යුතුය. ඊට ක්‍රම දෙකක් ඇත:',
        bullets: [
          'ඔබගේ නගරය, ගම හෝ පිරවුම්හලේ නම ටයිප් කිරීමට ඉහළින් ඇති සෙවුම් තීරුව (Search bar) භාවිතා කරන්න.',
          'ඔබගේ අසල ඇති පිරවුම්හල් ස්වයංක්‍රීයව සොයා ගැනීමට "Locate" බොත්තම ක්ලික් කරන්න.',
          '"Map View" (සිතියමෙන් බැලීමට) සහ "List View" (ලැයිස්තුවකින් බැලීමට) අතර මාරු වන්න.'
        ]
      },
      {
        id: 'filter',
        iconName: 'List',
        title: 'පියවර 2: ඉන්ධන වර්ගය අනුව වෙන් කිරීම',
        desc: 'ඔබට අවශ්‍ය නැති ඉන්ධන ඇති පිරවුම්හල් බලමින් කාලය නාස්ති නොකරන්න!',
        bullets: [
          'පැත්තේ ඇති පැනලයේ "Fuel Type" විකල්ප සොයන්න.',
          '"Petrol 92", "Auto Diesel" වැනි ඔබට අවශ්‍ය වර්ගය මත ක්ලික් කරන්න.',
          'ඔබ තෝරාගත් ඉන්ධන වර්ගය නොමැති පිරවුම්හල් යෙදුමෙන් ස්වයංක්‍රීයව සැඟවෙනු ඇත.'
        ]
      },
      {
        id: 'status',
        iconName: 'Activity',
        title: 'පියවර 3: ඉන්ධන තත්ත්වය (වර්ණ) තේරුම් ගැනීම',
        desc: 'ඔබ පිරවුම්හලක් දෙස බලන විට, ඉන්ධන තිබේදැයි වහාම පවසන වර්ණ ටැග් ඔබට පෙනෙනු ඇත.',
        bullets: []
      },
      {
        id: 'queues',
        iconName: 'Clock',
        title: 'පියවර 4: පෝලිම් සහ බලා සිටීමේ කාලය පරීක්ෂා කිරීම',
        desc: 'පිරවුම්හලේ ඉන්ධන තිබුණත් පෝලිම දිග වැඩි විය හැක! ගමන් කිරීමට පෙර අංක පරීක්ෂා කරන්න.',
        bullets: [
          'වාහන ගණන (Vehicle Count): පෝලිමේ වාහන කීයක් පමණ සිටීද යන්න පෙන්වයි.',
          'බලා සිටීමේ කාලය (Wait Time): ඇස්තමේන්තුගත බලා සිටීමේ කාලය මිනිත්තු වලින් පෙන්වයි.',
          'පිරවුම්හලේ විස්තර පිටුවෙන් පෙට්‍රල් සහ ඩීසල් පෝලිම් වෙන වෙනම පරීක්ෂා කරන්න.'
        ]
      },
      {
        id: 'contribute',
        iconName: 'TrendingUp',
        title: 'පියවර 5: ඔබට උදව් කළ හැකි ආකාරය (තත්ත්වය යාවත්කාලීන කිරීම)',
        desc: 'මෙම යෙදුම රඳා පවතින්නේ ඔබ වැනි අය මතයි! ඔබ පිරවුම්හලක සිටින විට, කරුණාකර වෙනත් අයට ඒ බව දන්වන්න.',
        bullets: [
          'ඔබ දැනට සිටින පිරවුම්හල මත ක්ලික් කරන්න.',
          '"Update Status" බොත්තම ක්ලික් කරන්න. (පෝලිම් වල දිග සහ ඉන්ධන තොග පිළිබඳ තොරතුරු අදාළ පිරවුම්හලේ සිටින ප්‍රජා සාමාජිකයින් විසින්ම ලබාදෙන බව තහවුරු කිරීමට, යාවත්කාලීන කිරීමක් සඳහා ඔබ එම පිරවුම්හලේ සිට මීටර් 300ක් ඇතුළත සිටිය යුතුය)',
          'පෝලිමේ වාහන කීයක් දැයි, කොපමණ වේලාවක් බලා සිටියාද සහ ඉන්ධන තවමත් තිබේද (Available) නැතිද (Out of Stock) යන්න ඇතුළත් කරන්න.',
          '"Submit" ක්ලික් කරන්න - ඔබේ යාවත්කාලීන කිරීම ක්ෂණිකව අනෙකුත් රියදුරන් දහස් ගණනකට උපකාරී වනු ඇත!'
        ]
      },
      {
        id: 'report',
        iconName: 'ShieldAlert',
        title: 'පියවර 6: වැරදි වාර්තා කිරීම',
        desc: 'ඔබ දෝෂයක් දුටුවාද? අපි එය එකට නිවැරදි කරමු.',
        bullets: [
          'පිරවුම්හලක ස්ථානය වැරදි නම්, හෝ විස්තර වැරදි නම්, "Report incorrect information" සබැඳිය ක්ලික් කරන්න.',
          'සමස්ත පිරවුම්හලම යෙදුමෙන් මග හැරී ඇත්නම්, Settings -> Feedback වෙත ගොස් නව පිරවුම්හලක් එක් කිරීමට ඉල්ලීමක් කරන්න.'
        ]
      }
    ],
    statusLabels: { available: 'Available (ඇත)', limited: 'Limited (සීමිතයි)', outOfStock: 'Out of Stock (නොමැත)' },
    statusDesc: {
      available: 'ශුභාරංචියක්! පිරවුම්හලේ දැනට ප්‍රමාණවත් තරම් ඉන්ධන තොග ඇත. ඔබට ආරක්ෂිතව මෙහි ගමන් කළ හැක.',
      limited: 'ඉන්ධන අවසන් වෙමින් පවතී හෝ සීමිත ප්‍රමාණයක් පමණක් නිකුත් කරයි.',
      outOfStock: 'මෙහි ගමන් නොකරන්න. පිරවුම්හලේ මෙම ඉන්ධන වර්ගය සම්පූර්ණයෙන්ම අවසන් වී ඇත.'
    }
  },
  ta: {
    title: 'Fuel Alert பயன்படுத்துவது எப்படி',
    subtitle: 'எரிபொருளைக் கண்டறிவதற்கும் சமூகத்திற்கு பங்களிப்பதற்கும் படிப்படியான வழிகாட்டி',
    sections: [
      {
        id: 'demo',
        iconName: 'PlayCircle',
        title: 'முறைமை விளக்கம் (Video)',
        desc: 'Fuel Alert எவ்வாறு செயல்படுகிறது மற்றும் அதன் அம்சங்களை எவ்வாறு திறம்பட பயன்படுத்துவது என்பதை இந்த குறுகிய வீடியோவில் பாருங்கள்.',
        bullets: []
      },
      {
        id: 'find',
        iconName: 'Search',
        title: 'படி 1: எரிபொருள் நிலையங்களைக் கண்டறிதல்',
        desc: 'முதலில், நீங்கள் ஒரு நிலையத்தைக் கண்டுபிடிக்க வேண்டும். முகப்புப் பக்கத்தில், தேட இரண்டு வழிகள் உள்ளன:',
        bullets: [
          'உங்கள் நகரம், ஊர் அல்லது ஒரு குறிப்பிட்ட நிலையத்தின் பெயரைத் தட்டச்சு செய்ய முகப்புப் பக்கத்தில் உள்ள தேடல் பட்டியைப் பயன்படுத்தவும்.',
          'உங்கள் தற்போதைய GPS இருப்பிடத்திற்கு அருகிலுள்ள நிலையங்களை தானாக கண்டறிய "Locate" பொத்தானைக் கிளிக் செய்யவும்.',
          '"Map View" (நிலைகளை வரைபடத்தில் பார்க்க) மற்றும் "List View" (அருகிலுள்ள நிலையங்களை பட்டியலாகப் பார்க்க) இடையே மாறவும்.'
        ]
      },
      {
        id: 'filter',
        iconName: 'List',
        title: 'படி 2: எரிபொருள் வகையால் வடிகட்டுதல்',
        desc: 'உங்களுக்குத் தேவையற்ற எரிபொருள் நிலையங்களைப் பார்த்து நேரத்தை வீணாக்காதீர்கள்!',
        bullets: [
          'பக்கவாட்டுப் பேனலில், "Fuel Type" விருப்பங்களைத் தேடுங்கள்.',
          '"Petrol 92", "Auto Diesel" போன்ற உங்களுக்குத் தேவையான வகையைக் கிளிக் செய்யவும்.',
          'பயன்பாடு நீங்கள் தேர்ந்தெடுத்த எரிபொருள் வகை இல்லாத எந்த நிலையங்களையும் உடனடியாக மறைத்துவிடும்.'
        ]
      },
      {
        id: 'status',
        iconName: 'Activity',
        title: 'படி 3: எரிபொருள் நிலை நிறங்களைப் புரிந்துகொள்ளுதல்',
        desc: 'நீங்கள் ஒரு நிலையத்தைப் பார்க்கும்போது, எரிபொருள் உள்ளதா என்பதை உடனடியாகக் கூறும் வண்ணக் குறிச்சொற்களைக் காண்பீர்கள்.',
        bullets: []
      },
      {
        id: 'queues',
        iconName: 'Clock',
        title: 'படி 4: வரிசைகள் மற்றும் காத்திருப்பு நேரங்களை சரிபார்த்தல்',
        desc: 'ஒரு நிலையத்தில் எரிபொருள் இருந்தாலும், வரிசை மிக நீளமாக இருக்கலாம்! நீங்கள் பயணிக்கும் முன் எண்களைச் சரிபார்க்கவும்.',
        bullets: [
          'வாகன எண்ணிக்கை (Vehicle Count): வரிசையில் தோராயமாக எத்தனை வாகனங்கள் காத்திருக்கின்றன என்பதைக் காட்டுகிறது.',
          'காத்திருப்பு நேரம் (Wait Time): மதிப்பிடப்பட்ட காத்திருப்பு நேரத்தை நிமிடங்களில் காட்டுகிறது.',
          'நிலைய விவரங்கள் பக்கத்தில் பெட்ரோல் வரிசை மற்றும் டீசல் வரிசை இரண்டையும் தனித்தனியாக சரிபார்க்கவும்.'
        ]
      },
      {
        id: 'contribute',
        iconName: 'TrendingUp',
        title: 'படி 5: நீங்கள் எவ்வாறு உதவ முடியும் (நிலையைப் புதுப்பித்தல்)',
        desc: 'இந்தப் பயன்பாடு உங்களைப் போன்றவர்களைச் சார்ந்திருக்கிறது! நீங்கள் எரிபொருள் நிலையத்தில் இருக்கும்போது, மற்றவர்களுக்கு நிலைமையை தெரிவிக்கவும்.',
        bullets: [
          'நீங்கள் தற்போது பார்வையிடும் நிலையத்தைக் கிளிக் செய்யவும்.',
          '"Update Status" பொத்தானைக் கிளிக் செய்யவும். (வரிசையின் நீளம் மற்றும் எரிபொருள் இருப்பு ஆகியவை குறிப்பிட்ட எரிபொருள் நிலையத்தில் இருக்கும் சமூக உறுப்பினர்களால் மட்டுமே அறிவிக்கப்படுவதை உறுதி செய்ய, நீங்கள் அந்த நிலையத்திலிருந்து 300 மீட்டருக்குள் இருக்க வேண்டும்)',
          'வரிசையில் எத்தனை வாகனங்கள் உள்ளன, நீங்கள் எவ்வளவு நேரம் காத்திருந்தீர்கள் மற்றும் எரிபொருள் இன்னும் உள்ளதா (Available) அல்லது காலியாகிவிட்டதா (Out of Stock) என்பதை உள்ளிடவும்.',
          '"Submit" என்பதைக் கிளிக் செய்யவும் - உங்கள் புதுப்பிப்பு உடனடியாக ஆயிரக்கணக்கான பிற ஓட்டுநர்களுக்கு உதவும்!'
        ]
      },
      {
        id: 'report',
        iconName: 'ShieldAlert',
        title: 'படி 6: தவறுகளை அறிவித்தல்',
        desc: 'ஒரு பிழையைக் கண்டீர்களா? அதை ஒன்றாக சரிசெய்வோம்.',
        bullets: [
          'ஒரு நிலையத்தின் இருப்பிடம் தவறாக இருந்தால் அல்லது விவரங்கள் தவறாக இருந்தால், "Report incorrect information" இணைப்பைக் கிளிக் செய்யவும்.',
          'முழு நிலையமும் ஆப்ஸில் இல்லை என்றால், Settings -> Feedback பகுதிக்குச் சென்று புதிய நிலையத்தைச் சேர்க்கக் கோரவும்.'
        ]
      }
    ],
    statusLabels: { available: 'Available (உள்ளது)', limited: 'Limited (குறைவாக உள்ளது)', outOfStock: 'Out of Stock (இல்லை)' },
    statusDesc: {
      available: 'நல்ல செய்தி! நிலையத்தில் தற்போது போதுமான எரிபொருள் கையிருப்பு உள்ளது. நீங்கள் பாதுகாப்பாக இங்கு பயணிக்கலாம்.',
      limited: 'எரிபொருள் குறைவாக உள்ளது அல்லது நிலையம் குறைந்த அளவு மட்டுமே வழங்குகிறது.',
      outOfStock: 'இங்கு பயணிக்க வேண்டாம். நிலையத்தில் இந்த வகையான எரிபொருள் முற்றிலும் தீர்ந்துவிட்டது.'
    }
  }
};

type Lang = 'en' | 'si' | 'ta';

const langLabels: Record<Lang, string> = {
  en: 'EN',
  si: 'සි',
  ta: 'த',
};

export function GuidePage() {
  const navigate = useNavigate();
  const { theme, language, setLanguage } = useTheme();
  const currentLang = (language as Lang) in guideContent ? (language as Lang) : 'en';
  const content = guideContent[currentLang];
  const isDark = theme === 'dark';

  return (
    <>
      <SEO
        title="How to Use Fuel Alert"
        description="Step-by-step guide on how to use Fuel Alert to find fuel stations, check availability, report queue lengths, and contribute real-time updates in Sri Lanka."
        url="/guide"
      />
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-5 flex-shrink-0 transition-colors duration-500 shadow-sm ${
          isDark ? 'bg-[#161616]/90 border-[#2a2a2a]' : 'bg-white/90 border-gray-200/50'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                  isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'
                }`}
              >
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight">{content.title}</h1>
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  App Guide
                </p>
              </div>
            </div>
          </div>

          {/* Language switcher pills */}
          <div className="flex items-center gap-1">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                  currentLang === l
                    ? isDark
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-purple-50 border-purple-200 text-purple-600'
                    : isDark
                    ? 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
                    : 'bg-transparent border-gray-200 text-gray-400 hover:border-gray-400'
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">
          
          {/* Hero banner */}
          <div
            className={`relative rounded-3xl overflow-hidden p-8 border shadow-sm transition-colors duration-500 ${
              isDark
                ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/20'
                : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100'
            }`}
          >
            <div className={`absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 ${isDark ? 'bg-purple-400' : 'bg-purple-300'}`} />
            <div className={`absolute -bottom-8 -left-4 w-24 h-24 rounded-full opacity-10 ${isDark ? 'bg-blue-400' : 'bg-blue-300'}`} />
            <div className="relative">
              <h2 className="text-2xl font-black tracking-tight mb-3">{content.title}</h2>
              <p className={`text-sm leading-relaxed font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                {content.subtitle}
              </p>
            </div>
          </div>

          {/* Guide Sections */}
          <div className="space-y-8">
            {content.sections.map((section) => {
              const IconComp = iconMap[section.iconName] || Info;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className={`rounded-3xl border overflow-hidden transition-colors shadow-sm duration-500 ${
                    isDark ? 'bg-card/40 border-gray-800' : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Section Header */}
                  <div className={`p-6 border-b ${isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-50 bg-gray-50/50'}`}>
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-purple-100 text-purple-600 border border-purple-200'}`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold">{section.title}</h3>
                    </div>
                  </div>

                  {/* Section Body */}
                  <div className="p-6">
                    <p className={`text-base font-medium mb-5 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                      {section.desc}
                    </p>

                    {/* Video Player for Demo Section */}
                    {section.id === 'demo' && (
                      <div className={`mt-4 rounded-2xl overflow-hidden border shadow-inner ${isDark ? 'bg-black/40 border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
                        <video 
                          controls 
                          className="w-full aspect-video"
                          poster="/favicon.svg"
                        >
                          <source src="/videos/demo.mp4" type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}

                    {/* Standard Bullets */}
                    {section.bullets.length > 0 && (
                      <ul className="space-y-3">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? 'bg-purple-400' : 'bg-purple-500'}`} />
                            <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Status Color Visual Examples */}
                    {section.id === 'status' && (
                      <div className="mt-4 grid gap-4">
                        {/* Green - Available */}
                        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 ${isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                          <div className="px-4 py-2 shrink-0 text-center rounded-xl text-xs font-black uppercase tracking-widest bg-green-500 text-white shadow-lg shadow-green-500/30">
                            {content.statusLabels.available}
                          </div>
                          <p className={`text-sm font-medium ${isDark ? 'text-green-100' : 'text-green-900'}`}>{content.statusDesc.available}</p>
                        </div>
                        {/* Amber - Limited */}
                        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                          <div className="px-4 py-2 shrink-0 text-center rounded-xl text-xs font-black uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-500/30">
                            {content.statusLabels.limited}
                          </div>
                          <p className={`text-sm font-medium ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>{content.statusDesc.limited}</p>
                        </div>
                        {/* Red - Out of Stock */}
                        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-4 ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                          <div className="px-4 py-2 shrink-0 text-center rounded-xl text-xs font-black uppercase tracking-widest bg-red-500 text-white shadow-lg shadow-red-500/30">
                            {content.statusLabels.outOfStock}
                          </div>
                          <p className={`text-sm font-medium ${isDark ? 'text-red-100' : 'text-red-900'}`}>{content.statusDesc.outOfStock}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
    </>
  );
}
