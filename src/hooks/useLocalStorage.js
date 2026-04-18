import { useState, useEffect } from "react";

const STORAGE_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB

function getStorageSize(storage) {
  try {
    let total = 0;
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        total += (storage[key].length + key.length) * 2;
      }
    }
    return total;
  } catch {
    return 0;
  }
}

function useLocalStorage(key, initialValue, storage = localStorage) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const item = storage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch {
      setStoredValue(initialValue);
    }
  }, [key]);

  const setValue = (value) => {
    try {
      const size = getStorageSize(storage);
      if (size > STORAGE_WARNING_THRESHOLD) {
        console.warn("Storage is getting full:", (size / 1024 / 1024).toFixed(2) + "MB");
      }
      setStoredValue(value);
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        console.error("Storage quota exceeded!");
        alert("Depolama alanı doldu! Lütfen bazı verileri silin veya yedek alın.");
      }
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;