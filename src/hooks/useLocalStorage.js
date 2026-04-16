import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue, storage = localStorage) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Key veya storage değişince yeniden oku
  useEffect(() => {
    try {
      const item = storage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch {
      setStoredValue(initialValue);
    }
  }, [key, storage]);

  const setValue = (value) => {
    try {
      setStoredValue(value);
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;