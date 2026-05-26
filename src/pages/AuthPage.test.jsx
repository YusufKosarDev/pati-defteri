import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./AuthPage";

// useAuth'u mock'la — gerçek Convex/auth bağımlılığı olmadan formu test ederiz.
vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    register: vi.fn().mockResolvedValue({ success: true }),
    login: vi.fn().mockResolvedValue({ success: true }),
    loginAsGuest: vi.fn().mockResolvedValue({ success: true }),
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>
  );
}

// Tab ve submit aynı metni taşıyabilir; type="submit" olan butonu seçer.
function getSubmit() {
  return screen
    .getAllByRole("button", { name: /giriş yap|login/i })
    .find((b) => b.getAttribute("type") === "submit");
}

describe("AuthPage doğrulama", () => {
  it("boş formda zorunlu alan hatalarını gösterir", async () => {
    renderPage();
    await userEvent.click(getSubmit());
    expect(await screen.findByText(/e-posta zorunlu|email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/şifre zorunlu|password is required/i)).toBeInTheDocument();
  });

  it("kısa şifre için hata gösterir", async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/example@email/i), "ali@example.com");
    await userEvent.type(screen.getByPlaceholderText(/en az 6 karakter|at least 6/i), "123");
    await userEvent.click(getSubmit());
    expect(
      await screen.findByText(/en az 6 karakter olmalı|at least 6 characters/i)
    ).toBeInTheDocument();
  });
});
