import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import api from "../lib/api";

export default function CategoryNav() {
  const [cats, setCats] = useState([]);
  const location = useLocation();

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCats(data)).catch(() => {});
  }, []);

  const activeSlug = location.pathname.startsWith("/category/")
    ? location.pathname.split("/category/")[1]
    : location.pathname === "/" ? "home" : "";

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 md:top-20 z-40" data-testid="category-nav">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto hide-scrollbar gap-1 py-2">
          {cats.map((c) => {
            const Icon = LucideIcons[c.icon] || LucideIcons.Newspaper;
            const isActive = activeSlug === c.slug;
            const href = c.slug === "home" ? "/" : `/category/${c.slug}`;
            return (
              <Link
                key={c.id}
                to={href}
                data-testid={`category-nav-${c.slug}`}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-sky-500 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
