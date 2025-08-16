
import { useState, useEffect, useRef } from 'react';

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            if (storedValue) {
                return JSON.parse(storedValue);
            }
        } catch (error) {
            console.error(`Erro ao ler a chave do localStorage “${key}”:`, error);
        }
        return defaultValue;
    });

    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Agenda a operação de escrita no localStorage para ser executada de forma assíncrona,
        // prevenindo o bloqueio da UI durante atualizações de estado frequentes ou pesadas.
        // Um curto debounce (300ms) agrupa múltiplas atualizações rápidas em uma única operação de escrita.
        timeoutRef.current = window.setTimeout(() => {
            try {
                window.localStorage.setItem(key, JSON.stringify(state));
            } catch (error) {
                console.error(`Erro ao definir a chave do localStorage “${key}”:`, error);
            }
        }, 300);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [key, state]);

    return [state, setState];
}

export default usePersistentState;
