import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import api, { formatApiError } from "../../lib/api";

const EMPTY = {
  title: "", summary: "", content: "", category_slug: "", image_url: "",
  author_name: "", language: "en", status: "draft", is_featured: false,
  is_breaking: false, scheduled_at: ""
};

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/admin/articles").then(({ data }) => setItems(data)).catch(() => {});
    api.get("/categories").then(({ data }) => setCats(data)).catch(() => {});
  };
  useEffect(load, []);

  const openNew = () => { setForm({ ...EMPTY, category_slug: cats[0]?.slug || "" }); setEditing("new"); setError(""); };
  const openEdit = (a) => { setForm({ ...EMPTY, ...a, scheduled_at: a.scheduled_at || "" }); setEditing(a.id); setError(""); };
  const close = () => { setEditing(null); setForm(EMPTY); };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      if (!payload.scheduled_at) delete payload.scheduled_at;
      if (editing === "new") await api.post("/articles", payload);
      else await api.put(`/articles/${editing}`, payload);
      close(); load();
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    await api.delete(`/articles/${id}`);
    load();
  };

  return (
    <div data-testid="admin-news">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-slate-900">News Management</h1>
          <p className="text-sm text-slate-500">{items.length} total articles</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-medium" data-testid="add-news-btn">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Lang</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Views</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-slate-100" data-testid={`admin-row-${a.id}`}>
                <td className="p-4 font-medium text-slate-900 max-w-md truncate">{a.title}</td>
                <td className="p-4 capitalize text-slate-600">{a.category_slug}</td>
                <td className="p-4 uppercase text-slate-600">{a.language}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${a.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{a.status}</span>
                </td>
                <td className="p-4 text-slate-600">{a.views || 0}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(a)} className="text-sky-600 hover:text-sky-700 p-1.5" data-testid={`edit-${a.id}`}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => remove(a.id)} className="text-red-600 hover:text-red-700 p-1.5" data-testid={`delete-${a.id}`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto" data-testid="news-modal">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? "New Article" : "Edit Article"}</h2>
              <button onClick={close}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" data-testid="form-title" />
              <textarea placeholder="Summary" rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <textarea placeholder="Content" rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" data-testid="form-category">
                  <option value="">— Category —</option>
                  {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" data-testid="form-language">
                  <option value="en">English</option>
                  <option value="ur">Urdu</option>
                  <option value="kn">Kannada</option>
                </select>
                <input placeholder="Author" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" data-testid="form-status">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {form.status === "scheduled" && (
                <input type="datetime-local" value={form.scheduled_at?.slice(0,16) || ""} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              )}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_breaking} onChange={(e) => setForm({ ...form, is_breaking: e.target.checked })} /> Breaking</label>
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={close} className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium" data-testid="form-save">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
