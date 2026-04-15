import { useState } from "react";

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const [loading, setLoading] = useState(false);

  const setValue = (value) => {
    try {
      setLoading(true);
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return [storedValue, setValue, loading];
}

export default useLocalStorage;