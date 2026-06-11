import React, { useEffect, useState } from "react";
import api, { formatApiError } from "../../lib/api";

export default function AdminSettings() {
  const [form, setForm] = useState({ site_name: "", tagline: "", about: "", contact_email: "", social: {} });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/settings").then(({ data }) => setForm({ ...form, ...data, social: data.social || {} }));
    // eslint-disable-next-line
  }, []);

  const save = async (e) => {
    e.preventDefault(); setMsg(""); setError("");
    try {
      await api.put("/settings", {
        site_name: form.site_name, tagline: form.tagline, about: form.about,
        contact_email: form.contact_email, social: form.social
      });
      setMsg("Settings saved.");
    } catch (err) { setError(formatApiError(err.response?.data?.detail)); }
  };

  return (
    <div data-testid="admin-settings" className="max-w-2xl">
      <h1 className="font-heading text-3xl font-black text-slate-900 mb-2">Settings</h1>
      <p className="text-sm text-slate-500 mb-6">Site name, tagline, and social links.</p>
      <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Site Name</label>
          <input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" data-testid="settings-site-name" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Tagline</label>
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">About</label>
          <textarea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Contact Email</label>
          <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["twitter", "facebook", "instagram", "youtube"].map((k) => (
            <div key={k}>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">{k}</label>
              <input value={form.social?.[k] || ""} onChange={(e) => setForm({ ...form, social: { ...form.social, [k]: e.target.value } })} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900" />
            </div>
          ))}
        </div>
        {msg && <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{msg}</div>}
        {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
        <button type="submit" className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-medium" data-testid="settings-save">Save Settings</button>
      </form>
    </div>
  );
}
