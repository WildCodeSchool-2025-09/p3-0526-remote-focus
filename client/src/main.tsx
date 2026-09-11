import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import { ThemeProvider } from "./contexts/ThemeContext";
// Import necessary modules from React and React Router
import SearchResults from "./pages/SearchResults";
import "./globals.css";
import App from "./App";
import ActorDetails from "./pages/ActorDetails";
import Calendar from "./pages/Calendar";
import Catalog from "./pages/Catalog";
import EpisodeDetail from "./pages/EpisodeDetail";
import Favorites from "./pages/Favorites";
import Homepage from "./pages/Homepage";
import InProgress from "./pages/InProgress";
import Login from "./pages/Login";
import MovieDetail from "./pages/MovieDetail";
import MyActors from "./pages/MyActors";
import NotFound from "./pages/NotFound";
import Preferences from "./pages/Preferences";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import SeasonDetail from "./pages/SeasonDetail";
import SerieDetail from "./pages/SerieDetail";
import Settings from "./pages/Settings";
import Statistics from "./pages/Statistics";
import Watchlist from "./pages/Watchlist";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "catalog",
        element: <Catalog />,
      },
      {
        path: "search",
        element: <SearchResults />,
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "profile/favorites",
        element: (
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        ),
      },
      {
        path: "profile/watchlist",
        element: (
          <PrivateRoute>
            <Watchlist />
          </PrivateRoute>
        ),
      },
      {
        path: "profile/settings",
        element: (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        ),
      },
      {
        path: "profile/actors",
        element: (
          <PrivateRoute>
            <MyActors />
          </PrivateRoute>
        ),
      },
      {
        path: "profile/in-progress",
        element: (
          <PrivateRoute>
            <InProgress />
          </PrivateRoute>
        ),
      },
      {
        path: "profile/statistics",
        element: (
          <PrivateRoute>
            <Statistics />
          </PrivateRoute>
        ),
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "preferences",
        element: (
          <PrivateRoute>
            <Preferences />
          </PrivateRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "movies/:id",
        element: <MovieDetail />,
      },
      {
        path: "series/:id",
        element: <SerieDetail />,
      },
      {
        path: "series/:serieId/seasons/:seasonId",
        element: <SeasonDetail />,
      },
      {
        path: "series/:serieId/seasons/:seasonId/episodes/:episodeId",
        element: <EpisodeDetail />,
      },
      {
        path: "actors/:id",
        element: <ActorDetails />,
      },
    ],
  },

  // Try adding a new route! For example, "/about" with an About component
]);

/* ************************************************************************* */

// Find the root element in the HTML document
const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

// Render the app inside the root element
createRoot(rootElement).render(
  <AuthProvider>
    <ThemeProvider>
      <SearchProvider>
        <RouterProvider router={router} />
      </SearchProvider>
    </ThemeProvider>
  </AuthProvider>,
);

/**
 * Helpful Notes:
 *
 * 1. Adding More Routes:
 *    To add more pages to your app, first create a new component (e.g., About.tsx).
 *    Then, import that component above like this:
 *
 *    import About from "./pages/About";
 *
 *    Add a new route to the router:
 *
 *      {
 *        path: "/about",
 *        element: <About />,  // Renders the About component
 *      }
 *
 * 2. Try Nested Routes:
 *    For more complex applications, you can nest routes. This lets you have sub-pages within a main page.
 *    Documentation: https://reactrouter.com/en/main/start/tutorial#nested-routes
 *
 * 3. Experiment with Dynamic Routes:
 *    You can create routes that take parameters (e.g., /users/:id).
 *    Documentation: https://reactrouter.com/en/main/start/tutorial#url-params-in-loaders
 */
