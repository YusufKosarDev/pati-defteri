import { useState, lazy, Suspense, useCallback } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import { PetProvider, usePet } from "./context/PetContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AnimatePresence } from "framer-motion";
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
const AuthPage = lazy(() => import("./pages/AuthPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Yükleniyor...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}

function PetDetailWrapper({ tabMemory, setTabMemory }) {
  const { id } = useParams();
  const { pets } = usePet();
  const navigate = useNavigate();
  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <PageTransition>
        <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-500">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-lg font-medium text-gray-300">Hayvan bulunamadı.</p>
          <button onClick={() => navigate("/app")} className="mt-4 text-emerald-400 underline cursor-pointer">
            Ana sayfaya dön
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PetDetailPage
        pet={pet}
        onBack={() => navigate("/app")}
        initialTab={tabMemory[id] || "records"}
        onTabChange={(tab) => setTabMemory((prev) => ({ ...prev, [id]: tab }))}
      />
    </PageTransition>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [tabMemory, setTabMemory] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const isLanding = location.pathname === "/";
  const isAuth = location.pathname === "/auth";

  useKeyboard(useCallback({
    "ctrl+k": () => { if (isAuthenticated) setSearchOpen(true); },
    "ctrl+h": () => { if (isAuthenticated) navigate("/app"); },
    "ctrl+,": () => { if (isAuthenticated) navigate("/settings"); },
  }, [isAuthenticated, navigate]));

  return (
    <div className={`min-h-screen bg-gray-950 transition-colors duration-200 ${!isLanding && !isAuth ? "md:pl-56 pt-14 md:pt-0" : ""}`}>
      <ScrollToTop />
      <Navbar searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition><LandingPage /></PageTransition>
            } />
            <Route path="/auth" element={
              <PageTransition><AuthPage /></PageTransition>
            } />
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
            <Route path="*" element={
              <PageTransition><NotFoundPage /></PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PetProvider>
          <AppRoutes />
        </PetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;