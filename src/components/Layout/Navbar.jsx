import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../../context/PetContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const PatiLogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="white">
    <ellipse cx="20" cy="30" rx="10" ry="13"/>
    <ellipse cx="42" cy="20" rx="10" ry="13"/>
    <ellipse cx="64" cy="20" rx="10" ry="13"/>
    <ellipse cx="82" cy="30" rx="10" ry="13"/>
    <path d="M50 45 C25 45 15 60 18 73 C21 85 35 90 50 90 C65 90 79 85 82 73 C85 60 75 45 50 45Z"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = usePet();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = location.pathname === "/";
  const isEN = i18n.language === "en";

  if (isLanding) return null;

  const navLinks = [
    { path: "/app", label: t("myPets"), icon: <HomeIcon /> },
    { path: "/calendar", label: isEN ? "Calendar" : "Takvim", icon: <CalendarIcon /> },
    { path: "/settings", label: t("settings"), icon: <SettingsIcon /> },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("Çıkış yapıldı.");
    navigate("/");
  };

  const avatarColor = user?.isGuest
    ? "bg-gray-600"
    : "bg-emerald-500";

  const userInitial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-gray-950 border-r border-gray-800 z-40">

        {/* Logo */}
        <button
          onClick={() => handleNavigate("/")}
          className="flex items-center gap-3 px-5 py-5 border-b border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <PatiLogo size={18} />
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">{t("appName")}</span>
        </button>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavigate(link.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left relative group ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300"}`}>
                  {link.icon}
                </span>
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Alt — Kullanıcı + Dark Mode */}
        <div className="px-3 py-4 border-t border-gray-800 flex flex-col gap-2">
          {/* Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-all cursor-pointer"
          >
            <span className="text-gray-500">{darkMode ? <SunIcon /> : <MoonIcon />}</span>
            <span>{darkMode ? (isEN ? "Light Theme" : "Açık Tema") : (isEN ? "Dark Theme" : "Karanlık Tema")}</span>
          </button>

          {/* Kullanıcı */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800">
              <div className={`w-7 h-7 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-200 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user.isGuest ? (isEN ? "Guest" : "Misafir") : user.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                title={isEN ? "Logout" : "Çıkış Yap"}
              >
                <LogoutIcon />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobil Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-950 border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => handleNavigate("/")} className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <PatiLogo size={14} />
            </div>
            <span className="text-white font-semibold text-sm">{t("appName")}</span>
          </button>

          <div className="flex items-center gap-2">
            {user && (
              <div className={`w-7 h-7 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer`}>
                {userInitial}
              </div>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-all cursor-pointer"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white transition-all cursor-pointer"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobil Menü */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-64 z-50 md:hidden bg-gray-950 border-r border-gray-800 flex flex-col"
            >
              <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <PatiLogo size={18} />
                </div>
                <span className="text-white font-semibold text-sm">{t("appName")}</span>
              </div>

              <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.button
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => handleNavigate(link.path)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-left ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                      }`}
                    >
                      <span className={isActive ? "text-emerald-400" : "text-gray-500"}>
                        {link.icon}
                      </span>
                      {link.label}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Mobil Kullanıcı */}
              {user && (
                <div className="px-3 py-4 border-t border-gray-800">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-800">
                    <div className={`w-7 h-7 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-200 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.isGuest ? (isEN ? "Guest" : "Misafir") : user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <LogoutIcon />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;