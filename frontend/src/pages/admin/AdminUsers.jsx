import React, { useEffect, useState } from "react";
import { Plus, Trash2, X, Edit2 } from "lucide-react";
import api, { formatApiError } from "../../lib/api";

const EMPTY = { email: "", name: "", password: "", role: "reporter" };

export default function AdminUsers() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = () => api.get("/users").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
  const openEdit = (u) => { setForm({ ...u, password: "" }); setEditing(u.id); setError(""); };

  const save = async (e) => {
    e.preventDefault(); setError("");
    try {
      if (editing === "new") await api.post("/users", form);
      else {
        const upd = { name: form.name, role: form.role };
        if (form.password) upd.password = form.password;
        await api.put(`/users/${editing}`, upd);
      }
      setEditing(null); load();
    } catch (err) { setError(formatApiError(err.response?.data?.detail)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await api.delete(`/users/${id}`); load(); } catch (e) { alert(formatApiError(e.response?.data?.detail)); }
  };

  return (
    <div data-testid="admin-users">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-black text-slate-900">Users</h1>
          <p className="text-sm text-slate-500">{items.length} accounts</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-full text-sm font-medium" data-testid="add-user-btn">
          <Plus className="w-4 h-4" /> New User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Role</th><th className="text-right p-4">Actions</th></tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="p-4 font-medium text-slate-900">{u.name}</td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4"><span className="px-2 py-1 rounded-full text-xs bg-sky-50 text-sky-700 capitalize">{u.role}</span></td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(u)} className="text-sky-600 p-1.5"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => remove(u.id)} className="text-red-600 p-1.5"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="font-heading text-xl font-bold">{editing === "new" ? "New User" : "Edit User"}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
              <input required={editing === "new"} disabled={editing !== "new"} type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 disabled:bg-slate-100" />
              <input type="password" placeholder={editing === "new" ? "Password" : "New password (leave blank to keep)"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" required={editing === "new"} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="reporter">Reporter</option>
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
