import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { StationDetailsPage } from "./pages/StationDetailsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminPage } from "./pages/AdminPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { AboutPage } from "./pages/AboutPage";
import { GuidePage } from "./pages/GuidePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "station/:id", Component: StationDetailsPage },
      { path: "settings", Component: SettingsPage },
      { path: "admin", Component: AdminPage },
      { path: "feedback", Component: FeedbackPage },
      { path: "about", Component: AboutPage },
      { path: "guide", Component: GuidePage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
