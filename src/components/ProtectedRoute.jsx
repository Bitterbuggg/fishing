import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ requireAdmin = false }) {
  const { loading, user, profile } = useAuth();
   if (loading) return <Spinner label="Checking session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && profile?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
