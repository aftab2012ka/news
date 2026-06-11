import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import NewsCard from "../components/NewsCard";
import { useLang } from "../contexts/LanguageContext";

export default function CategoryPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const { t, lang } = useLang();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/articles?category=${slug}&language=${lang}&limit=24`)
      .then(({ data }) => setArticles(data)).catch(() => {});
  }, [slug, lang]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid={`category-page-${slug}`}>
      <h1 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 dark:text-white capitalize mb-2">
        {slug?.replace(/-/g, " ")}
      </h1>
      <p className="text-sm text-slate-500 mb-8">{articles.length} articles</p>
      {articles.length === 0 ? (
        <p className="text-slate-500">{t("no_results")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => <NewsCard key={a.id} article={a} />)}
        </div>
      )}
    </main>
  );
}
