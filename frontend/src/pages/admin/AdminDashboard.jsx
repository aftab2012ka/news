import React, { useEffect, useState } from "react";
import { Newspaper, Eye, FolderTree, PlaySquare, Users, FileText, Clock } from "lucide-react";
import api from "../../lib/api";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) return <div className="text-slate-500">Loading...</div>;

  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-heading text-3xl font-black text-slate-900 mb-2">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-8">Overview of your news portal</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Newspaper} label="Total News" value={stats.total_news} color="bg-sky-500" />
        <StatCard icon={Eye} label="Total Views" value={stats.total_views?.toLocaleString()} color="bg-amber-500" />
        <StatCard icon={FolderTree} label="Categories" value={stats.total_categories} color="bg-emerald-500" />
        <StatCard icon={PlaySquare} label="Videos" value={stats.total_videos} color="bg-rose-500" />
        <StatCard icon={FileText} label="Published" value={stats.published} color="bg-indigo-500" />
        <StatCard icon={Clock} label="Drafts" value={stats.drafts} color="bg-slate-500" />
        <StatCard icon={Users} label="Users" value={stats.total_users} color="bg-purple-500" />
      </div>

      <div className="mt-10 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-heading text-xl font-bold text-slate-900">Recent Articles</h2>
        </div>
        <table className="w-full text-sm" data-testid="recent-table">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Views</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent?.map((a) => (
              <tr key={a.id} className="border-t border-slate-100">
                <td className="p-4 font-medium text-slate-900 max-w-md truncate">{a.title}</td>
                <td className="p-4 capitalize text-slate-600">{a.category_slug?.replace(/-/g, " ")}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${a.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                    {a.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{(a.views || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
