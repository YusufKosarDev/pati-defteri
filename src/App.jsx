import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { PetProvider, usePet } from "./context/PetContext";
import Navbar from "./components/Layout/Navbar";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import PetDetailPage from "./pages/PetDetailPage";
import SettingsPage from "./pages/SettingsPage";
import BackupPage from "./pages/BackupPage";
import NotFoundPage from "./pages/NotFoundPage";
import OnboardingWrapper from "./components/UI/Onboarding";

function PetDetailWrapper() {
  const { id } = useParams();
  const { pets } = usePet();
  const navigate = useNavigate();
  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400 dark:text-gray-500">
        <div className="text-6xl mb-4">🐾</div>
        <p className="text-lg font-medium">Hayvan bulunamadı.</p>
        <button onClick={() => navigate("/app")} className="mt-4 text-emerald-500 underline cursor-pointer">
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  return <PetDetailPage pet={pet} onBack={() => navigate("/app")} />;
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={
          <OnboardingWrapper>
            <HomePage onSelectPet={(pet) => navigate(`/pets/${pet.id}`)} />
          </OnboardingWrapper>
        } />
        <Route path="/pets/:id" element={<PetDetailWrapper />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/backup" element={<BackupPage />} />
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