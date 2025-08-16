
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SystemAspect, ActiveOperation } from '../types.ts';
import { SendIcon } from './icons.tsx';
import { WebSearchToggle } from './WebSearchToggle.tsx';
import { MultimodalInputButton } from './MultimodalInputButton.tsx';
import { ActiveOperationsMonitor } from './ActiveOperationsMonitor.tsx';

interface ChatInputProps {
    onSendMessage: (message: string, imageFile?: File | null) => Promise<void>;
    isLoading: boolean;
    useWebSearch: boolean;
    onWebSearchToggle: (enabled: boolean) => void;
    activeMode: SystemAspect;
    onOpenPerceptionModal: () => void;
    isAcaiDeployed: boolean;
    isMpvsDeployed: boolean;
    activeOperations: ActiveOperation[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    isLoading,
    useWebSearch,
    onWebSearchToggle,
    activeMode,
    onOpenPerceptionModal,
    isAcaiDeployed,
    isMpvsDeployed,
    activeOperations,
}) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFormSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        if (isLoading) return;
        
        await onSendMessage(trimmedInput);
        setInput('');
    }, [input, isLoading, onSendMessage]);
    
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [input]);

    return (
        <footer className="w-full shrink-0">
            <div className="px-4 max-w-2xl mx-auto w-full">
                <ActiveOperationsMonitor activeOperations={activeOperations} />
            </div>
            <div className="relative z-20 p-4 bg-gray-800/70 border-t border-gray-700 backdrop-blur-sm">
                <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto">
                    <div className="flex items-center bg-gray-700 rounded-full p-2">
                        <MultimodalInputButton 
                            onClick={onOpenPerceptionModal}
                            isAcaiDeployed={isAcaiDeployed}
                            isMpvsDeployed={isMpvsDeployed}
                            disabled={isLoading}
                        />
                        <div className="h-6 border-l border-gray-600 mx-1"></div>
                        <WebSearchToggle isEnabled={useWebSearch} onToggle={onWebSearchToggle} disabled={isLoading || activeMode === SystemAspect.SYNTHESIS || activeMode === SystemAspect.ANALYSIS} />
                        
                        <textarea 
                            ref={textareaRef} 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFormSubmit(); } }} 
                            placeholder="Envie uma mensagem para Aeternum..." 
                            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-4 resize-none max-h-32" 
                            rows={1} 
                            disabled={isLoading} 
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            className="p-2 rounded-full bg-blue-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </footer>
    );
};
