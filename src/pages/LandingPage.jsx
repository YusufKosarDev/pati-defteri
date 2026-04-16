import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";

function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage } = usePet();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const features = [
    { icon: "💉", title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: "🪱", title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: "⚖️", title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: "📄", title: t("feature4Title"), desc: t("feature4Desc") },
    { icon: "🔔", title: t("feature5Title"), desc: t("feature5Desc") },
    { icon: "🌙", title: t("feature6Title"), desc: t("feature6Desc") },
  ];

  const testimonials = [
    {
      name: "Ayşe K.",
      pet: language === "tr" ? "Pamuk'un annesi 🐱" : "Pamuk's mom 🐱",
      text: language === "tr"
        ? "Pamuk'un aşılarını hiç unutmuyorum artık. Veteriner bile hayran kaldı kayıtlarıma!"
        : "I never forget Pamuk's vaccines anymore. Even the vet was impressed by my records!",
    },
    {
      name: "Mehmet T.",
      pet: language === "tr" ? "Karamel'in babası 🐶" : "Karamel's dad 🐶",
      text: language === "tr"
        ? "3 köpeğim var, hepsini ayrı ayrı takip ediyorum. Hayat kurtarıcı uygulama."
        : "I have 3 dogs and track them all separately. Life-saving app.",
    },
    {
      name: "Zeynep A.",
      pet: language === "tr" ? "Minnoş'un sahibi 🐱" : "Minnoş's owner 🐱",
      text: language === "tr"
        ? "PDF özelliği muhteşem. Veterinere gittiğimde her şey hazır oluyor."
        : "The PDF feature is amazing. Everything is ready when I go to the vet.",
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#FAFAF7] overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[#E8E8E0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 100 100" fill="white">
                <ellipse cx="20" cy="30" rx="10" ry="13"/>
                <ellipse cx="42" cy="20" rx="10" ry="13"/>
                <ellipse cx="64" cy="20" rx="10" ry="13"/>
                <ellipse cx="82" cy="30" rx="10" ry="13"/>
                <path d="M50 45 C25 45 15 60 18 73 C21 85 35 90 50 90 C65 90 79 85 82 73 C85 60 75 45 50 45Z"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-[#2D2D2D]">
              {t("appName")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {["tr", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    language === lang
                      ? "bg-[#2D2D2D] text-white"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {lang === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate("/app")}
              className="bg-[#2D2D2D] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#444] transition-colors cursor-pointer"
            >
              {t("enterApp")}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {t("landingBadge")}
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-5xl md:text-7xl font-bold text-[#2D2D2D] leading-tight mb-6">
            {t("landingTitle1")}{" "}
            <span className="italic text-emerald-600">
              {t("landingTitle2")}
            </span>
          </h1>

          <p className="text-lg text-[#666] max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landingDesc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/app")}
              className="bg-[#2D2D2D] text-white px-8 py-4 rounded-2xl text-base font-medium hover:bg-[#444] transition-all hover:scale-105 cursor-pointer shadow-lg"
            >
              {t("landingCTA")}
            </button>
            <span className="text-sm text-[#999]">{t("landingNoAccount")}</span>
          </div>
        </div>

        {/* Mock UI */}
        <div className="max-w-2xl mx-auto mt-16 relative">
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E8E0] overflow-hidden">
            <div className="bg-emerald-500 px-6 py-4 flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 100 100" fill="white">
                  <ellipse cx="20" cy="30" rx="10" ry="13"/>
                  <ellipse cx="42" cy="20" rx="10" ry="13"/>
                  <ellipse cx="64" cy="20" rx="10" ry="13"/>
                  <ellipse cx="82" cy="30" rx="10" ry="13"/>
                  <path d="M50 45 C25 45 15 60 18 73 C21 85 35 90 50 90 C65 90 79 85 82 73 C85 60 75 45 50 45Z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-sm">{t("appName")}</div>
                <div className="text-emerald-100 text-xs">{t("appDesc")}</div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>⏰</span>
                  <span className="font-bold text-yellow-700 text-sm">
                    2 {t("upcomingTitle")}
                  </span>
                </div>
                <div className="text-xs text-yellow-600">• Pamuk — {t("feature1Title")} (5 {t("daysLeft")})</div>
                <div className="text-xs text-yellow-600 mt-1">• Karamel — {t("feature2Title")} (12 {t("daysLeft")})</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Pamuk", type: language === "tr" ? "Kedi" : "Cat", age: language === "tr" ? "2 yaşında" : "2 years old", color: "bg-purple-400" },
                  { name: "Karamel", type: language === "tr" ? "Köpek · Golden" : "Dog · Golden", age: language === "tr" ? "4 yaşında" : "4 years old", color: "bg-amber-400" },
                ].map((pet) => (
                  <div key={pet.name} className="bg-gray-50 rounded-2xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 ${pet.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                        {pet.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{pet.name}</div>
                        <div className="text-xs text-gray-400">{pet.type}</div>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-600 font-medium">{pet.age}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-[#2D2D2D] mb-4">
              {t("landingFeaturesTitle")}
            </h2>
            <p className="text-[#666]">{t("landingFeaturesDesc")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-[#FAFAF7] rounded-3xl p-6 border border-[#E8E8E0] hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-[#2D2D2D] text-lg mb-2">{f.title}</h3>
                <p className="text-[#777] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-[#2D2D2D] mb-4">
              {t("landingTestimonialsTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div key={item.name} className="bg-white rounded-3xl p-6 border border-[#E8E8E0] shadow-sm">
                <p className="text-[#444] text-sm leading-relaxed mb-6">"{item.text}"</p>
                <div>
                  <div className="font-bold text-[#2D2D2D] text-sm">{item.name}</div>
                  <div className="text-[#999] text-xs">{item.pet}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#2D2D2D] rounded-3xl p-12">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <svg width="28" height="28" viewBox="0 0 100 100" fill="white">
                <ellipse cx="20" cy="30" rx="10" ry="13"/>
                <ellipse cx="42" cy="20" rx="10" ry="13"/>
                <ellipse cx="64" cy="20" rx="10" ry="13"/>
                <ellipse cx="82" cy="30" rx="10" ry="13"/>
                <path d="M50 45 C25 45 15 60 18 73 C21 85 35 90 50 90 C65 90 79 85 82 73 C85 60 75 45 50 45Z"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-white mb-4">
              {t("landingCTATitle")}
            </h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              {t("landingCTADesc")}
            </p>
            <button
              onClick={() => navigate("/app")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-medium transition-all hover:scale-105 cursor-pointer"
            >
              {t("landingCTAButton")}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E0] py-8 px-6 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 100 100" fill="white">
                <ellipse cx="20" cy="30" rx="10" ry="13"/>
                <ellipse cx="42" cy="20" rx="10" ry="13"/>
                <ellipse cx="64" cy="20" rx="10" ry="13"/>
                <ellipse cx="82" cy="30" rx="10" ry="13"/>
                <path d="M50 45 C25 45 15 60 18 73 C21 85 35 90 50 90 C65 90 79 85 82 73 C85 60 75 45 50 45Z"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-[#2D2D2D]">{t("appName")}</span>
          </div>
          <p className="text-[#999] text-sm">{t("landingFooter")}</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;