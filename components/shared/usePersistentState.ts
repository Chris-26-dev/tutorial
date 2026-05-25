"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        setValue(JSON.parse(storedValue) as T);
      }
    } finally {
      setHydrated(true);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [hydrated, key, value]);

  function reset() {
    window.localStorage.removeItem(key);
    setValue(initialValue);
  }

  return [value, setValue, reset];
}