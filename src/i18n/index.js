import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import tr from "./tr";
import en from "./en";

function readStoredLanguage() {
  try {
    const raw = localStorage.getItem("language");
    if (!raw) return "tr";
    const parsed = JSON.parse(raw);
    return parsed === "en" || parsed === "tr" ? parsed : "tr";
  } catch {
    return "tr";
  }
}

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: readStoredLanguage(),
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;