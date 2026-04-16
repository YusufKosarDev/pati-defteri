import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Layout/Navbar";
import useNotifications from "../hooks/useNotifications";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function SettingsPage() {
  const { darkMode, setDarkMode, pets, records, weights, setPets, setRecords, setWeights, language, setLanguage } = usePet();
  const { user, updateProfile, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { permission, requestPermission, checkAndNotify, isSupported } = useNotifications(pets, records);
  const [dragOver, setDragOver] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const isEN = i18n.language === "en";

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

  const handleExport = () => {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      pets,
      records,
      weights,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patidefteri-yedek-${new Date().toLocaleDateString("tr-TR").replace(/\./g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("toastBackupExported"));
  };

  const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.pets || !data.records) {
          toast.error(t("toastBackupError"));
          return;
        }
        setPets(data.pets || []);
        setRecords(data.records || []);
        setWeights(data.weights || []);
        toast.success(`${data.pets.length} ${t("toastBackupImported")}`);
      } catch {
        toast.error(t("toastBackupReadError"));
      }
    };
    reader.readAsText(file);
  };

  const handleSaveName = () => {
    if (!newName.trim()) return;
    updateProfile(newName.trim());
    setEditingName(false);
    toast.success(isEN ? "Name updated!" : "İsim güncellendi!");
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

  const stats = [
    { icon: "🐾", label: t("backupPets"), count: pets.length },
    { icon: "💉", label: t("backupRecords"), count: records.length },
    { icon: "⚖️", label: t("backupWeights"), count: weights.length },
  ];

  const avatarColor = user?.isGuest ? "bg-gray-500" : "bg-emerald-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6"
        >
          {t("settingsTitle")}
        </motion.h1>

        {/* Profil */}
        {user && (
          <Section title={isEN ? "Profile" : "Profil"} delay={0.05}>
            <div className="flex items-center gap-4 py-2">
              <div className={`w-12 h-12 ${avatarColor} rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                    >
                      {isEN ? "Save" : "Kaydet"}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNewName(user.name); }}
                      className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                    >
                      {isEN ? "Cancel" : "İptal"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {user.isGuest ? (isEN ? "Guest User" : "Misafir Kullanıcı") : user.email}
                      </p>
                    </div>
                    {!user.isGuest && (
                      <button
                        onClick={() => setEditingName(true)}
                        className="ml-2 text-xs text-emerald-500 hover:text-emerald-600 cursor-pointer font-medium"
                      >
                        {isEN ? "Edit" : "Düzenle"}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {user.isGuest && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                  {isEN ? "Guest" : "Misafir"}
                </span>
              )}
            </div>

            {user.isGuest && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900 rounded-xl">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  ⚠️ {isEN
                    ? "You're using as a guest. Data will be deleted when browser closes. Register to save permanently."
                    : "Misafir olarak kullanıyorsunuz. Tarayıcı kapanınca veriler silinir. Kalıcı kayıt için üye olun."}
                </p>
              </div>
            )}
          </Section>
        )}

        {/* Görünüm */}
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

        {/* Bildirimler */}
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

        {/* Yedekleme */}
        <Section title={t("backupTitle")} delay={0.3}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{s.count}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          <Row icon="💾" label={t("exportTitle")} desc={t("exportDesc")}>
            <button
              onClick={handleExport}
              className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 px-3 py-1.5 rounded-xl font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              {t("exportBtn")}
            </button>
          </Row>

          <div className="pt-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">📂</span>
              <div>
                <div className="font-medium text-gray-800 dark:text-gray-100 text-sm">{t("importTitle")}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{t("importDesc")}</div>
                <div className="text-xs text-red-400 dark:text-red-500 mt-0.5">{t("importWarning")}</div>
              </div>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImport(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${dragOver ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950" : "border-gray-200 dark:border-gray-700"}`}
            >
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">{t("importDrop")}</p>
              <label className="cursor-pointer">
                <span className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  {t("importOr")}
                </span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => handleImport(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </Section>

        {/* Hakkında */}
        <Section title={t("about")} delay={0.4}>
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