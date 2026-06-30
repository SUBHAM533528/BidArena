import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stadium-950">
        <div className="text-center">
          <p className="text-4xl mb-3 animate-pulse">🏏</p>
          <p className="text-floodlight-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Send admins to admin login, owners to owner login
    const dest = roles?.includes("super_admin") ? "/admin/login" : "/owner/login";
    return <Navigate to={dest} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
