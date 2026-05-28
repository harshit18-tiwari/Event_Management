import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import MyEvents from "./pages/MyEvents";
import EventParticipants from "./pages/EventParticipants";

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-lg">
          <p className="text-slate-700">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/create"
        element={
          <ProtectedRoute allowedRoles={["Admin","Coordinator"]}>
            <CreateEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-events"
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <MyEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id/participants"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Coordinator"]}>
            <EventParticipants />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["Admin","Coordinator"]}>
            <EditEvent />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
