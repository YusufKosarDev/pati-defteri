import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "./ConfirmModal";

const baseProps = {
  isOpen: true,
  title: "Emin misiniz?",
  desc: "Bu işlem geri alınamaz.",
};

describe("ConfirmModal", () => {
  it("alertdialog olarak başlık ve açıklamayla render olur", () => {
    render(<ConfirmModal {...baseProps} onClose={() => {}} onConfirm={() => {}} />);
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Emin misiniz?")).toBeInTheDocument();
    expect(screen.getByText("Bu işlem geri alınamaz.")).toBeInTheDocument();
  });

  it("onayla butonu hem onConfirm hem onClose'u çağırır", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmModal {...baseProps} confirmText="Sil" onClose={onClose} onConfirm={onConfirm} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Sil" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape onClose'u çağırır ama onConfirm'i çağırmaz", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmModal {...baseProps} onClose={onClose} onConfirm={onConfirm} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
