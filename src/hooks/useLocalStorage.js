import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error loading ${key} from localStorage:`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error saving ${key} to localStorage:`, error);
        }
    };

    return [storedValue, setValue];
}

export function useAutoSave(key, data, delay = 2000) {
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            try {
                window.localStorage.setItem(key, JSON.stringify(data));
            } catch (error) {
                console.warn(`Error auto-saving ${key}:`, error);
            }
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [key, data, delay]);
}
