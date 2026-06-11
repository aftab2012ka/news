import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import api, { formatApiError } from "../../lib/api";

const EMPTY = { title: "", description: "", youtube_url: "", category_slug: "" };

export default function AdminVideos() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/videos").then(({ data }) => setItems(data));
    api.get("/categories").then(({ data }) => setCats(data));
  };
  useEffect(load, []);

  const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
  const openEdit = (v) => { setForm(v); setEditing(v.id); setError(""); };

  const save = async (e) => {
    e.preventDefault(); setError("");
    try {
      if (editing === "new") await api.post("/videos", form);
      else await api.put(`/videos/${editing}`, form);
      setEditing(null); load();
    } catch (err) { setError(formatApiError(err.response?.data?.detail)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    await api.delete(`/videos/${id}`); load();
  };

  return (
    <div data-testid="admin-videos">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-slate-900">Videos</h1>
          <p className="text-sm text-slate-500">{items.length} YouTube videos</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-medium" data-testid="add-video-btn">
          <Plus className="w-4 h-4" /> New Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((v) => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe src={`https://www.youtube.com/embed/${v.youtube_id}`} title={v.title} className="w-full h-full" allowFullScreen />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 line-clamp-2">{v.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.description}</p>
              <div className="flex justify-end gap-1 mt-2">
                <button onClick={() => openEdit(v)} className="text-sky-600 p-1.5"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => remove(v.id)} className="text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? "New Video" : "Edit Video"}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <input required placeholder="YouTube URL" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" data-testid="video-url-input" />
              <select value={form.category_slug || ""} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900">
                <option value="">— Category (optional) —</option>
                {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setEditing(null)} className="px-5 py-2 rounded-full bg-slate-100 text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-sky-500 text-white text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
