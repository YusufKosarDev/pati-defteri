import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("current_user");
    const localUser = localStorage.getItem("current_user");
    if (sessionUser) setUser(JSON.parse(sessionUser));
    else if (localUser) setUser(JSON.parse(localUser));
    setLoading(false);
  }, []);

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Bu e-posta zaten kayıtlı." };
    }
    const newUser = {
      id: Date.now().toString(),
      name, email,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      isGuest: false,
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, isGuest: false };
    localStorage.setItem("current_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.email === email && u.password === hashPassword(password));
    if (!found) return { success: false, error: "E-posta veya şifre hatalı." };
    const safeUser = { id: found.id, name: found.name, email: found.email, isGuest: false };
    localStorage.setItem("current_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true };
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: "Misafir",
      email: null,
      isGuest: true,
    };
    sessionStorage.setItem("current_user", JSON.stringify(guestUser));
    setUser(guestUser);
    return { success: true };
  };

  const upgradeGuest = (name, email, password) => {
    if (!user?.isGuest) return { success: false, error: "Misafir kullanıcı değil." };

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Bu e-posta zaten kayıtlı." };
    }

    const newUser = {
      id: Date.now().toString(),
      name, email,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      isGuest: false,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(newUser));

    // Misafir verilerini yeni hesaba taşı
    const keys = ["pets", "records", "weights"];
    keys.forEach((key) => {
      const data = sessionStorage.getItem(`${key}_${user.id}`);
      if (data) {
        localStorage.setItem(`${key}_${newUser.id}`, data);
        sessionStorage.removeItem(`${key}_${user.id}`);
      }
    });

    // Eski misafir oturumunu temizle
    sessionStorage.removeItem("current_user");

    const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, isGuest: false };
    localStorage.setItem("current_user", JSON.stringify(safeUser));
    localStorage.setItem("users", JSON.stringify(users));
    setUser(safeUser);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("current_user");
    sessionStorage.removeItem("current_user");
    if (user?.isGuest) {
      sessionStorage.removeItem(`pets_${user.id}`);
      sessionStorage.removeItem(`records_${user.id}`);
      sessionStorage.removeItem(`weights_${user.id}`);
    }
    setUser(null);
  };

  const updateProfile = (name) => {
    if (!user) return;
    const updatedUser = { ...user, name };
    if (user.isGuest) {
      sessionStorage.setItem("current_user", JSON.stringify(updatedUser));
    } else {
      localStorage.setItem("current_user", JSON.stringify(updatedUser));
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updated = users.map((u) => u.id === user.id ? { ...u, name } : u);
      localStorage.setItem("users", JSON.stringify(updated));
    }
    setUser(updatedUser);
  };

  const changePassword = (currentPassword, newPassword) => {
    if (!user || user.isGuest) return { success: false, error: "Misafir hesabında şifre değiştirilemez." };
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u) => u.id === user.id);
    if (!found) return { success: false, error: "Kullanıcı bulunamadı." };
    if (found.password !== hashPassword(currentPassword)) return { success: false, error: "Mevcut şifre hatalı." };
    if (newPassword.length < 6) return { success: false, error: "Yeni şifre en az 6 karakter olmalı." };
    const updated = users.map((u) => u.id === user.id ? { ...u, password: hashPassword(newPassword) } : u);
    localStorage.setItem("users", JSON.stringify(updated));
    return { success: true };
  };

  const deleteAccount = (password) => {
    if (!user) return { success: false, error: "Kullanıcı bulunamadı." };
    if (!user.isGuest) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const found = users.find((u) => u.id === user.id);
      if (!found) return { success: false, error: "Kullanıcı bulunamadı." };
      if (found.password !== hashPassword(password)) return { success: false, error: "Şifre hatalı." };
      const updated = users.filter((u) => u.id !== user.id);
      localStorage.setItem("users", JSON.stringify(updated));
    }
    localStorage.removeItem(`pets_${user.id}`);
    localStorage.removeItem(`records_${user.id}`);
    localStorage.removeItem(`weights_${user.id}`);
    localStorage.removeItem("current_user");
    sessionStorage.removeItem("current_user");
    setUser(null);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      register, login, loginAsGuest, upgradeGuest,
      logout, updateProfile, changePassword, deleteAccount,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}