import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import Navbar from "../components/Layout/Navbar";
import useNotifications from "../hooks/useNotifications";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function SettingsPage() {
  const { darkMode, setDarkMode, pets, records, language, setLanguage } = usePet();
  const { t } = useTranslation();
  const { permission, requestPermission, checkAndNotify, isSupported } = useNotifications(pets, records);

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      toast.error(t("toastNotificationDenied"));
      return;
    }
    if (permission === "denied") {
      toast.error("Tarayıcı ayarlarından izni sıfırlayın.");
      return;
    }
    if (permission === "granted") {
      toast(t("pushNotificationsDesc"), { icon: "ℹ️" });
      return;
    }
    const result = await requestPermission();
    if (result === "granted") {
      toast.success(t("toastNotificationOn"));
      checkAndNotify();
    } else {
      toast.error(t("toastNotificationDenied"));
    }
  };

  const handleTestNotification = () => {
    if (permission !== "granted") {
      toast.error("Önce bildirim iznini açın!");
      return;
    }
    new Notification(t("appName"), {
      body: t("pushNotificationsDesc"),
      icon: "/favicon.ico",
    });
    toast.success(t("toastTestSent"));
  };

  const Section = ({ title, children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4"
    >
      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  const Row = ({ icon, label, desc, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">{label}</div>
          {desc && <div className="text-xs text-gray-400 dark:text-gray-500">{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  const notificationLabel = {
    granted: t("notificationGranted"),
    denied: t("notificationDenied"),
    default: t("notificationDefault"),
  }[permission];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"
        >
          {t("settingsTitle")}
        </motion.h1>

        <Section title={t("appearance")} delay={0.1}>
          <Row icon="🌙" label={t("darkMode")} desc={t("darkModeDesc")}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${darkMode ? "bg-emerald-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${darkMode ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </Row>
          <Row icon="🌍" label={t("language")} desc={t("languageDesc")}>
            <div className="flex gap-2">
              {["tr", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    language === lang
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {lang === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section title={t("notifications")} delay={0.2}>
          <Row icon="🔔" label={t("pushNotifications")} desc={t("pushNotificationsDesc")}>
            <button
              onClick={handleNotificationToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${permission === "granted" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${permission === "granted" ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </Row>
          <Row icon="📊" label={t("notificationStatus")} desc={t("notificationStatusDesc")}>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {notificationLabel}
            </span>
          </Row>
          {permission === "granted" && (
            <Row icon="🧪" label={t("testNotification")} desc={t("testNotificationDesc")}>
              <button
                onClick={handleTestNotification}
                className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-3 py-1.5 rounded-xl font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                {t("testSend")}
              </button>
            </Row>
          )}
        </Section>

        <Section title={t("about")} delay={0.3}>
          <Row icon="🐾" label={t("appName")} desc={t("appDesc")}>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">v1.0.0</span>
          </Row>
          <Row icon="💾" label={t("storage")} desc={t("storageDesc")}>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t("storageLocal")}</span>
          </Row>
          <Row icon="🔒" label={t("privacy")} desc={t("privacyDesc")}>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t("privacySecure")}</span>
          </Row>
        </Section>
      </div>
    </div>
  );
}

export default SettingsPage;