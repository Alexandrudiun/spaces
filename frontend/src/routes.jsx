import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Map from "./components/Map.jsx";
import Bookings from "./components/Bookings.jsx";
import FindMyMate from "./components/FindMyMate.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    errorElement: <div>Page not found</div>,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Home /> },
      { path: "map", element: <Map /> },
      { path: "bookings", element: <Bookings /> },
      { path: "find-mate", element: <FindMyMate /> },
      { path: "settings", element: <div className="p-8"><h1 className="text-3xl font-bold">Settings - Coming Soon</h1></div> },
    ],
  },
]);

export default router;
