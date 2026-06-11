import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import api, { formatApiError } from "../../lib/api";

const EMPTY = { name: "", icon: "Newspaper", order: 0 };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = () => api.get("/categories").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
  const openEdit = (c) => { setForm(c); setEditing(c.id); setError(""); };

  const save = async (e) => {
    e.preventDefault(); setError("");
    try {
      if (editing === "new") await api.post("/categories", form);
      else await api.put(`/categories/${editing}`, form);
      setEditing(null); load();
    } catch (err) { setError(formatApiError(err.response?.data?.detail)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`); load();
  };

  return (
    <div data-testid="admin-categories">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">{items.length} categories</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-medium" data-testid="add-category-btn">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Icon</th>
              <th className="text-left p-4">Order</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-4 font-medium text-slate-900">{c.name}</td>
                <td className="p-4 text-slate-600">{c.slug}</td>
                <td className="p-4 text-slate-600">{c.icon}</td>
                <td className="p-4 text-slate-600">{c.order}</td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(c)} className="text-sky-600 p-1.5"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => remove(c.id)} className="text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? "New Category" : "Edit Category"}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <input placeholder="Icon (lucide name e.g. Newspaper)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
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
