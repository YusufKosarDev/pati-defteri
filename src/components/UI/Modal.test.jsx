import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal", () => {
  it("açıkken erişilebilir bir dialog olarak render olur", () => {
    render(
      <Modal isOpen title="Başlık" onClose={() => {}}>
        <p>İçerik</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(screen.getByText("İçerik")).toBeInTheDocument();
  });

  it("kapalıyken dialog render etmez", () => {
    render(
      <Modal isOpen={false} title="Başlık" onClose={() => {}}>
        <p>İçerik</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Escape tuşu onClose'u çağırır", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="Başlık" onClose={onClose}>
        <p>x</p>
      </Modal>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("kapat butonunun erişilebilir adı vardır ve onClose'u çağırır", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen title="Başlık" onClose={onClose}>
        <p>x</p>
      </Modal>
    );
    await userEvent.click(screen.getByRole("button", { name: /kapat|close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
