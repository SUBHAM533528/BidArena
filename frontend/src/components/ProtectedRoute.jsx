import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-ink-900 bg-ink-50">
        <div className="text-center">
          <i className="fa-solid fa-baseball-bat-ball text-4xl text-gold-500 animate-pulse" />
          <p className="dark:text-ink-400 text-ink-500 text-sm mt-3">Loading…</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to={roles?.includes("super_admin") ? "/admin/login" : "/owner/login"} replace />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
