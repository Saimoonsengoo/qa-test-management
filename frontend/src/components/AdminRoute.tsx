import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Backend routes for Users/Roles already enforce requireRole("Admin"),
// this just keeps a non-Admin from ever seeing (or bouncing 403s off of)
// the admin screens in the first place.
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="empty-state">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role.name !== "Admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}
