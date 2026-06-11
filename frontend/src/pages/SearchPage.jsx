import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import NewsCard from "../components/NewsCard";
import { useLang } from "../contexts/LanguageContext";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [results, setResults] = useState([]);
  const { t } = useLang();

  useEffect(() => {
    if (!q) return;
    api.get(`/search?q=${encodeURIComponent(q)}`).then(({ data }) => setResults(data)).catch(() => {});
  }, [q]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="search-page">
      <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">Search</h1>
      <p className="text-sm text-slate-500 mb-8">{results.length} results for "{q}"</p>
      {results.length === 0 ? (
        <p className="text-slate-500">{t("no_results")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((a) => <NewsCard key={a.id} article={a} />)}
        </div>
      )}
    </main>
  );
}
