import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

export default function NewsCard({ article, size = "md" }) {
  const { t } = useLang();
  if (!article) return null;

  return (
    <article
      data-testid={`news-card-${article.id}`}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group"
    >
      <Link to={`/article/${article.id}`} className="block overflow-hidden">
        <img
          src={article.image_url}
          alt={article.title}
          className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${size === "lg" ? "h-64" : "h-48"}`}
          loading="lazy"
        />
      </Link>
      <div className="p-5">
        <Link
          to={`/category/${article.category_slug}`}
          className="inline-block bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900 rounded-full px-3 py-1 text-xs font-medium mb-3 capitalize"
          data-testid={`card-category-${article.id}`}
        >
          {article.category_slug?.replace(/-/g, " ")}
        </Link>
        <Link to={`/article/${article.id}`}>
          <h3 className={`font-heading font-bold text-slate-900 dark:text-white leading-snug mb-2 hover:text-sky-600 transition-colors ${size === "lg" ? "text-2xl" : "text-lg"}`}>
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">{article.summary}</p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{article.author_name || "Staff"}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(article.published_at)}</span>
          </div>
          <Link
            to={`/article/${article.id}`}
            className="text-sky-600 dark:text-sky-400 font-medium hover:underline"
            data-testid={`read-more-${article.id}`}
          >
            {t("read_more")} →
          </Link>
        </div>
      </div>
    </article>
  );
}
