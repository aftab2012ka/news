import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900" data-testid="auth-loading">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/admin" replace />;
  return children;
}
