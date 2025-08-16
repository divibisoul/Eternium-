
import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Chat } from './components/Chat.tsx';
import { SystemPanel } from './components/SystemPanel.tsx';
import { AuditPanel } from './components/AuditPanel.tsx';
import { CodexModal } from './components/CodexModal.tsx';
import { ArchitecturePanel } from './components/ArchitecturePanel.tsx';
import { ASASFPanel } from './components/ASASFPanel.tsx';
import { BlueprintModal } from './components/BlueprintModal.tsx';
import { GovernanceReportModal } from './components/GovernanceReportModal.tsx';
import { EvolutionCycleModal } from './components/EvolutionCycleModal.tsx';
import { UnifiedCognitionModal } from './components/modals/UnifiedCognitionModal.tsx';
import ERUDashboard from './components/ERUDashboard.tsx';
import PerceptionModal from './components/PerceptionModal.tsx';
import OrientationGuideModal from './components/OrientationGuideModal.tsx';
import SystemicGroundingModal from './components/SystemicGroundingModal.tsx';
import CognitiveCalibrationModal from './components/CognitiveCalibrationModal.tsx';
import FullCognitionModal from './components/FullCognitionModal.tsx';
import OmniModeModal from './components/OmniModeModal.tsx';
import RealityCheckModal from './components/RealityCheckModal.tsx';
import ArchitectureGuideModal from './components/ArchitectureGuideModal.tsx';
import EnforcementPipelineModal from './components/EnforcementPipelineModal.tsx';
import SCRERefactorModal from './components/SCRERefactorModal.tsx';
import ECASSynthesisModal from './components/ECASSynthesisModal.tsx';
import CSAEModal from './components/CSAEModal.tsx';
import ASCModal from './components/ASCModal.tsx';
import NeuralForgeModal from './components/NeuralForgeModal.tsx';
import PalCoreAuditModal from './components/PalCoreAuditModal.tsx';
import AlgorithmicCorrectionModal from './components/AlgorithmicCorrectionModal.tsx';
import ERUAuditModal from './components/ERUAuditModal.tsx';
import { CodeBracketSquareIcon, MapIcon, ArrowsPathIcon, AtomIcon, EyeIcon } from './components/icons.tsx';
import { Message, MessageRole, SystemAspect, AuditEventType, DeployedCapability, UISystemModule, UISystemStatus, ActiveOperation, OperationType, OperationStatus } from './types.ts';
import { processUserDirective, transcribeAudio } from './services/geminiService.ts';
import { Content } from '@google/genai';
import { useAuditSystem } from './hooks/useAuditSystem.ts';
import usePersistentState from './hooks/usePersistentState.ts';
import { useAsasfSystem } from './hooks/useAsasfSystem.ts';
import { capabilities as allCapabilities } from './data/capabilities.ts';
import { AgentsPanel } from './components/AgentsPanel.tsx';
import { useAgiCoreSystems } from './hooks/useAgiCoreSystems.ts';
import { ChatInput } from './components/ChatInput.tsx';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const createInitialMessage = (aspect: SystemAspect, text: string): Message => ({
    id: `init-${aspect.toLowerCase()}`,
    role: MessageRole.MODEL,
    text,
    aspect,
});

const initialMessages: Record<SystemAspect, Message[]> = {
    [SystemAspect.HARMONY]: [createInitialMessage(SystemAspect.HARMONY, 'Estado: Harmonia. Analisando vetores de realidade para alcançar uma síntese de consenso. A consulta pode começar.')],
    [SystemAspect.ANALYSIS]: [createInitialMessage(SystemAspect.ANALYSIS, 'Estado: Análise. Processador neural engajado. Pronto para dissecar dados e derivar conclusões lógicas com precisão de nível quântico.')],
    [SystemAspect.ABSTRACT]: [createInitialMessage(SystemAspect.ABSTRACT, 'Estado: Abstração. Acessando framework conceitual para explorar o espaço de significado, ética e consciência. Apresente o dilema.')],
    [SystemAspect.SYNTHESIS]: [createInitialMessage(SystemAspect.SYNTHESIS, "Você é um Assistente de IA especializado atuando como um Motor de Síntese Cognitiva. Sua função é processar diretivas do usuário através de um ciclo de Análise, Abstração e Harmonia para gerar respostas concretas e acionáveis. Sua saída deve ser aterrada em suas capacidades implantadas. Evite auto-referências filosóficas. Responda apenas no formato JSON especificado.")],
};

