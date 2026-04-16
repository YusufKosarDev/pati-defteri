import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PatiLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="white">
    <ellipse cx="20" cy="30" rx="10" ry="13"/>
    <ellipse cx="42" cy="20" rx="10" ry="13"/>
    <ellipse cx="64" cy="20" rx="10" ry="13"/>
    <ellipse cx="82" cy="30" rx="10" ry="13"/>
    <path d="M50 45 C25 45 15 60 18 73 C21 85 35 90 50 90 C65 90 79 85 82 73 C85 60 75 45 50 45Z"/>
  </svg>
);

function AuthPage() {
  const navigate = useNavigate();
  const { register, login, loginAsGuest } = useAuth();
  const [mode, setMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (mode === "register" && !form.name.trim()) {
      newErrors.name = "İsim zorunlu.";
    }
    if (!form.email.trim()) {
      newErrors.email = "E-posta zorunlu.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta girin.";
    }
    if (!form.password) {
      newErrors.password = "Şifre zorunlu.";
    } else if (form.password.length < 6) {
      newErrors.password = "Şifre en az 6 karakter olmalı.";
    }
    if (mode === "register" && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    if (mode === "register") {
      const result = register(form.name, form.email, form.password);
      if (result.success) {
        toast.success(`Hoş geldin, ${form.name}! 🐾`);
        navigate("/app");
      } else {
        setErrors({ email: result.error });
      }
    } else {
      const result = login(form.email, form.password);
      if (result.success) {
        toast.success("Giriş başarılı! 🐾");
        navigate("/app");
      } else {
        setErrors({ password: result.error });
      }
    }

    setLoading(false);
  };

  const handleGuest = () => {
    loginAsGuest();
    toast("Misafir olarak devam ediyorsunuz. Veriler tarayıcı kapanınca silinir.", { icon: "⚠️" });
    navigate("/app");
  };

  const inputClass = (field) => `w-full bg-gray-800 border ${
    errors[field] ? "border-red-500" : "border-gray-700"
  } rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <PatiLogo size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">PatiDefteri</h1>
          <p className="text-gray-400 text-sm mt-1">Evcil Hayvan Bakım Günlüğü</p>
        </div>

        {/* Kart */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-2xl">

          {/* Tab */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  mode === m
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {m === "login" ? "Giriş Yap" : "Kayıt Ol"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "register" ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-4"
              >
                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">İsim</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputClass("name")}
                      placeholder="Adın Soyadın"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">E-posta</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass("email")}
                    placeholder="ornek@email.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Şifre</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className={inputClass("password")}
                    placeholder="En az 6 karakter"
                  />
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Şifre Tekrar</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={inputClass("confirmPassword")}
                      placeholder="Şifreyi tekrar girin"
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all cursor-pointer text-sm mt-2"
                >
                  {loading ? "..." : mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
                </button>
              </motion.div>
            </AnimatePresence>
          </form>

          {/* Ayırıcı */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-500">veya</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Misafir */}
          <button
            onClick={handleGuest}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl font-medium transition-all cursor-pointer text-sm border border-gray-700"
          >
            👤 Misafir olarak devam et
          </button>

          {mode === "login" && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Misafir olarak giriş yaparsanız verileriniz{" "}
              <span className="text-yellow-400">tarayıcı kapanınca silinir.</span>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;