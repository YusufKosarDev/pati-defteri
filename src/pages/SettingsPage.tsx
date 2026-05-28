import { useState, type ReactNode } from "react";
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
import { captureException } from "../lib/sentry";

function Section({ title, children, delay = 0 }: { title: ReactNode; children: ReactNode; delay?: number }) {
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

function Row({ icon, label, desc, children }: { icon: ReactNode; label: ReactNode; desc?: ReactNode; children?: ReactNode }) {
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
  const { t } = useTranslation();
  const { permission, requestPermission, sendTest, isSupported, isConfigured, isReady } = useNotifications();
  const { sendReminderEmail, hasReminders } = useEmailReminder(records);

  usePageTitle(t("settings"));

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
      toast.error(t("upgradeFillFields"));
      return;
    }
    if (pwForm.next.length < 6) {
      toast.error(t("changePasswordNewTooShort"));
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error(t("authPasswordMismatch"));
      return;
    }
    setPwBusy(true);
    try {
      const res = await changePassword(pwForm.current, pwForm.next);
      if (res.success) {
        toast.success(t("changePasswordSuccess"));
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
      toast.error(t("upgradeFillFields"));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(upgradeForm.email)) {
      toast.error(t("authEmailInvalid"));
      return;
    }
    if (upgradeForm.password.length < 6) {
      toast.error(t("authPasswordTooShort"));
      return;
    }
    setUpgradeBusy(true);
    try {
      const res = await upgradeGuest(upgradeForm.name, upgradeForm.email, upgradeForm.password);
      if (res.success) {
        toast.success(t("upgradeSuccess"));
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
        toast.success(t("deleteAccountSuccess"));
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
      toast.error(t("notifNotSupported"));
      return;
    }
    if (!isConfigured) {
      toast.error(t("notifNotConfigured"));
      return;
    }
    if (permission === "denied") {
      toast.error(t("notifResetPermission"));
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
      toast.error(t("notifEnableFirst"));
      return;
    }
    try {
      const res = await sendTest();
      if (res?.sent > 0) {
        toast.success(t("toastTestSent"));
      } else {
        toast.error(t("notifNotDelivered"));
      }
    } catch (err) {
      captureException(err);
      toast.error(t("notifFailed"));
    }
  };

  const handleSendReminderEmail = async () => {
    setSendingEmail(true);
    try {
      const result = await sendReminderEmail();
      if (result.success) {
        toast.success(t("emailSent"));
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

  const handleImport = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.pets || !data.records) { toast.error(t("toastBackupError")); return; }

        const petsArg = (data.pets || []).map((p: Record<string, unknown>) => ({
          legacyId: String(p.id ?? p._id ?? ""),
          name: p.name,
          type: p.type,
          breed: p.breed || undefined,
          birthDate: p.birthDate || undefined,
          photo: p.photo || undefined,
          notes: p.notes || undefined,
          vets: p.vets ?? (p.vet ? [p.vet] : undefined),
        }));
        const recordsArg = (data.records || []).map((r: Record<string, unknown>) => ({
          legacyPetId: String(r.petId),
          type: r.type,
          date: r.date,
          nextDate: r.nextDate || undefined,
          notes: r.notes || undefined,
        }));
        const weightsArg = (data.weights || []).map((w: Record<string, unknown>) => ({
          legacyPetId: String(w.petId),
          weight: String(w.weight),
          date: w.date,
          notes: w.notes || undefined,
        }));

        const result = await replaceAll({ pets: petsArg, records: recordsArg, weights: weightsArg });
        toast.success(`${result.pets} ${t("toastBackupImported")}`);
      } catch (err) {
        captureException(err);
        toast.error(t("toastBackupReadError"));
      }
    };
    reader.readAsText(file);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    await updateProfile(newName.trim());
    setEditingName(false);
    toast.success(t("settingsNameUpdated"));
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
          <Section title={t("settingsProfile")} delay={0.05}>
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
                      {t("settingsSave")}
                    </button>
                    <button onClick={() => { setEditingName(false); setNewName(user.name); }} className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer">
                      {t("settingsCancel")}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-gray-100 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.isGuest ? t("settingsGuestUser") : user.email}</p>
                    </div>
                    {!user.isGuest && (
                      <button onClick={() => setEditingName(true)} className="ml-2 text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer font-medium">
                        {t("settingsEdit")}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {user.isGuest && (
                <span className="text-xs bg-yellow-950 text-yellow-400 px-2 py-1 rounded-full font-medium">
                  {t("settingsGuest")}
                </span>
              )}
            </div>

            {user.isGuest && (
              <div className="mt-3 p-4 bg-yellow-950/30 border border-yellow-900 rounded-xl">
                <p className="text-xs text-yellow-400 mb-3">{t("upgradeGuestNotice")}</p>
                <div className="flex flex-col gap-2">
                  <input
                    value={upgradeForm.name}
                    onChange={(e) => setUpgradeForm({ ...upgradeForm, name: e.target.value })}
                    placeholder={t("upgradeName")}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="email"
                    value={upgradeForm.email}
                    onChange={(e) => setUpgradeForm({ ...upgradeForm, email: e.target.value })}
                    placeholder={t("upgradeEmail")}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="password"
                    value={upgradeForm.password}
                    onChange={(e) => setUpgradeForm({ ...upgradeForm, password: e.target.value })}
                    placeholder={t("upgradePassword")}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleUpgrade}
                    disabled={upgradeBusy}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                  >
                    {upgradeBusy ? t("upgradeCreating") : t("upgradeButton")}
                  </button>
                </div>
              </div>
            )}

            {!user.isGuest && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t("changePasswordTitle")}
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="password"
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    placeholder={t("changePasswordCurrent")}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="password"
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    placeholder={t("changePasswordNew")}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    placeholder={t("changePasswordConfirm")}
                    className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    onClick={handleChangePassword}
                    disabled={pwBusy}
                    className="self-start bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors border border-gray-700"
                  >
                    {pwBusy ? t("changePasswordSaving") : t("changePasswordButton")}
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
              ⚠️ {!isSupported ? t("notifNotSupported") : t("notifNotConfiguredVapid")}
            </div>
          )}
          <Row icon="🔔" label={t("pushNotifications")} desc={t("pushNotificationsDesc")}>
            <button
              onClick={handleNotificationToggle}
              disabled={!isReady}
              role="switch"
              aria-checked={permission === "granted"}
              aria-label={t("pushNotifications")}
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
        <Section title={t("emailRemindersTitle")} delay={0.25}>
          <div className="py-2">
            <p className="text-sm text-gray-400 mb-4">{t("emailRemindersDesc")}</p>
            {user?.email ? (
              <>
                <div className="flex items-center justify-between gap-3 bg-gray-800 rounded-xl px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">{t("emailWillBeSentTo")}</p>
                    <p className="text-sm text-gray-100 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSendReminderEmail}
                    disabled={sendingEmail || !hasReminders()}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    📧 {sendingEmail ? t("emailSending") : t("emailSend")}
                  </button>
                </div>
                {hasReminders() ? (
                  <p className="text-xs text-emerald-400 mt-2">{t("emailHasReminders")}</p>
                ) : (
                  <p className="text-xs text-gray-600 mt-2">{t("emailNoReminders")}</p>
                )}
              </>
            ) : (
              <div className="p-3 bg-yellow-950/30 border border-yellow-900 rounded-xl text-xs text-yellow-400">
                {t("emailRequiresAccount")}
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
                <input type="file" accept=".json" className="hidden" onChange={(e) => handleImport(e.target.files?.[0])} />
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
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-4">{t("dangerZone")}</h3>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-gray-100 text-sm">{t("deleteAccount")}</div>
                <div className="text-xs text-gray-500">{t("deleteAccountDesc")}</div>
              </div>
              <button
                onClick={() => setDeleteConfirm(true)}
                disabled={deleteBusy}
                className="bg-red-950 hover:bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 border border-red-900 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors flex-shrink-0"
              >
                🗑️ {t("delete")}
              </button>
            </div>
          </motion.div>
        )}

      </div>

      <ConfirmModal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title={t("deleteAccountConfirmTitle")}
        desc={t("deleteAccountConfirmDesc")}
        confirmText={t("deleteAccountConfirmBtn")}
      />
    </div>
  );
}

export default SettingsPage;
