import { useEffect } from "react";

function useKeyboard(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Input veya textarea odaklanmışsa kısayolları çalıştırma
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || tag === "select";

      Object.entries(handlers).forEach(([key, handler]) => {
        const parts = key.split("+");
        const mainKey = parts[parts.length - 1].toLowerCase();
        const needsCtrl = parts.includes("ctrl");
        const needsShift = parts.includes("shift");
        const needsAlt = parts.includes("alt");

        const ctrlMatch = needsCtrl ? (e.ctrlKey || e.metaKey) : true;
        const shiftMatch = needsShift ? e.shiftKey : true;
        const altMatch = needsAlt ? e.altKey : true;
        const keyMatch = e.key.toLowerCase() === mainKey;

        // Modifier key gerektiren kısayollar her zaman çalışsın
        // Modifier gerektirmeyenler sadece yazı alanı dışında
        const hasModifier = needsCtrl || needsShift || needsAlt;
        if (!hasModifier && isTyping) return;

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault();
          handler(e);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}

export default useKeyboard;