import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Youtube, Mail } from "lucide-react";
import api from "../lib/api";
import { useLang } from "../contexts/LanguageContext";

export default function Footer() {
  const [settings, setSettings] = useState({});
  const { t } = useLang();

  useEffect(() => {
    api.get("/settings").then(({ data }) => setSettings(data)).catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h4 className="font-heading text-2xl font-black text-white mb-3">{settings.site_name || "Waqt Ki Awaz"}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{settings.about}</p>
          </div>
          <div>
            <h5 className="text-sm uppercase tracking-widest text-sky-400 font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-sky-400">{t("about_us")}</Link></li>
              <li><Link to="/contact" className="hover:text-sky-400">{t("contact_us")}</Link></li>
              <li><Link to="/privacy" className="hover:text-sky-400">{t("privacy")}</Link></li>
              <li><Link to="/terms" className="hover:text-sky-400">{t("terms")}</Link></li>
              <li><Link to="/disclaimer" className="hover:text-sky-400">{t("disclaimer")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm uppercase tracking-widest text-sky-400 font-semibold mb-4">Categories</h5>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/karnataka" className="hover:text-sky-400">Karnataka</Link></li>
              <li><Link to="/category/national" className="hover:text-sky-400">National</Link></li>
              <li><Link to="/category/international" className="hover:text-sky-400">International</Link></li>
              <li><Link to="/category/technology" className="hover:text-sky-400">Technology</Link></li>
              <li><Link to="/category/sports" className="hover:text-sky-400">Sports</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm uppercase tracking-widest text-sky-400 font-semibold mb-4">Newsletter</h5>
            <p className="text-sm text-slate-400 mb-3">Get the latest news in your inbox.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()} data-testid="newsletter-form">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 text-sm bg-slate-800 rounded-full border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white placeholder:text-slate-500"
              />
              <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-full text-sm font-medium text-white" data-testid="newsletter-submit">
                <Mail className="w-4 h-4" />
              </button>
            </form>
            <div className="flex gap-3 mt-5">
              <a href={settings.social?.twitter || "#"} className="p-2 rounded-full bg-slate-800 hover:bg-sky-500"><Twitter className="w-4 h-4" /></a>
              <a href={settings.social?.facebook || "#"} className="p-2 rounded-full bg-slate-800 hover:bg-sky-500"><Facebook className="w-4 h-4" /></a>
              <a href={settings.social?.instagram || "#"} className="p-2 rounded-full bg-slate-800 hover:bg-sky-500"><Instagram className="w-4 h-4" /></a>
              <a href={settings.social?.youtube || "#"} className="p-2 rounded-full bg-slate-800 hover:bg-sky-500"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.site_name || "Waqt Ki Awaz"}. {t("all_rights")}.</p>
          <Link to="/admin/login" className="hover:text-sky-400 mt-2 sm:mt-0" data-testid="admin-link">{t("admin_login")} →</Link>
        </div>
      </div>
    </footer>
  );
}
