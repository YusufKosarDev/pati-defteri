import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import { PetProvider, usePet } from "./context/PetContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/UI/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import PetDetailPage from "./pages/PetDetailPage";
import SettingsPage from "./pages/SettingsPage";
import CalendarPage from "./pages/CalendarPage";
import AuthPage from "./pages/AuthPage";
import NotFoundPage from "./pages/NotFoundPage";
import OnboardingWrapper from "./components/UI/Onboarding";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

function PetDetailWrapper({ tabMemory, setTabMemory }) {
  const { id } = useParams();
  const { pets } = usePet();
  const navigate = useNavigate();
  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-400 dark:text-gray-500">
        <div className="text-6xl mb-4">🐾</div>
        <p className="text-lg font-medium">Hayvan bulunamadı.</p>
        <button onClick={() => navigate("/app")} className="mt-4 text-emerald-500 underline cursor-pointer">
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  return (
    <PetDetailPage
      pet={pet}
      onBack={() => navigate("/app")}
      initialTab={tabMemory[id] || "records"}
      onTabChange={(tab) => setTabMemory((prev) => ({ ...prev, [id]: tab }))}
    />
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabMemory, setTabMemory] = useState({});
  const isLanding = location.pathname === "/";
  const isAuth = location.pathname === "/auth";

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 ${!isLanding && !isAuth ? "md:pl-56 pt-14 md:pt-0" : ""}`}>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <OnboardingWrapper>
              <HomePage onSelectPet={(pet) => navigate(`/pets/${pet.id}`)} />
            </OnboardingWrapper>
          </ProtectedRoute>
        } />
        <Route path="/pets/:id" element={
          <ProtectedRoute>
            <PetDetailWrapper tabMemory={tabMemory} setTabMemory={setTabMemory} />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
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