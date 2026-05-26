import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "convex/react";
import { usePet } from "../hooks/usePet";
import { useAuth } from "../hooks/useAuth";
import useNotifications from "../hooks/useNotifications";
import useEmailReminder from "../hooks/useEmailReminder";
import usePageTitle from "../hooks/usePageTitle";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import ConfirmModal from "../components/UI/ConfirmModal";

function Section({ title, children, delay = 0 }) {
  return (
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
}

function Row({ icon, label, desc, children }) {
  return (
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
}

function SettingsPage() {
  const { pets, records, weights, language, setLanguage } = usePet();
  const { user, updateProfile, changePassword, deleteAccount, upgradeGuest } = useAuth();
  const replaceAll = useMutation(api.backup.replaceAll);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { permission, requestPermission, sendTest, isSupported, isConfigured, isReady } = useNotifications();
  const { sendReminderEmail, hasReminders } = useEmailReminder(records);
  const isEN = i18n.language === "en";

  usePageTitle(isEN ? "Settings" : "Ayarlar");

  const [dragOver, setDragOver] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Şifre değiştirme
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);

  // Misafir → hesap yükseltme
  const [upgradeForm, setUpgradeForm] = useState({ name: user?.name || "", email: "", password: "" });
  const [upgradeBusy, setUpgradeBusy] = useState(false);

  // Hesap silme
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.next) {
      toast.error(isEN ? "Fill in all fields." : "Tüm alanları doldurun.");
      return;
    }
    if (pwForm.next.length < 6) {
      toast.error(isEN ? "New password must be at least 6 characters." : "Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error(isEN ? "Passwords don't match." : "Şifreler eşleşmiyor.");
      return;
    }
    setPwBusy(true);
    try {
      const res = await changePassword(pwForm.current, pwForm.next);
      if (res.success) {
        toast.success(isEN ? "Password changed!" : "Şifre değiştirildi!");
        setPwForm({ current: "", next: "", confirm: "" });
      } else {
        toast.error(res.error);
      }
    } finally {
      setPwBusy(false);
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeForm.name.trim() || !upgradeForm.email.trim() || !upgradeForm.password) {
      toast.error(isEN ? "Fill in all fields." : "Tüm alanları doldurun.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(upgradeForm.email)) {
      toast.error(isEN ? "Enter a valid email." : "Geçerli bir e-posta girin.");
      return;
    }
    if (upgradeForm.password.length < 6) {
      toast.error(isEN ? "Password must be at least 6 characters." : "Şifre en az 6 karakter olmalı.");
      return;
    }
    setUpgradeBusy(true);
    try {
      const res = await upgradeGuest(upgradeForm.name, upgradeForm.email, upgradeForm.password);
      if (res.success) {
        toast.success(isEN ? "Account created — your data is saved! 🎉" : "Hesap oluşturuldu — verileriniz korundu! 🎉");
      } else {
        toast.error(res.error);
      }
    } finally {
      setUpgradeBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteBusy(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        toast.success(isEN ? "Account deleted." : "Hesap silindi.");
        navigate("/");
      } else {
        toast.error(res.error);
      }
    } finally {
      setDeleteBusy(false);
      setDeleteConfirm(false);
    }
  };

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      toast.error(isEN ? "Your browser doesn't support push notifications." : "Tarayıcınız push bildirimlerini desteklemiyor.");
      return;
    }
    if (!isConfigured) {
      toast.error(isEN ? "Push notifications are not configured on the server." : "Sunucuda push bildirimleri yapılandırılmamış.");
      return;
    }
    if (permission === "denied") {
      toast.error(isEN ? "Reset permission from browser settings." : "Tarayıcı ayarlarından izni sıfırlayın.");
      return;
    }
    if (permission === "granted") { toast(t("pushNotificationsDesc"), { icon: "ℹ️" }); return; }
    const result = await requestPermission();
    if (result === "granted") {
      toast.success(t("toastNotificationOn"));
    } else {
      toast.error(t("toastNotificationDenied"));
    }
  };

  const handleTestNotification = async () => {
    if (permission !== "granted") {
      toast.error(isEN ? "Enable notifications first!" : "Önce bildirim iznini açın!");
      return;
    }
    try {
      const res = await sendTest();
      if (res?.sent > 0) {
        toast.success(t("toastTestSent"));
      } else {
        toast.error(isEN ? "Push could not be delivered." : "Push iletilmedi.");
      }
    } catch (err) {
      console.error(err);
      toast.error(isEN ? "Push failed." : "Push başarısız.");
    }
  };

  const handleSendReminderEmail = async () => {
    setSendingEmail(true);
    try {
      const result = await sendReminderEmail();
      if (result.success) {
        toast.success(isEN ? "Reminder email sent! 📧" : "Hatırlatıcı email gönderildi! 📧");
      } else {
        toast.error(result.error);
      }
    } finally {
      setSendingEmail(false);
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
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.pets || !data.records) { toast.error(t("toastBackupError")); return; }

        const petsArg = (data.pets || []).map((p) => ({
          legacyId: String(p.id ?? p._id ?? ""),
          name: p.name,
          type: p.type,
          breed: p.breed || undefined,
          birthDate: p.birthDate || undefined,
          photo: p.photo || undefined,
          notes: p.notes || undefined,
          vets: p.vets ?? (p.vet ? [p.vet] : undefined),
        }));
        const recordsArg = (data.records || []).map((r) => ({
          legacyPetId: String(r.petId),
          type: r.type,
          date: r.date,
          nextDate: r.nextDate || undefined,
          notes: r.notes || undefined,
        }));
        const weightsArg = (data.weights || []).map((w) => ({
          legacyPetId: String(w.petId),
          weight: String(w.weight),
          date: w.date,
          notes: w.notes || undefined,
        }));

        const result = await replaceAll({ pets: petsArg, records: recordsArg, weights: weightsArg });
        toast.success(`${result.pets} ${t("toastBackupImported")}`);
      } catch (err) {
        console.error(err);
        toast.error(t("toastBackupReadError"));
      }
    };
    reader.readAsText(file);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    await updateProfile(newName.trim());
    setEditingName(false);
    toast.success(isEN ? "Name updated!" : "İsim güncellendi!");
  };

  const notificationLabel = { granted: t("notificationGranted"), denied: t("notificationDenied"), default: t("notificationDefault") }[permission];
  const stats = [
    { icon: "🐾", label: t("backupPets"), count: pets.length },
    { icon: "💉", label: t("backupRecords"), count: records.length },
    { icon: "⚖️", label: t("backupWeights"), count: weights.length },
  ];
  const avatarColor = user?.isGuest ? "bg-gray-500" : "bg-emerald-500";

  return (
    <div className="min-h-screen bg-gray-950">
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
              <div className="mt-3 p-4 bg-yellow-950/30 border border-yellow-900 rounded-xl">
                <p className="text-xs text-yellow-400 mb-3">
                  ⚠️ {isEN
                    ? "You're a guest. Create an account to keep your data permanently and access it from any device — your current pets and records will be transferred."
                    : "Misafir kullanıyorsunuz. Verilerinizi kalıcı tutmak ve her cihazdan erişmek için hesap oluşturun — mevcut hayvan ve kayıtlarınız taşınır."}
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    value={upgradeForm.name}
                    onChange={(e) => setUpgradeForm({ ...upgradeForm, name: e.target.value })}
                    placeholder={isEN ? "Name" : "İsim"}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="email"
                    value={upgradeForm.email}
                    onChange={(e) => setUpgradeForm({ ...upgradeForm, email: e.target.value })}
                    placeholder={isEN ? "Email" : "E-posta"}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="password"
                    value={upgradeForm.password}
                    onChange={(e) => setUpgradeForm({ ...upgradeForm, password: e.target.value })}
                    placeholder={isEN ? "Password (min 6 chars)" : "Şifre (en az 6 karakter)"}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleUpgrade}
                    disabled={upgradeBusy}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                  >
                    {upgradeBusy ? (isEN ? "Creating..." : "Oluşturuluyor...") : (isEN ? "⬆️ Upgrade to Account" : "⬆️ Hesaba Yükselt")}
                  </button>
                </div>
              </div>
            )}

            {!user.isGuest && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {isEN ? "Change Password" : "Şifre Değiştir"}
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="password"
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    placeholder={isEN ? "Current password" : "Mevcut şifre"}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="password"
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    placeholder={isEN ? "New password (min 6 chars)" : "Yeni şifre (en az 6 karakter)"}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    placeholder={isEN ? "Confirm new password" : "Yeni şifre tekrar"}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleChangePassword}
                    disabled={pwBusy}
                    className="self-start bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors border border-gray-700"
                  >
                    {pwBusy ? (isEN ? "Saving..." : "Kaydediliyor...") : (isEN ? "🔒 Change Password" : "🔒 Şifreyi Değiştir")}
                  </button>
                </div>
              </div>
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
          {!isReady && (
            <div className="mb-3 p-3 bg-yellow-950/30 border border-yellow-900 rounded-xl text-xs text-yellow-400">
              ⚠️ {!isSupported
                ? (isEN ? "Your browser doesn't support push notifications." : "Tarayıcınız push bildirimlerini desteklemiyor.")
                : (isEN ? "Push notifications are not configured on the server (VAPID key missing)." : "Sunucuda push bildirimleri yapılandırılmamış (VAPID anahtarı eksik).")}
            </div>
          )}
          <Row icon="🔔" label={t("pushNotifications")} desc={t("pushNotificationsDesc")}>
            <button
              onClick={handleNotificationToggle}
              disabled={!isReady}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${!isReady ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${permission === "granted" ? "bg-emerald-500" : "bg-gray-700"}`}
            >
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
                ? "Send a reminder email to your account address for upcoming and overdue care."
                : "Yaklaşan ve gecikmiş bakımlar için hesap e-posta adresinize hatırlatıcı gönderin."}
            </p>
            {user?.email ? (
              <>
                <div className="flex items-center justify-between gap-3 bg-gray-800 rounded-xl px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{isEN ? "Will be sent to" : "Gönderilecek adres"}</p>
                    <p className="text-sm text-gray-100 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSendReminderEmail}
                    disabled={sendingEmail || !hasReminders()}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    📧 {sendingEmail ? (isEN ? "Sending..." : "Gönderiliyor...") : (isEN ? "Send" : "Gönder")}
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
              </>
            ) : (
              <div className="p-3 bg-yellow-950/30 border border-yellow-900 rounded-xl text-xs text-yellow-400">
                ⚠️ {isEN
                  ? "Email reminders require a registered account with an email address."
                  : "E-posta hatırlatıcısı için e-posta adresli kayıtlı bir hesap gerekir."}
              </div>
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

        {/* Tehlikeli Bölge — Hesap Silme */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-gray-900 rounded-2xl border border-red-900/50 p-6 mb-4"
          >
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4">
              {isEN ? "Danger Zone" : "Tehlikeli Bölge"}
            </h3>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-100 text-sm">{isEN ? "Delete Account" : "Hesabı Sil"}</div>
                <div className="text-xs text-gray-500">
                  {isEN
                    ? "Permanently deletes your account and all data. This cannot be undone."
                    : "Hesabınızı ve tüm verilerinizi kalıcı olarak siler. Geri alınamaz."}
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(true)}
                disabled={deleteBusy}
                className="bg-red-950 hover:bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 border border-red-900 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors flex-shrink-0"
              >
                🗑️ {isEN ? "Delete" : "Sil"}
              </button>
            </div>
          </motion.div>
        )}

      </div>

      <ConfirmModal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title={isEN ? "Delete account?" : "Hesabı sil?"}
        desc={isEN
          ? "Your account and ALL pets, records and weights will be permanently deleted. This cannot be undone."
          : "Hesabınız ve TÜM hayvan, kayıt ve ağırlık verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz."}
        confirmText={isEN ? "Delete Account" : "Hesabı Sil"}
      />
    </div>
  );
}

export default SettingsPage;