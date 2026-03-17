import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "./pages/HomePage";
import { SubmitUpdatePage } from "./pages/SubmitUpdatePage";
import { LiveFeedPage } from "./pages/LiveFeedPage";
import { StationDetailsPage } from "./pages/StationDetailsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "submit", Component: SubmitUpdatePage },
      { path: "feed", Component: LiveFeedPage },
      { path: "station/:id", Component: StationDetailsPage },
    ],
  },
]);
