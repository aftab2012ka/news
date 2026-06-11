import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../contexts/LanguageContext";

export default function HeroBento({ articles }) {
  const { t } = useLang();
  if (!articles || articles.length === 0) return null;
  const [main, ...rest] = articles;
  const sides = rest.slice(0, 2);

  return (
    <section className="py-8 sm:py-12" data-testid="hero-section">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Link
          to={`/article/${main.id}`}
          className="col-span-1 md:col-span-8 row-span-2 relative group overflow-hidden rounded-2xl block aspect-[16/10] md:aspect-auto md:min-h-[500px]"
          data-testid="hero-main"
        >
          <img src={main.image_url} alt={main.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
            <span className="inline-block bg-sky-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              {t("featured")} · {main.category_slug?.replace(/-/g, " ")}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-5xl font-black leading-tight mb-3 tracking-tight">
              {main.title}
            </h2>
            <p className="text-slate-200 text-sm sm:text-base max-w-2xl line-clamp-2">{main.summary}</p>
          </div>
        </Link>

        <div className="col-span-1 md:col-span-4 grid grid-cols-1 gap-6">
          {sides.map((a) => (
            <Link
              key={a.id}
              to={`/article/${a.id}`}
              className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow block group"
              data-testid={`hero-side-${a.id}`}
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img src={a.image_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <span className="text-[10px] uppercase tracking-widest text-sky-600 font-bold">{a.category_slug?.replace(/-/g, " ")}</span>
                <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white mt-1 leading-snug group-hover:text-sky-600 transition-colors line-clamp-2">
                  {a.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
