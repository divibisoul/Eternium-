import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, MessageRole, SystemAspect, GroundingMetadata } from './types.ts';
import { SparklesIcon, SendIcon, UserIcon, BrainChipIcon, HeartIcon, GalaxyIcon, CopyIcon, CheckIcon, ThumbUpIcon, ThumbDownIcon, GlobeIcon } from './icons.tsx';
import { SynthesisMetrics } from './SynthesisMetrics.tsx';
import { FusionProcessVisualizer } from './FusionProcessVisualizer.tsx';
import { MultimodalInputButton } from './MultimodalInputButton.tsx';

interface ChatProps {
    messages: Message[];
    onSendMessage: (message: string, imageFile?: File | null) => Promise<void>;
    isLoading: boolean;
    onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
    useWebSearch: boolean;
    onWebSearchToggle: (enabled: boolean) => void;
    activeMode: SystemAspect;
    onOpenPerceptionModal: () => void;
    isAcaiDeployed: boolean;
    isMpvsDeployed: boolean;
}

const WebSearchToggle: React.FC<{ isEnabled: boolean; onToggle: (enabled: boolean) => void; disabled: boolean; }> = ({ isEnabled, onToggle, disabled }) => (
    <div className="flex items-center space-x-2 mr-2" title={isEnabled ? "Pesquisa na Web Ativada" : "Pesquisa na Web Desativada"}>
        <GlobeIcon className={`w-5 h-5 transition-colors ${isEnabled ? 'text-blue-400' : 'text-gray-500'}`} />
        <button type="button" role="switch" aria-checked={isEnabled} onClick={() => onToggle(!isEnabled)} disabled={disabled} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${isEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const GroundingSources: React.FC<{ groundingMetadata: GroundingMetadata }> = ({ groundingMetadata }) => {
    const validSources = groundingMetadata?.groundingChunks?.filter(chunk => chunk.web?.uri) ?? [];
    if (validSources.length === 0) return null;
    return (
        <div className="mt-3 ml-11 border-t border-gray-600/50 pt-2">
            <h4 className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center"><GlobeIcon className="w-4 h-4 mr-1.5"/>Fontes da Web</h4>
            <ul className="list-none p-0 space-y-1">
                {validSources.map((chunk, index) => <li key={chunk.web!.uri}><a href={chunk.web!.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block" title={chunk.web!.title || chunk.web!.uri}>{index + 1}. {chunk.web!.title || chunk.web!.uri}</a></li>)}
            </ul>
        </div>
    );
};

const MessageBubble: React.FC<{ message: Message; onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void; }> = ({ message, onFeedback }) => {
    const isModel = message.role === MessageRole.MODEL;
    const isError = message.role === MessageRole.ERROR;
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => { void navigator.clipboard.writeText(message.text).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }); };
    const bubbleClasses = isModel ? 'bg-gray-700/80 text-gray-200' : 'bg-blue-600 text-white';
    const alignmentClasses = isModel ? 'items-start' : 'items-end';
    const hasSources = !!message.groundingMetadata?.groundingChunks?.filter(c => c.web?.uri).length;
    const aspectIcon = (aspect?: SystemAspect) => {
        switch (aspect) {
            case SystemAspect.ANALYSIS: return <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50"><BrainChipIcon className="w-5 h-5 text-blue-400" /></div>;
            case SystemAspect.ABSTRACT: return <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50"><HeartIcon className="w-5 h-5 text-purple-400" /></div>;
            case SystemAspect.SYNTHESIS: return <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50"><GalaxyIcon className="w-5 h-5 text-cyan-400" /></div>;
            default: return <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50"><SparklesIcon className="w-5 h-5 text-green-400" /></div>;
        }
    };
    const icon = isModel ? aspectIcon(message.aspect) : <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center border border-gray-500"><UserIcon className="w-5 h-5 text-gray-300" /></div>;
    if (isError) return <div className="flex justify-center items-center my-4 px-4"><div className="bg-red-900/50 text-red-300 border border-red-700 rounded-lg px-4 py-2 text-sm max-w-2xl mx-auto">{message.text}</div></div>;
    const renderText = (text: string) => { let processedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>'); processedText = processedText.replace(/`([^`]+)`/g, '<code class="bg-gray-800 rounded px-1 py-0.5 text-sm font-mono-code">$1</code>'); processedText = processedText.replace(/^\s*\n\*/gm, '<ul>\n*'); processedText = processedText.replace(/(\*\s.+)\s*\n([^*])/gm, '$1</li>\n</ul>\n$2'); processedText = processedText.replace(/^\*\s(.+)/gm, '<li>$1</li>'); processedText = processedText.replace(/\n/g, '<br />'); return { __html: processedText }; };
    return (
        <div className={`flex flex-col w-full max-w-2xl mx-auto my-4 px-4 ${alignmentClasses}`}>
            <div className="flex items-start space-x-3"><div className={`flex-shrink-0 ${isModel ? '' : 'order-2'}`}>{icon}</div><div className={`p-4 rounded-2xl max-w-[80%] ${bubbleClasses}`}>{message.imageUrl && <img src={message.imageUrl} alt="Anexo do usuário" className="mb-2 rounded-lg max-w-xs max-h-48" />}<div className="prose prose-invert prose-sm max-w-none font-sans" dangerouslySetInnerHTML={renderText(message.text)} /></div></div>
            {isModel && <div className="flex items-center space-x-2 mt-2 ml-11">{hasSources && <div className="flex items-center text-xs text-gray-500" title="Informação obtida da web"><GlobeIcon className="w-4 h-4 mr-1 text-blue-400" /><span className="text-gray-400">Web</span></div>}<button onClick={handleCopy} className="text-gray-500 hover:text-gray-300 transition-colors" title="Copiar">{isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}</button><button onClick={() => onFeedback(message.id, 'like')} className={`text-gray-500 hover:text-green-400 transition-colors ${message.feedback === 'like' ? 'text-green-400' : ''}`} title="Gostei"><ThumbUpIcon className="w-4 h-4" /></button><button onClick={() => onFeedback(message.id, 'dislike')} className={`text-gray-500 hover:text-red-400 transition-colors ${message.feedback === 'dislike' ? 'text-red-400' : ''}`} title="Não gostei"><ThumbDownIcon className="w-4 h-4" /></button></div>}
            {isModel && message.groundingMetadata && <GroundingSources groundingMetadata={message.groundingMetadata} />}
        </div>
    );
};

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, isLoading, onFeedback, useWebSearch, onWebSearchToggle, activeMode, onOpenPerceptionModal, isAcaiDeployed, isMpvsDeployed }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
    const handleFormSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => { e?.preventDefault(); const trimmedInput = input.trim(); if (!trimmedInput || isLoading) return; await onSendMessage(trimmedInput); setInput(''); }, [input, isLoading, onSendMessage]);
    useEffect(() => { const textarea = textareaRef.current; if (textarea) { textarea.style.height = 'auto'; textarea.style.height = `${textarea.scrollHeight}px`; } }, [input]);
    return (
        <div className="flex flex-col h-full bg-gray-900 pb-16">
            <div className="flex-1 overflow-y-auto pb-4">
                {messages.map((msg) => <React.Fragment key={msg.id}><MessageBubble message={msg} onFeedback={onFeedback} />{msg.role === MessageRole.MODEL && msg.synthesisMetrics && <div className="w-full max-w-2xl mx-auto my-2 px-4"><div className="ml-11"><SynthesisMetrics metrics={msg.synthesisMetrics} /></div></div>}{msg.role === MessageRole.MODEL && msg.intermediateResponses && <div className="w-full max-w-2xl mx-auto my-2 px-4"><div className="ml-11"><FusionProcessVisualizer intermediateResponses={msg.intermediateResponses} /></div></div>}</React.Fragment>)}
                {isLoading && activeMode !== SystemAspect.SYNTHESIS && <div className="flex items-start space-x-3 w-full max-w-2xl mx-auto my-4 px-4"><div className="flex-shrink-0"><div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50"><SparklesIcon className="w-5 h-5 text-cyan-400" /></div></div><div className="p-4 rounded-2xl bg-gray-700/80"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="relative z-20 p-4 bg-gray-800/70 border-t border-gray-700 backdrop-blur-sm"><form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto"><div className="flex items-center bg-gray-700 rounded-full p-2"><MultimodalInputButton onClick={onOpenPerceptionModal} isAcaiDeployed={isAcaiDeployed} isMpvsDeployed={isMpvsDeployed} disabled={isLoading} /><div className="h-6 border-l border-gray-600 mx-1"></div><WebSearchToggle isEnabled={useWebSearch} onToggle={onWebSearchToggle} disabled={isLoading || activeMode === SystemAspect.SYNTHESIS || activeMode === SystemAspect.ANALYSIS} /><textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleFormSubmit(); } }} placeholder="Envie uma mensagem para Aeternum..." className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-4 resize-none max-h-32" rows={1} disabled={isLoading} /><button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-blue-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"><SendIcon className="w-5 h-5" /></button></div></form></div>
        </div>
    );
};
