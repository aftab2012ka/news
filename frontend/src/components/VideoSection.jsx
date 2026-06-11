import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import api from "../lib/api";
import { useLang } from "../contexts/LanguageContext";

export default function VideoSection() {
  const [videos, setVideos] = useState([]);
  const [active, setActive] = useState(null);
  const { t } = useLang();

  useEffect(() => {
    api.get("/videos?limit=6").then(({ data }) => {
      setVideos(data);
      if (data.length > 0) setActive(data[0]);
    }).catch(() => {});
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl px-4 sm:px-8" data-testid="video-section">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          {t("video_news")}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {active && (
            <div className="rounded-2xl overflow-hidden shadow-lg bg-black" data-testid="video-player">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${active.youtube_id}`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-5 bg-white dark:bg-slate-900">
                <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-1">{active.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{active.description}</p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v)}
              data-testid={`video-item-${v.id}`}
              className={`w-full text-left rounded-xl overflow-hidden flex gap-3 p-2 transition-colors ${active?.id === v.id ? "bg-sky-50 dark:bg-sky-950 ring-1 ring-sky-300" : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200 relative">
                <img
                  src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{v.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{v.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