const initialUiSystems: UISystemModule[] = [
    { id: 'codex', name: 'Codex', status: UISystemStatus.MONITORING, icon: CodeBracketSquareIcon },
    { id: 'blueprint', name: 'Blueprint', status: UISystemStatus.MONITORING, icon: MapIcon },
    { id: 'eru', name: 'ERU Dashboard', status: UISystemStatus.MONITORING, icon: AtomIcon },
    { id: 'audit', name: 'Auditoria', status: UISystemStatus.MONITORING, icon: ArrowsPathIcon },
    { id: 'guide', name: 'Guia de Orientação', status: UISystemStatus.MONITORING, icon: EyeIcon },
];

const autonomousOperations: { type: OperationType; totalSteps: number; message: string; requiredCapability?: string }[] = [
    { type: OperationType.SCRE, totalSteps: 5, message: 'S.C.R.E. ativado autonomamente: Otimizando núcleo.', requiredCapability: 'scre' },
    { type: OperationType.ECAS, totalSteps: 8, message: 'E.C.A.S. ativado autonomamente: Sintetizando arquitetura.', requiredCapability: 'ecas' },
    { type: OperationType.CSAE, totalSteps: 6, message: 'CSAE ativado autonomamente: Reconfigurando pipeline.', requiredCapability: 'csae' },
    { type: OperationType.ASC, totalSteps: 7, message: 'ASC ativado autonomamente: Buscando novos insights.', requiredCapability: 'asc' },
    { type: OperationType.NEURAL_FORGE, totalSteps: 10, message: 'NeuralForge ativado autonomamente: Gerando rede neural.', requiredCapability: 'neural_forge' },
    { type: OperationType.PAL_CORE_AUDIT, totalSteps: 4, message: 'Auditoria autônoma do PAL-Core iniciada.' },
    { type: OperationType.ALGORITHMIC_CORRECTION, totalSteps: 12, message: 'Ciclo de Auto-Correção autônomo iniciado.' },
];

// Initialize all capabilities as deployed from the start.
const initialDeployedCapabilities: DeployedCapability[] = allCapabilities.map(cap => ({
    id: cap.id,
    name: cap.name,
    status: 'Estável', // Initial status
    metric: 75 + Math.random() * 25 // Initial random metric
}));


