import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Newspaper, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { formatApiError } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@waqtkiawaz.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-100 px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center text-white">
            <Newspaper className="w-6 h-6" />
          </div>
          <span className="font-heading text-3xl font-black tracking-tighter text-slate-900">Waqt Ki Awaz</span>
        </Link>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h1 className="font-heading text-2xl font-black text-slate-900 mb-1">Admin Sign In</h1>
          <p className="text-sm text-slate-500 mb-6">Manage your news portal</p>
          <form onSubmit={submit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                data-testid="login-email"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Password</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                data-testid="login-password"
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg" data-testid="login-error">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-full font-medium flex items-center justify-center gap-2 disabled:opacity-50" data-testid="login-submit">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Demo: admin@waqtkiawaz.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
