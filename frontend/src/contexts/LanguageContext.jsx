import React, { createContext, useContext, useEffect, useState } from "react";
import { I18N } from "../lib/i18n";

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("wka_lang") || "en");

  useEffect(() => {
    localStorage.setItem("wka_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key) => I18N[lang]?.[key] ?? I18N.en[key] ?? key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
