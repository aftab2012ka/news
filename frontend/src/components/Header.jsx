import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Moon, Sun, Globe, Newspaper } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useLang } from "../contexts/LanguageContext";
import { LANG_NAMES } from "../lib/i18n";
import api from "../lib/api";

export default function Header() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLang();
  const [siteName, setSiteName] = useState("Waqt Ki Awaz");
  const [tagline, setTagline] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      setSiteName(data.site_name || "Waqt Ki Awaz");
      setTagline(data.tagline || "");
    }).catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="logo-link">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white">
              <Newspaper className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                {siteName}
              </span>
              {tagline && <span className="text-[10px] uppercase tracking-widest text-sky-600 dark:text-sky-400 mt-0.5">{tagline}</span>}
            </div>
          </Link>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md mx-4" data-testid="search-form">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                data-testid="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_placeholder")}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200" data-testid="language-switcher">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{LANG_NAMES[lang]}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
                {Object.entries(LANG_NAMES).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    data-testid={`lang-option-${code}`}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 ${lang === code ? "text-sky-600 font-semibold" : "text-slate-700 dark:text-slate-200"}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={toggle}
              data-testid="theme-toggle"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <form onSubmit={onSearch} className="md:hidden pb-3" data-testid="search-form-mobile">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
