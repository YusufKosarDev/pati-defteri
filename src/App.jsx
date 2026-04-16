import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { PetProvider, usePet } from "./context/PetContext";
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/UI/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import PetDetailPage from "./pages/PetDetailPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import OnboardingWrapper from "./components/UI/Onboarding";

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

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200 ${!isLanding ? "md:pl-56 pt-14 md:pt-0" : ""}`}>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={
          <OnboardingWrapper>
            <HomePage onSelectPet={(pet) => navigate(`/pets/${pet.id}`)} />
          </OnboardingWrapper>
        } />
        <Route path="/pets/:id" element={
          <PetDetailWrapper tabMemory={tabMemory} setTabMemory={setTabMemory} />
        } />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PetProvider>
        <AppRoutes />
      </PetProvider>
    </BrowserRouter>
  );
}

export default App;