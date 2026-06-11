import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Newspaper, FolderTree, PlaySquare, Users, Settings, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/news", icon: Newspaper, label: "News" },
  { to: "/admin/categories", icon: FolderTree, label: "Categories" },
  { to: "/admin/videos", icon: PlaySquare, label: "Videos" },
  { to: "/admin/users", icon: Users, label: "Users", admin: true },
  { to: "/admin/settings", icon: Settings, label: "Settings", admin: true },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-100" data-testid="admin-layout">
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="font-heading font-black text-lg leading-none">Waqt Ki Awaz</div>
              <div className="text-[10px] uppercase tracking-widest text-sky-400 mt-1">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.filter((n) => !n.admin || user?.role === "admin").map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                data-testid={`admin-nav-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${active ? "bg-sky-500 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/" target="_blank" className="flex items-center gap-2 text-xs text-slate-400 hover:text-sky-400" data-testid="view-site-link">
            <ExternalLink className="w-3 h-3" />
            View site
          </Link>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400">Signed in as</div>
            <div className="text-sm font-medium text-white truncate">{user?.email}</div>
            <div className="text-xs text-sky-400 capitalize">{user?.role}</div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10" data-testid="admin-logout">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
