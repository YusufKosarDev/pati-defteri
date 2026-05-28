import { useEffect, type ReactNode } from "react";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { AuthContext } from "../hooks/useAuth";
import { identifyUser } from "../lib/sentry";
import { friendlyError } from "../lib/friendlyError";
import type { ActionResult, AuthUser } from "../types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);
  const updateNameMutation = useMutation(api.users.updateName);
  const changePasswordAction = useAction(api.account.changePassword);
  const deleteAccountAction = useAction(api.account.deleteAccount);
  const upgradeGuestAction = useAction(api.account.upgradeGuest);

  const user: AuthUser | null = viewer
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

  const register = async (name: string, email: string, password: string): Promise<ActionResult> => {
    try {
      await signIn("password", { email, password, name, flow: "signUp" });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (EMAIL_TAKEN.test(msg)) {
        return { success: false, error: "Bu e-posta zaten kayıtlı." };
      }
      return { success: false, error: "Kayıt başarısız. Lütfen tekrar deneyin." };
    }
  };

  const login = async (email: string, password: string): Promise<ActionResult> => {
    try {
      await signIn("password", { email, password, flow: "signIn" });
      return { success: true };
    } catch {
      return { success: false, error: "E-posta veya şifre hatalı." };
    }
  };

  const loginAsGuest = async (): Promise<ActionResult> => {
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

  const updateProfile = async (name: string) => {
    if (!user) return;
    await updateNameMutation({ name });
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<ActionResult> => {
    try {
      await changePasswordAction({ currentPassword, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err, "Şifre değiştirilemedi.") };
    }
  };

  const deleteAccount = async (): Promise<ActionResult> => {
    try {
      await deleteAccountAction({});
      // Oturum sunucuda geçersiz kılındı; istemci token'ını da temizle.
      await signOut();
      return { success: true };
    } catch (err) {
      return { success: false, error: friendlyError(err, "Hesap silinemedi.") };
    }
  };

  const upgradeGuest = async (
    name: string,
    email: string,
    password: string
  ): Promise<ActionResult> => {
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
