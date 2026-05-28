import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function usePageTitle(title?: string | null) {
  const { i18n } = useTranslation();
  const isEN = i18n.language === "en";
  const appName = "PatiDefteri";

  useEffect(() => {
    if (title) {
      document.title = `${title} — ${appName}`;
    } else {
      document.title = isEN
        ? `${appName} — Pet Care Journal`
        : `${appName} — Evcil Hayvan Bakım Günlüğü`;
    }
    // <html lang> dil seçimiyle senkronize — ekran okuyucular doğru dilde okusun
    document.documentElement.lang = isEN ? "en" : "tr";

    return () => {
      document.title = appName;
    };
  }, [title, isEN]);
}

export default usePageTitle;
