import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Layout/Navbar";
import useNotifications from "../hooks/useNotifications";
import useEmailReminder from "../hooks/useEmailReminder";
import usePageTitle from "../hooks/usePageTitle";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function SettingsPage() {
  const { pets, records, weights, setPets, setRecords, setWeights, language, setLanguage } = usePet();
  const { user, updateProfile, changePassword, deleteAccount, upgradeGuest } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { permission, requestPermission, checkAndNotify, isSupported } = useNotifications(pets, records);
  const { sendReminderEmail, hasReminders } = useEmailReminder(pets, records);
  const isEN = i18n.language === "en";

  usePageTitle(isEN ? "Settings" : "Ayarlar");

  const [dragOver, setDragOver] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({ name: "", email: "", password: "" });
  const [upgradeErrors, setUpgradeErrors] = useState({});
  const [emailInput, setEmailInput] = useState(user?.email || "");

  const handleNotificationToggle = async () => {
    if (!isSupported) { toast.error(t("toastNotificationDenied")); return; }
    if (permission === "denied") { toast.error("Tarayıcı ayarlarından izni sıfırlayın."); return; }
    if (permission === "granted") { toast(t("pushNotificationsDesc"), { icon: "ℹ️" }); return; }
    const result = await requestPermission();
    if (result === "granted") { toast.success(t("toastNotificationOn")); checkAndNotify(); }
    else { toast.error(t("toastNotificationDenied")); }
  };

  const handleTestNotification = () => {
    if (permission !== "granted") { toast.error("Önce bildirim iznini açın!"); return; }
    new Notification(t("appName"), { body: t("pushNotificationsDesc"), icon: "/favicon.ico" });
    toast.success(t("toastTestSent"));
  };

  const handleSendReminderEmail = async () => {
    if (!emailInput.trim()) {
      toast.error(isEN ? "Please enter an email address." : "E-posta adresi girin.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailInput)) {
      toast.error(isEN ? "Invalid email address." : "Geçersiz e-posta adresi.");
      return;
    }
    const result = await sendReminderEmail(emailInput, user?.name);
    if (result.success) {
      toast.success(isEN ? "Mail app opened! 📧" : "Mail uygulaması açıldı! 📧");
    } else {
      toast.error(result.error);
    }
  };

  const handleExport = () => {
    const data = { version: "1.0", exportDate: new Date().toISOString(), pets, records, weights };
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
        if (!data.pets || !data.records) { toast.error(t("toastBackupError")); return; }
        setPets(data.pets || []);
        setRecords(data.records || []);
        setWeights(data.weights || []);
        toast.success(`${data.pets.length} ${t("toastBackupImported")}`);
      } catch { toast.error(t("toastBackupReadError")); }
    };
    reader.readAsText(file);
  };

  const handleSaveName = () => {
    if (!newName.trim()) return;
    updateProfile(newName.trim());
    setEditingName(false);
    toast.success(isEN ? "Name updated!" : "İsim güncellendi!");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.current) errors.current = isEN ? "Required." : "Zorunlu.";
    if (!passwordForm.next) errors.next = isEN ? "Required." : "Zorunlu.";
    else if (passwordForm.next.length < 6) errors.next = isEN ? "Min 6 characters." : "En az 6 karakter.";
    if (passwordForm.next !== passwordForm.confirm) errors.confirm = isEN ? "Passwords don't match." : "Şifreler eşleşmiyor.";
    if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return; }
    const result = changePassword(passwordForm.current, passwordForm.next);
    if (result.success) {
      toast.success(isEN ? "Password changed!" : "Şifre değiştirildi!");
      setShowPasswordForm(false);
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordErrors({});
    } else {
      setPasswordErrors({ current: result.error });
    }
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    setDeleteError("");
    const result = deleteAccount(deletePassword);
    if (result.success) {
      toast.success(isEN ? "Account deleted." : "Hesap silindi.");
      navigate("/");
    } else {
      setDeleteError(result.error);
    }
  };

  const handleUpgrade = (e) => {
    e.preventDefault();
    const errors = {};
    if (!upgradeForm.name.trim()) errors.name = isEN ? "Required." : "Zorunlu.";
    if (!upgradeForm.email.trim()) errors.email = isEN ? "Required." : "Zorunlu.";
    else if (!/\S+@\S+\.\S+/.test(upgradeForm.email)) errors.email = isEN ? "Invalid email." : "Geçersiz e-posta.";
    if (!upgradeForm.password) errors.password = isEN ? "Required." : "Zorunlu.";
    else if (upgradeForm.password.length < 6) errors.password = isEN ? "Min 6 characters." : "En az 6 karakter.";
    if (Object.keys(errors).length > 0) { setUpgradeErrors(errors); return; }
    const result = upgradeGuest(upgradeForm.name, upgradeForm.email, upgradeForm.password);
    if (result.success) {
      toast.success(isEN ? "Account created! Your data is saved. 🎉" : "Hesap oluşturuldu! Veriler kaydedildi. 🎉");
      setShowUpgradeForm(false);
    } else {
      setUpgradeErrors({ email: result.error });
    }
  };

  const Section = ({ title, children, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-4"
    >
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  const Row = ({ icon, label, desc, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-medium text-gray-100 text-sm">{label}</div>
          {desc && <div className="text-xs text-gray-500">{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  const inputClass = (error) => `w-full bg-gray-800 border ${error ? "border-red-400" : "border-gray-700"} rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400`;
  const notificationLabel = { granted: t("notificationGranted"), denied: t("notificationDenied"), default: t("notificationDefault") }[permission];
  const stats = [
    { icon: "🐾", label: t("backupPets"), count: pets.length },
    { icon: "💉", label: t("backupRecords"), count: records.length },
    { icon: "⚖️", label: t("backupWeights"), count: weights.length },
  ];
  const avatarColor = user?.isGuest ? "bg-gray-500" : "bg-emerald-500";

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-100 mb-6">
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
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer">
                      {isEN ? "Save" : "Kaydet"}
                    </button>
                    <button onClick={() => { setEditingName(false); setNewName(user.name); }} className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer">
                      {isEN ? "Cancel" : "İptal"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-gray-100 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.isGuest ? (isEN ? "Guest User" : "Misafir Kullanıcı") : user.email}</p>
                    </div>
                    {!user.isGuest && (
                      <button onClick={() => setEditingName(true)} className="ml-2 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer font-medium">
                        {isEN ? "Edit" : "Düzenle"}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {user.isGuest && (
                <span className="text-xs bg-yellow-950 text-yellow-400 px-2 py-1 rounded-full font-medium">
                  {isEN ? "Guest" : "Misafir"}
                </span>
              )}
            </div>

            {user.isGuest && (
              <>
                <div className="mt-3 p-3 bg-yellow-950/30 border border-yellow-900 rounded-xl">
                  <p className="text-xs text-yellow-400">
                    ⚠️ {isEN ? "You're using as a guest. Data will be deleted when browser closes." : "Misafir olarak kullanıyorsunuz. Tarayıcı kapanınca veriler silinir."}
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => setShowUpgradeForm(!showUpgradeForm)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                  >
                    {showUpgradeForm ? (isEN ? "Cancel" : "İptal") : (isEN ? "🚀 Create Account & Save Data" : "🚀 Hesap Oluştur & Verileri Kaydet")}
                  </button>
                  <AnimatePresence>
                    {showUpgradeForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleUpgrade}
                        className="flex flex-col gap-3 mt-3 overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{isEN ? "Name" : "İsim"}</label>
                          <input value={upgradeForm.name} onChange={(e) => setUpgradeForm({ ...upgradeForm, name: e.target.value })} className={inputClass(upgradeErrors.name)} placeholder={isEN ? "Your name" : "Adın"} />
                          {upgradeErrors.name && <p className="text-red-400 text-xs mt-1">{upgradeErrors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{isEN ? "Email" : "E-posta"}</label>
                          <input type="email" value={upgradeForm.email} onChange={(e) => setUpgradeForm({ ...upgradeForm, email: e.target.value })} className={inputClass(upgradeErrors.email)} placeholder="ornek@email.com" />
                          {upgradeErrors.email && <p className="text-red-400 text-xs mt-1">{upgradeErrors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{isEN ? "Password" : "Şifre"}</label>
                          <input type="password" value={upgradeForm.password} onChange={(e) => setUpgradeForm({ ...upgradeForm, password: e.target.value })} className={inputClass(upgradeErrors.password)} placeholder={isEN ? "Min 6 characters" : "En az 6 karakter"} />
                          {upgradeErrors.password && <p className="text-red-400 text-xs mt-1">{upgradeErrors.password}</p>}
                        </div>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                          {isEN ? "Create Account" : "Hesap Oluştur"}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </Section>
        )}

        {/* Dil */}
        <Section title={t("appearance")} delay={0.1}>
          <Row icon="🌍" label={t("language")} desc={t("languageDesc")}>
            <div className="flex gap-2">
              {["tr", "en"].map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${language === lang ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                  {lang === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* Bildirimler */}
        <Section title={t("notifications")} delay={0.2}>
          <Row icon="🔔" label={t("pushNotifications")} desc={t("pushNotificationsDesc")}>
            <button onClick={handleNotificationToggle} className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${permission === "granted" ? "bg-emerald-500" : "bg-gray-700"}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${permission === "granted" ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </Row>
          <Row icon="📊" label={t("notificationStatus")} desc={t("notificationStatusDesc")}>
            <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">{notificationLabel}</span>
          </Row>
          {permission === "granted" && (
            <Row icon="🧪" label={t("testNotification")} desc={t("testNotificationDesc")}>
              <button onClick={handleTestNotification} className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1.5 rounded-xl font-medium cursor-pointer">
                {t("testSend")}
              </button>
            </Row>
          )}
        </Section>

        {/* Email Hatırlatıcı */}
        <Section title={isEN ? "Email Reminders" : "Email Hatırlatıcı"} delay={0.25}>
          <div className="py-2">
            <p className="text-sm text-gray-400 mb-4">
              {isEN
                ? "Opens your mail app with reminders pre-filled. Just hit send!"
                : "Mail uygulamanızı açar, hatırlatıcılar hazır doldurulmuş gelir. Sadece gönderin!"}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={isEN ? "your@email.com" : "ornek@email.com"}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                onClick={handleSendReminderEmail}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center gap-2 flex-shrink-0"
              >
                📧 {isEN ? "Open Mail" : "Mail Aç"}
              </button>
            </div>
            {hasReminders() ? (
              <p className="text-xs text-emerald-400 mt-2">
                ✅ {isEN ? "You have upcoming/overdue reminders to send." : "Gönderilecek yaklaşan/gecikmiş hatırlatıcılarınız var."}
              </p>
            ) : (
              <p className="text-xs text-gray-600 mt-2">
                {isEN ? "No upcoming or overdue care at the moment." : "Şu an yaklaşan veya gecikmiş bakım yok."}
              </p>
            )}
          </div>
        </Section>

        {/* Yedekleme */}
        <Section title={t("backupTitle")} delay={0.3}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-lg font-bold text-gray-100">{s.count}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
          <Row icon="💾" label={t("exportTitle")} desc={t("exportDesc")}>
            <button onClick={handleExport} className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1.5 rounded-xl font-medium cursor-pointer">
              {t("exportBtn")}
            </button>
          </Row>
          <div className="pt-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">📂</span>
              <div>
                <div className="font-medium text-gray-100 text-sm">{t("importTitle")}</div>
                <div className="text-xs text-gray-500">{t("importDesc")}</div>
                <div className="text-xs text-red-400 mt-0.5">{t("importWarning")}</div>
              </div>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImport(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${dragOver ? "border-emerald-400 bg-emerald-950/20" : "border-gray-700"}`}
            >
              <p className="text-sm text-gray-500 mb-3">{t("importDrop")}</p>
              <label className="cursor-pointer">
                <span className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors">{t("importOr")}</span>
                <input type="file" accept=".json" className="hidden" onChange={(e) => handleImport(e.target.files[0])} />
              </label>
            </div>
          </div>
        </Section>

        {/* Güvenlik */}
        {user && !user.isGuest && (
          <Section title={isEN ? "Security" : "Güvenlik"} delay={0.35}>
            <Row icon="🔑" label={isEN ? "Change Password" : "Şifre Değiştir"} desc={isEN ? "Update your account password" : "Hesap şifreni güncelle"}>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-xl font-medium cursor-pointer hover:bg-gray-700 transition-colors">
                {showPasswordForm ? (isEN ? "Cancel" : "İptal") : (isEN ? "Change" : "Değiştir")}
              </button>
            </Row>
            <AnimatePresence>
              {showPasswordForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleChangePassword} className="flex flex-col gap-3 pt-3 overflow-hidden">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{isEN ? "Current Password" : "Mevcut Şifre"}</label>
                    <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className={inputClass(passwordErrors.current)} />
                    {passwordErrors.current && <p className="text-red-400 text-xs mt-1">{passwordErrors.current}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{isEN ? "New Password" : "Yeni Şifre"}</label>
                    <input type="password" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} className={inputClass(passwordErrors.next)} />
                    {passwordErrors.next && <p className="text-red-400 text-xs mt-1">{passwordErrors.next}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{isEN ? "Confirm New Password" : "Yeni Şifre Tekrar"}</label>
                    <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className={inputClass(passwordErrors.confirm)} />
                    {passwordErrors.confirm && <p className="text-red-400 text-xs mt-1">{passwordErrors.confirm}</p>}
                  </div>
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                    {isEN ? "Save New Password" : "Yeni Şifreyi Kaydet"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </Section>
        )}

        {/* Hakkında */}
        <Section title={t("about")} delay={0.4}>
          <Row icon="🐾" label={t("appName")} desc={t("appDesc")}>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">v1.0.0</span>
          </Row>
          <Row icon="💾" label={t("storage")} desc={t("storageDesc")}>
            <span className="text-xs text-emerald-400 font-medium">{t("storageLocal")}</span>
          </Row>
          <Row icon="🔒" label={t("privacy")} desc={t("privacyDesc")}>
            <span className="text-xs text-emerald-400 font-medium">{t("privacySecure")}</span>
          </Row>
        </Section>

        {/* Hesabı Sil */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-red-950/20 rounded-2xl border border-red-900 p-6 mb-4">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4">
              {isEN ? "Danger Zone" : "Tehlikeli Bölge"}
            </h3>
            <Row icon="🗑️" label={isEN ? "Delete Account" : "Hesabı Sil"} desc={isEN ? "Permanently delete your account and all data" : "Hesabını ve tüm verilerini kalıcı olarak sil"}>
              <button onClick={() => setShowDeleteForm(!showDeleteForm)} className="text-xs bg-red-950 text-red-400 border border-red-900 px-3 py-1.5 rounded-xl font-medium cursor-pointer hover:bg-red-900 transition-colors">
                {showDeleteForm ? (isEN ? "Cancel" : "İptal") : (isEN ? "Delete" : "Sil")}
              </button>
            </Row>
            <AnimatePresence>
              {showDeleteForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} onSubmit={handleDeleteAccount} className="flex flex-col gap-3 pt-3 overflow-hidden">
                  <div className="p-3 bg-red-950/50 rounded-xl">
                    <p className="text-xs text-red-400 font-medium">
                      ⚠️ {isEN ? "This action is irreversible! All your data will be permanently deleted." : "Bu işlem geri alınamaz! Tüm veriler kalıcı olarak silinecek."}
                    </p>
                  </div>
                  {!user.isGuest && (
                    <div>
                      <label className="block text-xs font-medium text-red-500 mb-1">{isEN ? "Enter your password to confirm" : "Onaylamak için şifreni gir"}</label>
                      <input type="password" value={deletePassword} onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(""); }} className="w-full bg-gray-900 border border-red-800 rounded-xl px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-400" placeholder={isEN ? "Your password" : "Şifren"} />
                      {deleteError && <p className="text-red-400 text-xs mt-1">{deleteError}</p>}
                    </div>
                  )}
                  <button type="submit" className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                    {isEN ? "Yes, Delete My Account" : "Evet, Hesabımı Sil"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;