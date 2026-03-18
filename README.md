# ⛽ FuelWatch LK - Real-time Fuel Availability & Queue Tracking

**FuelWatch LK** is a community-driven, real-time platform designed to track fuel availability and queue lengths at fuel stations across Sri Lanka. Built with a modern tech stack to ensure high performance and premium aesthetics, it helps Sri Lankans make informed decisions during their daily commute.

---

## 🌟 Key Features

- **🗺️ Interactive Map (Live & Dynamic)**: High-performance Leaflet-based map showing all fuel stations across the island.
- **🕒 Real-time Queue Tracking**: Community-sourced updates for **Petrol (92/95)** and **Diesel (Auto/Super)** queue lengths and waiting times.
- **🇹🇱 Multilingual Interface**: Full support for **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**.
- **🛡️ Secure Admin Panel**: Comprehensive dashboard for administrators to manage station details and approve/reject community feedback.
- **🤝 Community-Driven**: Users can report missing stations or propose corrections via a detailed feedback system.
- **🌓 Premium Experience**: Sleek, glassmorphic design with a dedicated **Dark Mode** for night-time convenience.
- **📈 Global Status Calculation**: Automatically calculates the overall status of a station based on individual fuel types.

---

## 🏗️ Technical Architecture

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [React Context API](https://react.dev/reference/react/createContext)
- **Icons & UI**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)

### **Backend**
- **Server**: [Node.js](https://nodejs.org/) with [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime Builder**: [tsx](https://github.com/privatenumber/tsx)

### **Database & ORM**
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Compatible with [Neon](https://neon.tech/))

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
