import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Clock, Eye } from "lucide-react";
import api from "../lib/api";
import { useLang } from "../contexts/LanguageContext";

export default function TrendingSidebar() {
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const { t, lang } = useLang();

  useEffect(() => {
    api.get(`/articles?sort=trending&language=${lang}&limit=5`).then(({ data }) => setTrending(data)).catch(() => {});
    api.get(`/articles?sort=recent&language=${lang}&limit=5`).then(({ data }) => setRecent(data)).catch(() => {});
  }, [lang]);

  const Section = ({ icon: Icon, title, items, accent }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${accent}`} />
        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((a, i) => (
          <li key={a.id} className="flex gap-3" data-testid={`sidebar-item-${a.id}`}>
            <span className={`font-heading text-2xl font-black ${accent} leading-none shrink-0`}>0{i + 1}</span>
            <Link to={`/article/${a.id}`} className="flex-1 group">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-sky-600">
                {a.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <Eye className="w-3 h-3" />
                {(a.views || 0).toLocaleString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <aside className="space-y-6 sticky top-44" data-testid="trending-sidebar">
      <Section icon={TrendingUp} title={t("trending")} items={trending} accent="text-amber-500" />
      <Section icon={Clock} title={t("recent")} items={recent} accent="text-sky-600" />
    </aside>
  );
}
