import { useEffect } from "react";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { AuthContext } from "../hooks/useAuth";
import { identifyUser } from "../lib/sentry";

// Convex hata mesajı "...Uncaught Error: <mesaj>\n at..." biçiminde gelir.
function friendlyError(err, fallback) {
  const raw = typeof err?.message === "string" ? err.message : "";
  const m = raw.match(/(?:Uncaught\s+)?(?:Convex)?Error:\s*([^\n]+)/i);
  return m?.[1]?.trim() || fallback;
}

export function AuthProvider({ children }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);
  const updateNameMutation = useMutation(api.users.updateName);
  const changePasswordAction = useAction(api.account.changePassword);
  const deleteAccountAction = useAction(api.account.deleteAccount);
  const upgradeGuestAction = useAction(api.account.upgradeGuest);

  const user = viewer
    ? {
        id: viewer._id,
        name: viewer.name ?? (viewer.isAnonymous ? "Misafir" : viewer.email ?? "Kullanıcı"),
        email: viewer.email ?? null,
        isGuest: viewer.isAnonymous,
      }
    : null;

  // Sentry kimliğini yalnızca kullanıcı KİMLİĞİ değişince güncelle; `user`
  // her render'da yeni bir nesne olduğundan onu bağımlılığa eklemek istemiyoruz.
  useEffect(() => {
    identifyUser(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // @convex-dev/auth Password provider, var olan hesapta `Account <id> already
  // exists` fırlatır. Tek bir kelimeye (ör. "already") bağlanmak yerine bilinen
  // birkaç kalıbı kontrol ederiz; sürüm/dil değişimlerine daha dayanıklıdır.
  const EMAIL_TAKEN = /already exists|already registered|already in use|account .*exists/i;

  const register = async (name, email, password) => {
    try {
      await signIn("password", { email, password, name, flow: "signUp" });
      return { success: true };
    } catch (err) {
      const msg = typeof err?.message === "string" ? err.message : "";
      if (EMAIL_TAKEN.test(msg)) {
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

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await changePasswordAction({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err, "Şifre değiştirilemedi.") };
    }
  };

  const deleteAccount = async () => {
    try {
      await deleteAccountAction({});
      // Oturum sunucuda geçersiz kılındı; istemci token'ını da temizle.
      await signOut();
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err, "Hesap silinemedi.") };
    }
  };

  const upgradeGuest = async (name, email, password) => {
    try {
      await upgradeGuestAction({ name, email, password });
      // Eski misafir oturumu geçersiz kılındı; yeni hesapla yeniden giriş yap.
      await signIn("password", { email: email.trim().toLowerCase(), password, flow: "signIn" });
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err, "Hesaba yükseltme başarısız.") };
    }
  };

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
