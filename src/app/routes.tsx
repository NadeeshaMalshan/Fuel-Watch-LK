import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { SubmitUpdatePage } from "./pages/SubmitUpdatePage";
import { LiveFeedPage } from "./pages/LiveFeedPage";
import { StationDetailsPage } from "./pages/StationDetailsPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "submit", Component: SubmitUpdatePage },
      { path: "feed", Component: LiveFeedPage },
      { path: "station/:id", Component: StationDetailsPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
