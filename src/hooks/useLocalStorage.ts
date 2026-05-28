import { useState } from "react";
import toast from "react-hot-toast";
import { captureException } from "../lib/sentry";

const STORAGE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB

function getStorageSize(storage: Storage): number {
  try {
    let total = 0;
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key == null) continue;
      const value = storage.getItem(key) ?? "";
      total += (value.length + key.length) * 2;
    }
    return total;
  } catch {
    return 0;
  }
}

function read<T>(storage: Storage, key: string, initialValue: T): T {
  try {
    const item = storage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

function useLocalStorage<T>(
  key: string,
  initialValue: T,
  storage: Storage = localStorage
): [T, (value: T) => void] {
  const [storedKey, setStoredKey] = useState(key);
  const [storedValue, setStoredValue] = useState<T>(() => read(storage, key, initialValue));

  // key değişirse render sırasında yeniden oku.
  // React'in "derive state from props" deseni — bkz. react.dev/reference/react/useState#storing-information-from-previous-renders
  if (storedKey !== key) {
    setStoredKey(key);
    setStoredValue(read(storage, key, initialValue));
  }

  const setValue = (value: T) => {
    try {
      const size = getStorageSize(storage);
      if (size > STORAGE_WARNING_THRESHOLD) {
        console.warn("Storage is getting full:", (size / 1024 / 1024).toFixed(2) + "MB");
      }
      setStoredValue(value);
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if ((error as { name?: string })?.name === "QuotaExceededError") {
        captureException(error, { context: "useLocalStorage quota exceeded" });
        toast.error("Depolama alanı doldu! Lütfen bazı verileri silin veya yedek alın.");
      }
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
