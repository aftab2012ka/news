import React, { useEffect, useState } from "react";
import api from "../lib/api";
import HeroBento from "../components/HeroBento";
import NewsCard from "../components/NewsCard";
import VideoSection from "../components/VideoSection";
import TrendingSidebar from "../components/TrendingSidebar";
import { useLang } from "../contexts/LanguageContext";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const { t, lang } = useLang();

  useEffect(() => {
    api.get(`/articles?featured=true&language=${lang}&limit=3`).then(({ data }) => setFeatured(data)).catch(() => {});
    api.get(`/articles?language=${lang}&limit=12`).then(({ data }) => setLatest(data)).catch(() => {});
  }, [lang]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-testid="home-page">
      {featured.length > 0 && <HeroBento articles={featured} />}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("latest_news")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-testid="latest-grid">
            {latest.length === 0 && (
              <p className="text-slate-500 col-span-2">{t("no_results")}</p>
            )}
            {latest.map((a) => <NewsCard key={a.id} article={a} />)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <TrendingSidebar />
        </div>
      </section>

      <VideoSection />
    </main>
  );
}
