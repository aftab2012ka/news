import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useLang } from "../contexts/LanguageContext";

export default function BreakingTicker() {
  const [items, setItems] = useState([]);
  const { t, lang } = useLang();

  useEffect(() => {
    api.get(`/articles?breaking=true&language=${lang}&limit=10`)
      .then(({ data }) => setItems(data))
      .catch(() => {});
  }, [lang]);

  if (items.length === 0) return null;

  return (
    <div className="flex items-stretch bg-slate-900 text-white overflow-hidden h-11" data-testid="breaking-news-ticker">
      <div className="bg-red-500 px-4 flex items-center font-bold text-xs uppercase tracking-wider whitespace-nowrap z-10 gap-1.5">
        <Zap className="w-4 h-4" />
        {t("breaking")}
      </div>
      <Marquee speed={50} pauseOnHover gradient={false} className="flex-1 text-sm font-medium">
        {items.map((a) => (
          <Link
            key={a.id}
            to={`/article/${a.id}`}
            className="mx-8 hover:text-sky-300 transition-colors"
            data-testid={`ticker-item-${a.id}`}
          >
            • {a.title}
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
