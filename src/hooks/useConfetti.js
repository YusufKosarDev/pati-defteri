import confetti from "canvas-confetti";

function useConfetti() {
  const fireConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ["#10b981", "#34d399"] });
    fire(0.2, { spread: 60, colors: ["#10b981", "#6ee7b7"] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#10b981", "#a7f3d0"] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#10b981", "#d1fae5"] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ["#10b981", "#059669"] });
  };

  const fireStar = () => {
    const defaults = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: ["star"],
      colors: ["#10b981", "#34d399", "#6ee7b7", "#fbbf24", "#f59e0b"],
    };

    function shoot() {
      confetti({ ...defaults, particleCount: 30, scalar: 1.2, shapes: ["star"] });
      confetti({ ...defaults, particleCount: 20, scalar: 0.75, shapes: ["circle"] });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  return { fireConfetti, fireStar };
}

export default useConfetti;