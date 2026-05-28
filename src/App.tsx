import { useState, lazy, Suspense, useMemo, type ReactNode, type Dispatch, type SetStateAction } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PetProvider } from "./context/PetContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { usePet } from "./hooks/usePet";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/UI/ScrollToTop";
import OnboardingWrapper from "./components/UI/Onboarding";
import GlobalSearch from "./components/UI/GlobalSearch";
import PageTransition from "./components/UI/PageTransition";
import useKeyboard from "./hooks/useKeyboard";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const PetDetailPage = lazy(() => import("./pages/PetDetailPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">{t("loading")}</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}

type TabMemory = Record<string, string>;

function PetDetailWrapper({ tabMemory, setTabMemory }: { tabMemory: TabMemory; setTabMemory: Dispatch<SetStateAction<TabMemory>> }) {
  const { id } = useParams();
  const { pets } = usePet();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-500">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-lg font-medium text-gray-300">
            {t("petNotFound")}
          </p>
          <button onClick={() => navigate("/app")} className="mt-4 text-emerald-400 underline cursor-pointer">
            {t("goHome")}
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PetDetailPage
        key={pet.id}
        pet={pet}
        onBack={() => navigate("/app")}
        initialTab={tabMemory[pet.id] || "records"}
        onTabChange={(tab) => setTabMemory((prev) => ({ ...prev, [pet.id]: tab }))}
      />
    </PageTransition>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [tabMemory, setTabMemory] = useState<TabMemory>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const isLanding = location.pathname === "/";
  const isAuth = location.pathname === "/auth";

  const shortcuts = useMemo<Record<string, () => void>>(() => ({
    "ctrl+k": () => { if (isAuthenticated) setSearchOpen(true); },
    "ctrl+h": () => { if (isAuthenticated) navigate("/app"); },
    "ctrl+,": () => { if (isAuthenticated) navigate("/settings"); },
  }), [isAuthenticated, navigate]);
  useKeyboard(shortcuts);

  return (
    <div className={`min-h-screen bg-gray-950 transition-colors duration-200 ${!isLanding && !isAuth ? "md:pl-56 pt-14 md:pt-0" : ""}`}>
      <ScrollToTop />
      <Navbar searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <main id="main-content">
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
            <Route path="/app" element={
              <ProtectedRoute>
                <PageTransition>
                  <OnboardingWrapper>
                    <HomePage onSelectPet={(pet) => navigate(`/pets/${pet.id}`)} />
                  </OnboardingWrapper>
                </PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/pets/:id" element={
              <ProtectedRoute>
                <PetDetailWrapper tabMemory={tabMemory} setTabMemory={setTabMemory} />
              </ProtectedRoute>
            } />
            <Route path="/stats" element={
              <ProtectedRoute>
                <PageTransition><StatsPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <PageTransition><SettingsPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute>
                <PageTransition><CalendarPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    // reducedMotion="user" → prefers-reduced-motion açıksa Framer Motion
    // hareket animasyonlarını otomatik kısar (erişilebilirlik).
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <PetProvider>
            <AppRoutes />
          </PetProvider>
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
