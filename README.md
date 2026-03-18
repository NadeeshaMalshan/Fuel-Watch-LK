# ⛽ තෙල් Alert (Fuel Watch LK) — Real-time Fuel Availability & Queue Tracking

**තෙල් Alert** is a community-driven, real-time platform designed to track fuel availability and queue lengths at fuel stations across Sri Lanka. Built with a modern tech stack to ensure high performance and premium aesthetics, it helps Sri Lankans make informed decisions during their daily commute.

---

## 🌟 Key Features

- **🗺️ Interactive Map (Live & Dynamic)**: High-performance Leaflet-based map showing all fuel stations across the island with custom markers and popups.
- **🕒 Real-time Queue Tracking**: Community-sourced updates for **Petrol (92/95)** and **Diesel (Auto/Super)** queue lengths and waiting times.
- **🇱🇰 Multilingual Interface**: Full support for **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)** across all pages including the in-app guide.
- **🛡️ Secure Admin Panel**: Comprehensive dashboard for administrators to manage station details and approve/reject community feedback.
- **🤝 Community-Driven**: Users can report missing stations or propose corrections via a detailed feedback system.
- **🌓 Premium Experience**: Sleek, glassmorphic design with a dedicated **Dark Mode** for night-time convenience.
- **📖 In-App Guide**: Step-by-step trilingual guide page explaining every feature of the app.
- **📈 Global Status Calculation**: Automatically calculates the overall status of a station based on individual fuel types.
- **📱 Mobile-First Design**: Bottom sheet station previews, touch-optimized map overlays, and responsive layout.

---

## 🏗️ Technical Architecture

### **Frontend**

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19 | UI framework with hooks, context, and functional components |
| [Vite](https://vite.dev/) | 8 | Lightning-fast build tool and dev server with HMR |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Static typing across the entire codebase |
| [React Router](https://reactrouter.com/) | 7 | Client-side routing with nested layouts |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Utility-first CSS framework for responsive design |
| [tw-animate-css](https://github.com/nicepkg/tw-animate-css) | 1.4 | Tailwind-compatible CSS animation utilities |
| [Lucide React](https://lucide.dev/) | 0.577 | Beautiful, consistent SVG icon library |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Declarative animations and micro-interactions |
| [Sonner](https://sonner.stevenly.me/) | 2 | Elegant toast notification system |
| [Leaflet](https://leafletjs.com/) | 1.9 | Interactive maps with OpenStreetMap tiles |
| [Recharts](https://recharts.org/) | 3 | Composable charting library for data visualization |
| [date-fns](https://date-fns.org/) | 4 | Lightweight date utility functions |
| [Embla Carousel](https://www.embla-carousel.com/) | 8 | Lightweight, extensible carousel/slider |
| [Vaul](https://vaul.emilkowal.dev/) | 1 | Drawer/bottom-sheet component for mobile UX |
| [React Hook Form](https://react-hook-form.com/) | 7 | Performant form handling with validation |

### **UI Components (Radix UI Primitives)**

| Component | Purpose |
|---|---|
| `@radix-ui/react-dialog` | Modal dialogs and overlays |
| `@radix-ui/react-dropdown-menu` | Accessible dropdown menus |
| `@radix-ui/react-select` | Custom select dropdowns |
| `@radix-ui/react-tabs` | Tabbed interfaces |
| `@radix-ui/react-accordion` | Collapsible accordion sections |
| `@radix-ui/react-checkbox` | Styled checkboxes |
| `@radix-ui/react-switch` | Toggle switches |
| `@radix-ui/react-tooltip` | Hover tooltips |
| `@radix-ui/react-label` | Accessible form labels |
| `@radix-ui/react-popover` | Floating popovers |
| `@radix-ui/react-scroll-area` | Custom scrollable areas |
| `@radix-ui/react-separator` | Visual separators |
| `@radix-ui/react-slider` | Range sliders |
| `@radix-ui/react-progress` | Progress bars |
| `@radix-ui/react-radio-group` | Radio button groups |
| `@radix-ui/react-toggle` | Toggle buttons |
| `@radix-ui/react-avatar` | User avatar components |
| `@radix-ui/react-hover-card` | Hover detail cards |
| `@radix-ui/react-navigation-menu` | Navigation menus |
| `@radix-ui/react-menubar` | Menu bar component |
| `@radix-ui/react-context-menu` | Right-click context menus |
| `@radix-ui/react-alert-dialog` | Confirmation dialogs |
| `@radix-ui/react-collapsible` | Collapsible panels |
| `@radix-ui/react-aspect-ratio` | Aspect ratio containers |

**Utility Libraries**: `class-variance-authority`, `clsx`, `tailwind-merge`, `cmdk`, `input-otp`, `react-resizable-panels`

### **Backend**

| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Server runtime |
| [Express](https://expressjs.com/) | 5 | HTTP server and REST API framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type-safe server code |
| [tsx](https://github.com/privatenumber/tsx) | 4 | TypeScript execution and hot-reload for development |
| [CORS](https://github.com/expressjs/cors) | 2.8 | Cross-origin resource sharing middleware |
| [dotenv](https://github.com/motdotla/dotenv) | 17 | Environment variable management |

### **Database & ORM**

| Technology | Version | Purpose |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/) | — | Relational database for stations, updates, and requests |
| [Neon](https://neon.tech/) | — | Serverless PostgreSQL hosting (compatible) |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.45 | Type-safe SQL ORM with schema migrations |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | 0.31 | Schema generation and database push tooling |
| [@neondatabase/serverless](https://github.com/neondatabase/serverless) | 1.0 | Neon serverless driver for edge/serverless deployments |

### **Dev Tooling**

| Technology | Purpose |
|---|---|
| [ESLint](https://eslint.org/) | Code linting with React hooks and refresh plugins |
| [Vite Plugin React](https://github.com/vitejs/vite-plugin-react) | React Fast Refresh for HMR during development |
| [TypeScript ESLint](https://typescript-eslint.io/) | TypeScript-aware lint rules |

### **Deployment & Hosting**

| Platform | Purpose |
|---|---|
| [Vercel](https://vercel.com/) | Frontend hosting with edge CDN |
| [Railway](https://railway.app/) | Backend API and PostgreSQL hosting |

---

## 🚀 Quick Setup

### **1. Prerequisites**
Ensure you have **Node.js 18+** and a running **PostgreSQL** instance.

### **2. Installation**
```bash
git clone https://github.com/JayashanManodya/Fuel-Watch-LK.git
cd Fuel-Watch-LK
npm install
```

### **3. Environment Config**
Copy `.env.example` to `.env` and fill in your details:
```bash
PORT=3000
DATABASE_URL=your_postgresql_url_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_pass
```

### **4. Database Setup**
```bash
# Generate migrations
npm run db:generate

# Push schema to DB
npm run db:push
```

### **5. Run Locally**
The frontend is configured to use the **hosted API** on Railway (see `.env.development`). You only need:

```bash
npm run dev
```

To use a **local API** instead: run `npm run server`, create `.env.development.local` with `VITE_API_URL=` (empty) or remove `VITE_API_URL` from `.env.development` for that session, then `npm run dev` (Vite proxies `/api` → `localhost:3000`).

---

## 👥 Authors
- **Jayashan Manodya** - [GitHub](https://github.com/JayashanManodya)
- **Nadeesha Malshan** - [GitHub](https://github.com/NadeeshaMalshan)

---

## 🛡️ License
This project is for community benefit and is open for contributions. Please ensure all modifications follow the project's premium design guidelines.
