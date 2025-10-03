import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Campaigns from "./pages/Campaigns.jsx";
import Templates from "./pages/Templates.jsx";
import Users from "./pages/Users.jsx";
import Reports from "./pages/Reports.jsx";
import Training from "./pages/Training.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login.jsx";
import Landing from "./pages/Landing.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Quizzes from "./pages/Quizzes.jsx";
// ...
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Signed-in users */}
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/training" element={<Training />} />
        <Route path="/l" element={<Landing />} />   {/* feedback click logger */}
        <Route path="/quizzes" element={<Quizzes />} />
      </Route>

        {/* Admin-only */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/users" element={<Users />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/training" element={<Training />} />
          <Route path="/l" element={<Landing />} />   {/* feedback click logger */}

        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
