import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
// Import necessary modules from React and React Router
import SearchResults from "./pages/SearchResults";
import "./globals.css";
import App from "./App";
import Calendar from "./pages/Calendar";
import Catalog from "./pages/Catalog";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import MovieDetail from "./pages/MovieDetail";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

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
        path: "register",
        element: <Register />,
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
    <SearchProvider>
      <RouterProvider router={router} />
    </SearchProvider>
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
