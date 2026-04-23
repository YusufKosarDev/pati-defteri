import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePet } from "../context/PetContext";
import usePageTitle from "../hooks/usePageTitle";

// Scroll animasyonu için hook
function useScrollAnimation(threshold = 0.2) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold });
  return [ref, isInView];
}

// Sayaç animasyonu
function AnimatedCounter({ target, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, isInView] = useScrollAnimation(0.5);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// PatiLogo
const PatiLogo = ({ size = 24, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill={color}>
    <ellipse cx="20" cy="30" rx="10" ry="13"/>
    <ellipse cx="42" cy="20" rx="10" ry="13"/>
    <ellipse cx="64" cy="20" rx="10" ry="13"/>
    <ellipse cx="82" cy="30" rx="10" ry="13"/>
    <path d="M50 45 C25 45 15 60 18 73 C21 85 35 90 50 90 C65 90 79 85 82 73 C85 60 75 45 50 45Z"/>
  </svg>
);

function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, setLanguage } = usePet();
  const [activeFeature, setActiveFeature] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  usePageTitle(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  // Otomatik feature değiştirme
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: "💉", title: t("feature1Title"), desc: t("feature1Desc"), color: "from-emerald-400 to-teal-500" },
    { icon: "🪱", title: t("feature2Title"), desc: t("feature2Desc"), color: "from-blue-400 to-indigo-500" },
    { icon: "⚖️", title: t("feature3Title"), desc: t("feature3Desc"), color: "from-violet-400 to-purple-500" },
    { icon: "📄", title: t("feature4Title"), desc: t("feature4Desc"), color: "from-orange-400 to-rose-500" },
    { icon: "🔔", title: t("feature5Title"), desc: t("feature5Desc"), color: "from-pink-400 to-rose-500" },
    { icon: "🌙", title: t("feature6Title"), desc: t("feature6Desc"), color: "from-cyan-400 to-sky-500" },
  ];

  const stats = [
    { value: 500, suffix: "+", label: language === "tr" ? "Mutlu Kullanıcı" : "Happy Users" },
    { value: 2000, suffix: "+", label: language === "tr" ? "Aşı Kaydı" : "Vaccine Records" },
    { value: 1200, suffix: "+", label: language === "tr" ? "Evcil Hayvan" : "Pets Tracked" },
    { value: 100, suffix: "%", label: language === "tr" ? "Ücretsiz" : "Free" },
  ];

  const testimonials = [
    {
      name: "Ayşe K.",
      pet: language === "tr" ? "Pamuk'un annesi 🐱" : "Pamuk's mom 🐱",
      text: language === "tr"
        ? "Pamuk'un aşılarını hiç unutmuyorum artık. Veteriner bile kayıtlarıma hayran kaldı!"
        : "I never forget Pamuk's vaccines anymore. Even the vet was impressed by my records!",
      rating: 5,
    },
    {
      name: "Mehmet T.",
      pet: language === "tr" ? "Karamel'in babası 🐶" : "Karamel's dad 🐶",
      text: language === "tr"
        ? "3 köpeğim var, hepsini ayrı ayrı takip ediyorum. Hayat kurtarıcı uygulama."
        : "I have 3 dogs and track them all separately. Life-saving app.",
      rating: 5,
    },
    {
      name: "Zeynep A.",
      pet: language === "tr" ? "Minnoş'un sahibi 🐱" : "Minnoş's owner 🐱",
      text: language === "tr"
        ? "PDF özelliği muhteşem. Veterinere gittiğimde her şey hazır oluyor."
        : "The PDF feature is amazing. Everything is ready when I go to the vet.",
      rating: 5,
    },
  ];

  const [heroRef, heroInView] = useScrollAnimation(0.1);
  const [statsRef, statsInView] = useScrollAnimation(0.2);
  const [featuresRef, featuresInView] = useScrollAnimation(0.1);
  const [testimonialsRef, testimonialsInView] = useScrollAnimation(0.1);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#FAFAF7] overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-[#E8E8E0]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <PatiLogo size={16} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-[#2D2D2D]">
              {t("appName")}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="hidden sm:flex gap-1">
              {["tr", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    language === lang ? "bg-[#2D2D2D] text-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {lang === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate("/auth")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
            >
              {t("enterApp")}
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Arka plan dekorasyon */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-32 h-32 bg-pink-100 rounded-full blur-2xl opacity-30 pointer-events-none" />

        {/* Yüzen pati ikonları */}
        {["🐾", "🐱", "🐶", "💉", "🎂", "⚖️"].map((icon, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl pointer-events-none select-none opacity-20"
            style={{
              left: `${10 + (i * 15)}%`,
              top: `${15 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {icon}
          </motion.div>
        ))}

        <div ref={heroRef} className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {t("landingBadge")}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-5xl md:text-7xl font-bold text-[#2D2D2D] leading-tight mb-6"
          >
            {t("landingTitle1")}{" "}
            <span className="italic text-emerald-600 relative">
              {t("landingTitle2")}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={heroInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-200 rounded-full origin-left"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-[#666] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t("landingDesc")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate("/auth")}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#2D2D2D] text-white px-8 py-4 rounded-2xl text-base font-medium transition-all cursor-pointer shadow-lg"
            >
              {t("landingCTA")} →
            </motion.button>
            <span className="text-sm text-[#999]">{t("landingNoAccount")}</span>
          </motion.div>
        </div>

        {/* App Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl mx-auto mt-16 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-b from-emerald-100/50 to-transparent rounded-3xl blur-xl" />
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E8E8E0] overflow-hidden relative">
            {/* App header */}
            <div className="bg-emerald-500 px-6 py-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-white/30 rounded-full" />
                <div className="w-3 h-3 bg-white/30 rounded-full" />
                <div className="w-3 h-3 bg-white/30 rounded-full" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <PatiLogo size={10} />
                </div>
                <div className="text-white font-bold text-sm">{t("appName")}</div>
              </div>
            </div>

            <div className="p-6">
              {/* Uyarı banner */}
              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>⏰</span>
                  <span className="font-bold text-yellow-700 text-sm">2 {t("upcomingTitle")}</span>
                </div>
                <div className="text-xs text-yellow-600">• {language === "tr" ? "Pamuk" : "Snowball"} — {t("feature1Title")} (5 {t("daysLeft")})</div>
                <div className="text-xs text-yellow-600 mt-1">• {language === "tr" ? "Karamel" : "Caramel"} — {t("feature2Title")} (12 {t("daysLeft")})</div>
              </div>

              {/* Hayvan kartları */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: language === "tr" ? "Pamuk" : "Snowball", type: language === "tr" ? "Kedi" : "Cat", age: language === "tr" ? "2 yaşında" : "2 years old", color: "from-violet-400 to-purple-500", records: 4 },
                  { name: language === "tr" ? "Karamel" : "Caramel", type: language === "tr" ? "Köpek · Golden" : "Dog · Golden", age: language === "tr" ? "4 yaşında" : "4 years old", color: "from-amber-400 to-orange-500", records: 6 },
                ].map((pet, i) => (
                  <motion.div
                    key={pet.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={heroInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="bg-gray-50 rounded-2xl p-3 border border-gray-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${pet.color} flex items-center justify-center text-white text-sm font-bold`}>
                        {pet.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{pet.name}</div>
                        <div className="text-xs text-gray-400">{pet.type}</div>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-600 font-medium">{pet.age}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{pet.records} {language === "tr" ? "kayıt" : "records"}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-16 px-6 bg-[#2D2D2D]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-[#2D2D2D] mb-4">
              {t("landingFeaturesTitle")}
            </h2>
            <p className="text-[#666]">{t("landingFeaturesDesc")}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Sol — Feature listesi */}
            <div className="flex flex-col gap-3">
              {features.map((f, i) => (
                <motion.button
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={featuresInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveFeature(i)}
                  className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    activeFeature === i
                      ? "bg-[#2D2D2D] text-white shadow-lg"
                      : "bg-[#FAFAF7] hover:bg-gray-50 border border-[#E8E8E0]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {f.icon}
                  </div>
                  <div>
                    <div className={`font-semibold text-sm ${activeFeature === i ? "text-white" : "text-[#2D2D2D]"}`}>
                      {f.title}
                    </div>
                    {activeFeature === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-gray-300 mt-1 leading-relaxed"
                      >
                        {f.desc}
                      </motion.div>
                    )}
                  </div>
                  {activeFeature === i && (
                    <div className="ml-auto text-emerald-400 flex-shrink-0">✓</div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Sağ — Feature detayı */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={featuresInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`bg-gradient-to-br ${features[activeFeature].color} rounded-3xl p-10 text-center text-white shadow-2xl`}
                >
                  <div className="text-8xl mb-6">{features[activeFeature].icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{features[activeFeature].title}</h3>
                  <p className="text-white/80 leading-relaxed">{features[activeFeature].desc}</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-[#FAFAF7]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-[#2D2D2D] mb-4">
              {language === "tr" ? "Nasıl Çalışır?" : "How It Works"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "🐾",
                title: language === "tr" ? "Hayvanını Ekle" : "Add Your Pet",
                desc: language === "tr" ? "İsim, tür, doğum tarihi ve fotoğraf ekle." : "Add name, type, birth date and photo.",
              },
              {
                step: "02",
                icon: "💉",
                title: language === "tr" ? "Kayıt Tut" : "Track Records",
                desc: language === "tr" ? "Aşı ve bakım kayıtlarını ekle, sonraki tarihleri belirle." : "Add vaccine and care records, set next dates.",
              },
              {
                step: "03",
                icon: "🔔",
                title: language === "tr" ? "Hatırlatıcı Al" : "Get Reminders",
                desc: language === "tr" ? "Yaklaşan bakımlar için otomatik uyarılar al." : "Get automatic alerts for upcoming care.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 right-0 w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent translate-x-1/2" />
                )}
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-[#E8E8E0] flex items-center justify-center text-4xl mx-auto">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="font-bold text-[#2D2D2D] text-lg mb-2">{item.title}</h3>
                <p className="text-[#777] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-16"
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-4xl font-bold text-[#2D2D2D] mb-4">
              {t("landingTestimonialsTitle")}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-[#FAFAF7] rounded-3xl p-6 border border-[#E8E8E0] shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Yıldızlar */}
                <div className="flex gap-1 mb-4">
                  {Array(item.rating).fill(0).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">⭐</span>
                  ))}
                </div>
                <p className="text-[#444] text-sm leading-relaxed mb-6">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-[#2D2D2D] text-sm">{item.name}</div>
                    <div className="text-[#999] text-xs">{item.pet}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#FAFAF7]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-[#2D2D2D] rounded-3xl p-12 relative overflow-hidden"
          >
            {/* Dekorasyon */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 relative"
            >
              <PatiLogo size={28} />
            </motion.div>

            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-white mb-4 relative">
              {t("landingCTATitle")}
            </h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed relative">{t("landingCTADesc")}</p>

            <motion.button
              onClick={() => navigate("/auth")}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-medium transition-all cursor-pointer relative"
            >
              {t("landingCTAButton")} 🐾
            </motion.button>

            <p className="text-gray-600 text-xs mt-4 relative">
              {language === "tr" ? "Ücretsiz · Kayıt gerekmez · Veriler cihazınızda" : "Free · No signup required · Data on your device"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E0] py-8 px-6 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
              <PatiLogo size={12} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-[#2D2D2D]">{t("appName")}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {["tr", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    language === lang ? "bg-[#2D2D2D] text-white" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {lang === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
                </button>
              ))}
            </div>
            <p className="text-[#999] text-sm">{t("landingFooter")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;