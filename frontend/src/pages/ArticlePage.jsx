import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, Tag, Twitter, Facebook, Linkedin, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../lib/api";
import { useLang } from "../contexts/LanguageContext";
import NewsCard from "../components/NewsCard";

function formatDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

export default function ArticlePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState({ name: "", text: "" });
  const { t } = useLang();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/articles/${id}`).then(({ data }) => setData(data)).catch(() => setData(false));
    setComments(JSON.parse(localStorage.getItem(`wka_comments_${id}`) || "[]"));
  }, [id]);

  const submitComment = (e) => {
    e.preventDefault();
    if (!comment.name.trim() || !comment.text.trim()) return;
    const next = [...comments, { ...comment, at: new Date().toISOString() }];
    setComments(next);
    localStorage.setItem(`wka_comments_${id}`, JSON.stringify(next));
    setComment({ name: "", text: "" });
  };

  if (data === false) return <div className="max-w-3xl mx-auto py-20 text-center text-slate-500">Article not found.</div>;
  if (!data) return <div className="max-w-3xl mx-auto py-20 text-center text-slate-500">Loading...</div>;

  const a = data.article;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <main className="bg-white dark:bg-slate-950" data-testid="article-page">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <Link to={`/category/${a.category_slug}`} className="inline-block bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-full px-4 py-1 text-xs uppercase tracking-widest font-bold mb-5">
          {a.category_slug?.replace(/-/g, " ")}
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-5">
          {a.title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{a.summary}</p>
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 dark:text-slate-400 mb-8 border-y border-slate-200 dark:border-slate-800 py-4">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{t("by")} <strong className="text-slate-900 dark:text-slate-200">{a.author_name || "Staff"}</strong></span>
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(a.published_at)}</span>
          <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" />{a.views?.toLocaleString() || 0} views</span>
          <div className="flex items-center gap-2 ml-auto" data-testid="share-buttons">
            <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(a.title)}`} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white"><Twitter className="w-4 h-4" /></a>
            <a target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white"><Facebook className="w-4 h-4" /></a>
            <a target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white"><Linkedin className="w-4 h-4" /></a>
            <button onClick={() => { navigator.clipboard?.writeText(shareUrl); }} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white" data-testid="share-copy"><Share2 className="w-4 h-4" /></button>
          </div>
        </div>

        {a.image_url && (
          <img src={a.image_url} alt={a.title} className="w-full rounded-2xl object-cover max-h-[60vh] mb-8" />
        )}

        <div className="prose-article max-w-none text-base sm:text-lg" data-testid="article-content">
          {(a.content || "").split("\n").map((p, i) => p.trim() && <p key={i}>{p}</p>)}
        </div>

        <div className="flex justify-between items-center mt-12 border-t border-slate-200 dark:border-slate-800 pt-6" data-testid="prev-next-nav">
          {data.prev ? (
            <Link to={`/article/${data.prev.id}`} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 max-w-[45%]">
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="text-sm line-clamp-2">{data.prev.title}</span>
            </Link>
          ) : <div />}
          {data.next ? (
            <Link to={`/article/${data.next.id}`} className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-right max-w-[45%]">
              <span className="text-sm line-clamp-2">{data.next.title}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : <div />}
        </div>
      </article>

      {data.related?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-6">{t("related")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.related.map((r) => <NewsCard key={r.id} article={r} />)}
          </div>
        </section>
      )}

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="font-heading text-2xl font-black text-slate-900 dark:text-white mb-6">{t("comments")} ({comments.length})</h2>
        <form onSubmit={submitComment} className="space-y-3 mb-6" data-testid="comment-form">
          <input
            value={comment.name}
            onChange={(e) => setComment({ ...comment, name: e.target.value })}
            placeholder="Your name"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            data-testid="comment-name"
          />
          <textarea
            value={comment.text}
            onChange={(e) => setComment({ ...comment, text: e.target.value })}
            rows={3}
            placeholder="Your comment"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            data-testid="comment-text"
          />
          <button type="submit" className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-medium" data-testid="comment-submit">Post comment</button>
        </form>
        <ul className="space-y-4">
          {comments.map((c, i) => (
            <li key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <strong className="text-sm text-slate-900 dark:text-white">{c.name}</strong>
                <span className="text-xs text-slate-500">{new Date(c.at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
