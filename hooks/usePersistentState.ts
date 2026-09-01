import { useState, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

function usePersistentState<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            if (storedValue) return JSON.parse(storedValue) as T;
        } catch (error) {
            console.error(`Erro ao ler a chave do localStorage “${key}”:`, error);
        }
        return defaultValue;
    });

    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            try {
                window.localStorage.setItem(key, JSON.stringify(state));
            } catch (error) {
                console.error(`Erro ao definir a chave do localStorage “${key}”:`, error);
            }
        }, 300);

        return () => {
            if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        };
    }, [key, state]);

    return [state, setState];
}

export default usePersistentState;
