import { createContext, useContext } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);
  const updateNameMutation = useMutation(api.users.updateName);

  const user = viewer
    ? {
        id: viewer._id,
        name: viewer.name ?? (viewer.isAnonymous ? "Misafir" : viewer.email ?? "Kullanıcı"),
        email: viewer.email ?? null,
        isGuest: viewer.isAnonymous,
      }
    : null;

  const register = async (name, email, password) => {
    try {
      await signIn("password", { email, password, name, flow: "signUp" });
      return { success: true };
    } catch (err) {
      const msg = err?.message ?? "";
      if (msg.toLowerCase().includes("already")) {
        return { success: false, error: "Bu e-posta zaten kayıtlı." };
      }
      return { success: false, error: "Kayıt başarısız. Lütfen tekrar deneyin." };
    }
  };

  const login = async (email, password) => {
    try {
      await signIn("password", { email, password, flow: "signIn" });
      return { success: true };
    } catch {
      return { success: false, error: "E-posta veya şifre hatalı." };
    }
  };

  const loginAsGuest = async () => {
    try {
      await signIn("anonymous");
      return { success: true };
    } catch {
      return { success: false, error: "Misafir oturumu açılamadı." };
    }
  };

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (name) => {
    if (!user) return;
    await updateNameMutation({ name });
  };

  // Geçici olarak devre dışı — Convex Auth'a özel mutation yazılınca dönecek
  const changePassword = async () => ({
    success: false,
    error: "Şifre değiştirme yakında geri gelecek.",
  });
  const deleteAccount = async () => ({
    success: false,
    error: "Hesap silme yakında geri gelecek.",
  });
  const upgradeGuest = async () => ({
    success: false,
    error: "Hesaba yükseltme yakında geri gelecek.",
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isLoading || viewer === undefined,
        isAuthenticated,
        register,
        login,
        loginAsGuest,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        upgradeGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