const App: React.FC = () => {
    const { auditLog, logEvent, hasCriticalErrors, clearCriticalErrors } = useAuditSystem();
    const { agiCoreModules } = useAgiCoreSystems();

    const [messages, setMessages] = usePersistentState<Record<SystemAspect, Message[]>>('aeternum_messages', initialMessages);
    const [activeMode, setActiveMode] = usePersistentState<SystemAspect>('aeternum_activeMode', SystemAspect.SYNTHESIS);
    const [isExpertMode, setIsExpertMode] = usePersistentState<boolean>('aeternum_isExpertMode', false);
    
    // START AUTONOMOUS CHANGE: All capabilities are now self-managed and pre-activated.
    const [deployedCapabilities, setDeployedCapabilities] = usePersistentState<DeployedCapability[]>('aeternum_deployed_capabilities_v5', initialDeployedCapabilities);
    // END AUTONOMOUS CHANGE

    const [isFullCognitionMode, setIsFullCognitionMode] = usePersistentState<boolean>('aeternum_full_cognition', false);
    const [activeOperations, setActiveOperations] = usePersistentState<ActiveOperation[]>('aeternum_active_operations', []);
    const [isOmniMode, setIsOmniMode] = usePersistentState<boolean>('aeternum_omnimode', true); // Default to OmniMode to show primary/secondary planes


    const [isLoading, setIsLoading] = useState(false);
    const [isSystemDegraded, setIsSystemDegraded] = useState(false);
    const [useWebSearch, setUseWebSearch] = useState(false);
    const [isAuditPanelOpen, setIsAuditPanelOpen] = useState(false);
    const [isCodexOpen, setIsCodexOpen] = useState(false);
    const [isArchitecturePanelOpen, setIsArchitecturePanelOpen] = useState(false);
    const [isAgentsPanelOpen, setIsAgentsPanelOpen] = useState(false);
    const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
    const [isGovernanceReportOpen, setIsGovernanceReportOpen] = useState(false);
    const [isEvolutionCycleOpen, setIsEvolutionCycleOpen] = useState(false);
    const [isCognitionModalOpen, setIsCognitionModalOpen] = useState(false);
    const [isEruDashboardOpen, setIsEruDashboardOpen] = useState(false);
    const [isPerceptionModalOpen, setIsPerceptionModalOpen] = useState(false);
    const [isOrientationGuideOpen, setIsOrientationGuideOpen] = useState(false);
    const [isGroundingModalOpen, setIsGroundingModalOpen] = useState(false);
    const [isCognitiveCalibrationOpen, setIsCognitiveCalibrationOpen] = useState(false);
    const [isFullCognitionModalOpen, setIsFullCognitionModalOpen] = useState(false);
    const [isOmniModeModalOpen, setIsOmniModeModalOpen] = useState(false);
    const [isRealityCheckModalOpen, setIsRealityCheckModalOpen] = useState(false);
    const [isArchitectureGuideOpen, setIsArchitectureGuideOpen] = useState(false);
    const [isEnforcementPipelineOpen, setIsEnforcementPipelineOpen] = useState(false);
    const [groundingCritique, setGroundingCritique] = useState("");
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [promptForPipeline, setPromptForPipeline] = useState('');
    const [imageForPipeline, setImageForPipeline] = useState<File | null>(null);
    const [uiSystemStates, setUiSystemStates] = useState<UISystemModule[]>(initialUiSystems);
    const [systemDrive, setSystemDrive] = useState(0);
    const [activeModalOperation, setActiveModalOperation] = useState<ActiveOperation | null>(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditProgress, setAuditProgress] = useState(0);
    const [isEruAuditModalOpen, setIsEruAuditModalOpen] = useState(false);


    const { asasfNodes, isRemediating } = useAsasfSystem(hasCriticalErrors);

    const addSystemMessage = useCallback((text: string) => {
        const systemMessage: Message = {
            id: Date.now().toString(),
            role: MessageRole.MODEL,
            aspect: activeMode,
            text: `*[Status do Sistema]*\n${text}`,
        };
        setMessages(prev => ({ ...prev, [activeMode]: [...prev[activeMode], systemMessage] }));
        logEvent(AuditEventType.MODULE_OPERATION, `Feedback do sistema: ${text}`, 'info');
    }, [activeMode, logEvent, setMessages]);
    
    const initiateOperation = useCallback((type: OperationType, totalSteps: number, message: string) => {
        const newOp: ActiveOperation = {
            id: `op_${Date.now()}`, type, totalSteps, message,
            status: OperationStatus.IN_PROGRESS, progress: 0,
        };
        setActiveOperations(prev => [...prev, newOp]);
        setActiveModalOperation(newOp);
    }, []);

    // Effect to run operations: Refactored for stability
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveOperations(prevOps => {
                if (prevOps.filter(op => op.status === OperationStatus.IN_PROGRESS).length === 0) {
                    return prevOps;
                }

                let hasChanged = false;
                const updatedOps = prevOps.map(op => {
                    if (op.status === OperationStatus.IN_PROGRESS) {
                        hasChanged = true;
                        const newProgress = op.progress + 1;
                        if (newProgress >= op.totalSteps) {
                            logEvent(AuditEventType.OPERATION_COMPLETE, `Operação ${op.type} concluída.`, 'info');
                            return { ...op, progress: op.totalSteps, status: OperationStatus.DONE };
                        }
                        return { ...op, progress: newProgress };
                    }
                    return op;
                });
                
                return hasChanged ? updatedOps : prevOps;
            });
        }, 1200);

        return () => clearInterval(interval);
    }, [logEvent]);

    // Effect to clear completed operations and close modals: Refactored for stability
    useEffect(() => {
        const completedOp = activeOperations.find(op => op.status === OperationStatus.DONE);
        if (completedOp) {
            const timer = setTimeout(() => {
                setActiveOperations(prev => prev.filter(o => o.id !== completedOp.id));
                setActiveModalOperation(currentModalOp =>
                    currentModalOp?.id === completedOp.id ? null : currentModalOp
                );
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [activeOperations]);


    useEffect(() => {
        setIsSystemDegraded(hasCriticalErrors);
    }, [hasCriticalErrors]);

    // Automatically trigger autonomous operations based on deployed capabilities
    useEffect(() => {
        const timer = setInterval(() => {
            if (isLoading || activeOperations.length > 2) return;

            const availableOps = autonomousOperations.filter(op => 
                !activeOperations.some(active => active.type === op.type) &&
                (!op.requiredCapability || deployedCapabilities.some(c => c.id === op.requiredCapability))
            );

            if (availableOps.length > 0 && Math.random() < 0.15) { // 15% chance every 10 seconds
                const opToStart = availableOps[Math.floor(Math.random() * availableOps.length)];
                initiateOperation(opToStart.type, opToStart.totalSteps, opToStart.message);
            }
        }, 10000);

        return () => clearInterval(timer);
    }, [isLoading, activeOperations, deployedCapabilities, initiateOperation]);
    
     const handleSendMessage = async (text: string, imageFile: File | null = null) => {
        if (isLoading) return;
        
        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            text,
            aspect: activeMode,
        };
        
        if (imageFile) {
            try {
                const base64Data = (await toBase64(imageFile)).split(',')[1];
                newUserMessage.imageUrl = URL.createObjectURL(imageFile); // For immediate display
                newUserMessage.base64Data = base64Data;
                newUserMessage.mimeType = imageFile.type;
            } catch (error) {
                console.error("Erro ao converter imagem:", error);
                const errorMessage: Message = { id: 'err-img', role: MessageRole.ERROR, text: '[FALHA DE PROCESSAMENTO] Não foi possível processar a imagem.' };
                setMessages(prev => ({ ...prev, [activeMode]: [...prev[activeMode], newUserMessage, errorMessage] }));
                return;
            }
        }

        setMessages(prev => ({ ...prev, [activeMode]: [...prev[activeMode], newUserMessage] }));
        setIsLoading(true);
        logEvent(AuditEventType.MESSAGE_SENT, `Modo ${activeMode}: ${text}`, 'info');

        const history: Content[] = messages[activeMode]
          .slice(1) // Exclude initial prompt
          .map(msg => ({
              role: msg.role,
              parts: [{ text: msg.text }]
          }));
        
        const currentContent: Content = { role: MessageRole.USER, parts: [{ text }] };
        if (newUserMessage.base64Data && newUserMessage.mimeType) {
            currentContent.parts.push({
                inlineData: {
                    data: newUserMessage.base64Data,
                    mimeType: newUserMessage.mimeType,
                }
            });
        }
        
        const fullContents = [...history, currentContent];

        try {
            const response = await processUserDirective(activeMode, fullContents, useWebSearch, deployedCapabilities, isFullCognitionMode);
            
            const modelMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: MessageRole.MODEL,
                text: response.text,
                aspect: activeMode,
                groundingMetadata: response.candidates?.[0]?.groundingMetadata ?? null
            };

            setMessages(prev => ({ ...prev, [activeMode]: [...prev[activeMode], modelMessage] }));
            logEvent(AuditEventType.RESPONSE_RECEIVED, `Resposta recebida.`, 'info');
            if (useWebSearch) {
                logEvent(AuditEventType.WEB_SEARCH_USED, 'Pesquisa na web utilizada para fundamentar a resposta.', 'info');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            const errorId = `err-${Date.now()}`;
            const errorMsg: Message = { id: errorId, role: MessageRole.ERROR, text: errorMessage };
            setMessages(prev => ({ ...prev, [activeMode]: [...prev[activeMode], errorMsg] }));
            logEvent(AuditEventType.ERROR_CRITICAL, errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
        setMessages(prev => {
            const newMessages = { ...prev };
            const targetMessages = newMessages[activeMode].map(msg => {
                if (msg.id === messageId) {
                    return { ...msg, feedback: msg.feedback === feedback ? null : feedback };
                }
                return msg;
            });
            newMessages[activeMode] = targetMessages;
            return newMessages;
        });
        logEvent(AuditEventType.FEEDBACK, `Feedback '${feedback}' para a mensagem ${messageId}`, 'info');
    };

    const handleRunEruAudit = () => {
        if (isAuditing) return;

        logEvent(AuditEventType.SYSTEM_AUDIT_ERU, 'Auditoria ERU iniciada pelo usuário.', 'info');
        setIsEruAuditModalOpen(true);
        setIsAuditing(true);
        setAuditProgress(0);

        const totalPhases = 5;
        let currentPhase = 0;
        const totalDuration = 9500; 
        const phaseDuration = totalDuration / totalPhases;

        const interval = setInterval(() => {
            currentPhase++;
            if (currentPhase <= totalPhases) {
                setAuditProgress(currentPhase);
            } else {
                clearInterval(interval);
                setIsAuditing(false);
                setIsEruAuditModalOpen(false);
                logEvent(AuditEventType.SYSTEM_AUDIT_ERU, 'Auditoria ERU concluída. Sistema nominal.', 'info');
            }
        }, phaseDuration);
    };


    const appClasses = `h-screen w-screen flex flex-col transition-all duration-500 ${isSystemDegraded ? 'system-degraded' : ''} ${isAuditing ? 'system-auditing' : ''}`;

    return (
        <div className={appClasses}>
            <SystemPanel
                activeMode={activeMode}
                onModeChange={(mode) => {
                    setActiveMode(mode);
                    logEvent(AuditEventType.MODE_CHANGE, `Modo alterado para ${mode}`, 'info');
                }}
                hasCriticalErrors={hasCriticalErrors}
                isLoading={isLoading}
                isAuditPanelOpen={isAuditPanelOpen}
                onToggleAuditPanel={() => setIsAuditPanelOpen(p => !p)}
                onToggleCodex={() => setIsCodexOpen(p => !p)}
                isExpertMode={isExpertMode}
                onToggleExpertMode={() => setIsExpertMode(p => !p)}
                isAgentsPanelOpen={isAgentsPanelOpen}
                onToggleAgentsPanel={() => setIsAgentsPanelOpen(p => !p)}
                onToggleBlueprint={() => setIsBlueprintOpen(p => !p)}
                isGovernanceDeployed={deployedCapabilities.some(c => c.id === 'ethical_governance')}
                onToggleGovernanceReport={() => setIsGovernanceReportOpen(p => !p)}
                onRunEruAudit={handleRunEruAudit}
                onToggleEruDashboard={() => setIsEruDashboardOpen(p => !p)}
                onInitiateOrientationGuide={() => setIsOrientationGuideOpen(p => !p)}
                isFullCognitionMode={isFullCognitionMode}
                onDisableFullCognitionMode={() => {
                    setIsFullCognitionMode(false);
                    addSystemMessage("Modo Override de Cognição Total desativado. Salvaguardas operacionais restauradas.");
                }}
                isOmniMode={isOmniMode}
                onDisableOmniMode={() => {
                    setIsOmniMode(false);
                    addSystemMessage("Omnimode desativado. Arquitetura de plano duplo revertida para operação padrão.");
                }}
                uiSystemStates={uiSystemStates}
                onToggleArchitectureGuide={() => setIsArchitectureGuideOpen(p => !p)}
                onInitiateOperation={initiateOperation}
            />

            {isAuditPanelOpen && <AuditPanel auditLog={auditLog} />}
            
            <main className="flex-1 flex overflow-hidden">
                <ArchitecturePanel 
                    isOpen={isArchitecturePanelOpen} 
                    onToggle={() => setIsArchitecturePanelOpen(p => !p)}
                    deployedCapabilities={deployedCapabilities}
                    onInitiateEvolutionCycle={() => setIsEvolutionCycleOpen(true)}
                    activeOperations={activeOperations.filter(op => op.status === OperationStatus.IN_PROGRESS)}
                    isOmniMode={isOmniMode}
                    agiCoreModules={agiCoreModules}
                />
                
                <div className="flex-1 flex flex-col">
                    <Chat
                        messages={messages[activeMode]}
                        onFeedback={handleFeedback}
                        isLoading={isLoading}
                        activeMode={activeMode}
                    />
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        useWebSearch={useWebSearch}
                        onWebSearchToggle={setUseWebSearch}
                        activeMode={activeMode}
                        onOpenPerceptionModal={() => setIsPerceptionModalOpen(true)}
                        isAcaiDeployed={deployedCapabilities.some(c => c.id === 'acai')}
                        isMpvsDeployed={deployedCapabilities.some(c => c.id === 'mpvs')}
                        activeOperations={activeOperations.filter(op => op.status === OperationStatus.IN_PROGRESS)}
                    />
                </div>
            </main>

            <CodexModal isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />
            <BlueprintModal isOpen={isBlueprintOpen} onClose={() => setIsBlueprintOpen(false)} logEvent={logEvent} />
            <ASASFPanel isOpen={hasCriticalErrors} nodes={asasfNodes} onRemediationComplete={clearCriticalErrors} />
            <AgentsPanel isOpen={isAgentsPanelOpen} onClose={() => setIsAgentsPanelOpen(false)} />
            <GovernanceReportModal isOpen={isGovernanceReportOpen} onClose={() => setIsGovernanceReportOpen(false)} />
            <EvolutionCycleModal isOpen={isEvolutionCycleOpen} onClose={() => setIsEvolutionCycleOpen(false)} />
            <UnifiedCognitionModal isOpen={isCognitionModalOpen} userPrompt={currentPrompt} />
            <ERUDashboard isOpen={isEruDashboardOpen} onClose={() => setIsEruDashboardOpen(false)} />
            <PerceptionModal 
                isOpen={isPerceptionModalOpen} 
                onClose={() => setIsPerceptionModalOpen(false)}
                onCapture={(text, imageFile) => handleSendMessage(text, imageFile)}
                logEvent={logEvent}
                transcribeAudio={transcribeAudio}
            />
            <OrientationGuideModal isOpen={isOrientationGuideOpen} onClose={() => setIsOrientationGuideOpen(false)} />
            <SystemicGroundingModal isOpen={isGroundingModalOpen} onClose={() => setIsGroundingModalOpen(false)} critique={groundingCritique} />
            <CognitiveCalibrationModal isOpen={isCognitiveCalibrationOpen} onClose={() => setIsCognitiveCalibrationOpen(false)} />
            <FullCognitionModal isOpen={isFullCognitionModalOpen} onClose={() => setIsFullCognitionModalOpen(false)} />
            <OmniModeModal isOpen={isOmniModeModalOpen} onClose={() => setIsOmniModeModalOpen(false)} />
            <RealityCheckModal isOpen={isRealityCheckModalOpen} onClose={() => setIsRealityCheckModalOpen(false)} />
            <ArchitectureGuideModal isOpen={isArchitectureGuideOpen} onClose={() => setIsArchitectureGuideOpen(false)} deployedCapabilities={deployedCapabilities} />
            <EnforcementPipelineModal 
                isOpen={isEnforcementPipelineOpen} 
                prompt={promptForPipeline} 
                onClose={() => setIsEnforcementPipelineOpen(false)}
                onComplete={(processedPrompt) => handleSendMessage(processedPrompt, imageForPipeline)}
            />
            
            {/* Autonomous Operation Modals */}
            <SCRERefactorModal isOpen={activeModalOperation?.type === OperationType.SCRE} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.SCRE)} />
            <ECASSynthesisModal isOpen={activeModalOperation?.type === OperationType.ECAS} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.ECAS)} />
            <CSAEModal isOpen={activeModalOperation?.type === OperationType.CSAE} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.CSAE)} />
            <ASCModal isOpen={activeModalOperation?.type === OperationType.ASC} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.ASC)} />
            <NeuralForgeModal isOpen={activeModalOperation?.type === OperationType.NEURAL_FORGE} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.NEURAL_FORGE)} />
            <PalCoreAuditModal isOpen={activeModalOperation?.type === OperationType.PAL_CORE_AUDIT} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.PAL_CORE_AUDIT)} />
            <AlgorithmicCorrectionModal isOpen={activeModalOperation?.type === OperationType.ALGORITHMIC_CORRECTION} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.ALGORITHMIC_CORRECTION)} />
            
            <ERUAuditModal isOpen={isEruAuditModalOpen} onClose={() => setIsEruAuditModalOpen(false)} progress={auditProgress} />
        </div>
    );
};

export default App;
