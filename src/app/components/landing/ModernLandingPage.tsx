import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Fuel,
  MapPin,
  Menu,
  Moon,
  Shield,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react';

const easeOut = [0.22, 1, 0.36, 1] as const;

function useLandingTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggle = useCallback(() => setIsDark((d) => !d), []);

  return { isDark, toggle };
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Product', href: '#product' },
  { label: 'Contact', href: '#contact' },
];

const bento = [
  {
    title: 'Live map',
    description: 'District-aware clustering and crisp station pins tuned for fast scans.',
    icon: MapPin,
    className: 'lg:col-span-2 lg:row-span-1',
  },
  {
    title: 'Community signals',
    description: 'Queue length and wait times from people on the ground.',
    icon: BarChart3,
    className: 'lg:col-span-1',
  },
  {
    title: 'Reliable updates',
    description: 'Structured data with guardrails so the map stays trustworthy.',
    icon: Shield,
    className: 'lg:col-span-1',
  },
  {
    title: 'Built for speed',
    description: 'Minimal UI, instant interactions, offline-friendly where it matters.',
    icon: Zap,
    className: 'lg:col-span-2',
  },
];

export function ModernLandingPage() {
  const { isDark, toggle } = useLandingTheme();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: easeOut },
      };

  const fadeInView = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-60px' },
        transition: { duration: 0.5, ease: easeOut },
      };

  const shell = isDark
    ? 'bg-black text-zinc-100 selection:bg-zinc-700 selection:text-white'
    : 'bg-white text-neutral-950 selection:bg-neutral-200 selection:text-neutral-900';

  const borderSubtle = isDark ? 'border-zinc-800' : 'border-neutral-200';
  const glassNav = isDark
    ? 'border-b border-zinc-800/80 bg-black/70 supports-[backdrop-filter]:bg-black/50'
    : 'border-b border-neutral-200/80 bg-white/70 supports-[backdrop-filter]:bg-white/60';
  const glassCard = isDark
    ? 'border border-zinc-800 bg-zinc-950/40 backdrop-blur-xl'
    : 'border border-neutral-200/90 bg-white/55 backdrop-blur-xl';
  const muted = isDark ? 'text-zinc-400' : 'text-neutral-500';
  const inputRing = isDark
    ? 'border-zinc-800 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600/30'
    : 'border-neutral-200 bg-white/80 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-neutral-400/25';

  return (
    <div
      className={`min-h-screen antialiased ${shell}`}
      style={{ fontFamily: 'var(--font-landing, Inter, ui-sans-serif, system-ui, sans-serif)' }}
    >
      {/* Mesh glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className={`absolute -top-32 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-3xl ${
            isDark
              ? 'bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.22),transparent_55%)]'
              : 'bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18),transparent_60%)]'
          }`}
        />
        <div
          className={`absolute top-24 -right-24 h-80 w-80 rounded-full blur-3xl ${
            isDark ? 'bg-cyan-500/10' : 'bg-cyan-400/20'
          }`}
        />
        <div
          className={`absolute top-40 -left-20 h-72 w-72 rounded-full blur-3xl ${
            isDark ? 'bg-violet-500/10' : 'bg-violet-400/18'
          }`}
        />
      </div>

      <header
        className={`sticky top-0 z-50 backdrop-blur-xl ${glassNav}`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/landing" className="flex items-center gap-2 font-semibold tracking-tight">
            <span
              className={`flex size-8 items-center justify-center rounded-lg border ${borderSubtle} ${
                isDark ? 'bg-zinc-950' : 'bg-neutral-50'
              }`}
            >
              <Fuel className="size-4" strokeWidth={2} />
            </span>
            <span>FuelAlert</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  isDark ? 'text-zinc-400 hover:text-zinc-100' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className={`flex size-9 items-center justify-center rounded-lg border transition-colors ${borderSubtle} ${
                isDark ? 'bg-zinc-950 hover:bg-zinc-900' : 'bg-white hover:bg-neutral-50'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Link
              to="/"
              className={`hidden rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors sm:inline-flex ${borderSubtle} ${
                isDark ? 'hover:bg-zinc-900' : 'hover:bg-neutral-50'
              }`}
            >
              Open app
            </Link>
            <button
              type="button"
              className={`flex size-9 items-center justify-center rounded-lg border md:hidden ${borderSubtle} ${
                isDark ? 'bg-zinc-950' : 'bg-white'
              }`}
              aria-label="Menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className={`border-t px-4 py-4 md:hidden ${borderSubtle} ${
              isDark ? 'bg-black/95' : 'bg-white/95'
            }`}
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              <Link
                to="/"
                className="text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Open app →
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
        <motion.section className="mx-auto max-w-3xl text-center" {...fadeUp}>
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${borderSubtle} ${
              isDark ? 'bg-zinc-950/80 text-zinc-300' : 'bg-white/80 text-neutral-600'
            }`}
          >
            <Sparkles className="size-3.5" />
            Real-time fuel availability for Sri Lanka
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            Clarity on the map.
            <span className={muted}> Less guesswork at the pump.</span>
          </h1>
          <p className={`mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg ${muted}`}>
            A focused experience with clean typography, fast loads, and a map that scales from
            island overview to station detail.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <motion.div whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
              <Link
                to="/"
                className={`group inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold shadow-sm transition-shadow ${
                  isDark
                    ? 'bg-white text-black hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]'
                    : 'bg-neutral-900 text-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)]'
                }`}
              >
                Get started
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
            <a
              href="#features"
              className={`inline-flex h-11 items-center justify-center rounded-lg border px-6 text-sm font-medium transition-colors ${borderSubtle} ${
                isDark ? 'hover:bg-zinc-950' : 'hover:bg-neutral-50'
              }`}
            >
              Explore features
            </a>
          </div>
        </motion.section>

        <motion.section id="features" className="mt-24 lg:mt-32" {...fadeInView}>
          <h2 className={`text-center text-sm font-semibold uppercase tracking-[0.2em] ${muted}`}>
            Bento
          </h2>
          <p
            className={`mx-auto mt-3 max-w-lg text-center text-2xl font-semibold tracking-tight sm:text-3xl ${
              isDark ? 'text-zinc-100' : 'text-neutral-900'
            }`}
          >
            Everything you need, arranged with intent
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {bento.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className={`rounded-2xl p-6 sm:p-7 ${glassCard} ${item.className}`}
                  {...(reduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: 20 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true, margin: '-40px' },
                        transition: { delay: i * 0.06, duration: 0.45, ease: easeOut },
                      })}
                >
                  <div
                    className={`mb-4 flex size-10 items-center justify-center rounded-xl border ${borderSubtle} ${
                      isDark ? 'bg-zinc-900/60' : 'bg-white/80'
                    }`}
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          id="product"
          className="mt-24 rounded-2xl border p-8 sm:p-10 lg:mt-32 lg:p-12"
          style={{
            borderColor: isDark ? 'rgb(39 39 42)' : 'rgb(229 229 229)',
            background: isDark ? 'rgba(9,9,11,0.5)' : 'rgba(255,255,255,0.5)',
          }}
          {...fadeInView}
        >
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Solid by default</h2>
              <p className={`mt-3 text-sm leading-relaxed sm:text-base ${muted}`}>
                Inputs, focus rings, and motion respect accessibility. Prefer reduced motion? Animations
                step aside automatically.
              </p>
              <ul className={`mt-6 space-y-3 text-sm ${muted}`}>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                  Sticky glass navigation with crisp borders
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                  Deep dark mode on true black for OLED-friendly UI
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                  Framer Motion entry curves tuned for a premium feel
                </li>
              </ul>
            </div>
            <div id="contact" className="space-y-4">
              <div>
                <label htmlFor="landing-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider opacity-80">
                  Name
                </label>
                <input
                  id="landing-name"
                  type="text"
                  placeholder="Your name"
                  className={`h-11 w-full rounded-lg border px-3.5 text-sm outline-none ring-0 transition-[border-color,box-shadow] focus:ring-4 ${inputRing}`}
                />
              </div>
              <div>
                <label htmlFor="landing-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider opacity-80">
                  Email
                </label>
                <input
                  id="landing-email"
                  type="email"
                  placeholder="you@example.com"
                  className={`h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition-[border-color,box-shadow] focus:ring-4 ${inputRing}`}
                />
              </div>
              <motion.button
                type="button"
                whileHover={reduceMotion ? undefined : { y: -1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                className={`mt-2 h-11 w-full rounded-lg text-sm font-semibold transition-shadow sm:w-auto sm:px-8 ${
                  isDark
                    ? 'bg-white text-black hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)]'
                    : 'bg-neutral-900 text-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]'
                }`}
              >
                Request updates
              </motion.button>
            </div>
          </div>
        </motion.section>

        <footer className={`mt-20 border-t pt-10 text-center text-xs ${borderSubtle} ${muted}`}>
          <p>© {new Date().getFullYear()} FuelAlert · Built with React & Tailwind</p>
          <Link to="/" className={`mt-3 inline-block font-medium underline-offset-4 hover:underline ${isDark ? 'text-zinc-300' : 'text-neutral-700'}`}>
            Back to app
          </Link>
        </footer>
      </main>
    </div>
  );
}
