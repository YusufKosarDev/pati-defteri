import { useNavigate, useLocation } from "react-router-dom";
import { usePet } from "../../context/PetContext";
import { useTranslation } from "react-i18next";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = usePet();
  const { t } = useTranslation();
  const isLanding = location.pathname === "/";

  if (isLanding) return null;

  const navLinks = [
    { path: "/app", label: `🐾 ${t("myPets")}` },
    { path: "/backup", label: `💾 ${t("backup")}` },
    { path: "/settings", label: `⚙️ ${t("settings")}` },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 hidden sm:block">{t("appName")}</span>
          </button>
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  location.pathname === link.path
                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;