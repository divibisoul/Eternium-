
import React from 'react';

// Modal Component Imports
import { CodexModal } from './CodexModal.tsx';
import { BlueprintModal } from './BlueprintModal.tsx';
import { ASASFPanel } from './ASASFPanel.tsx';
import { AgentsPanel } from './AgentsPanel.tsx';
import { GovernanceReportModal } from './GovernanceReportModal.tsx';
import { EvolutionCycleModal } from './EvolutionCycleModal.tsx';
import { UnifiedCognitionModal } from './modals/UnifiedCognitionModal.tsx';
import ERUDashboard from './ERUDashboard.tsx';
import PerceptionModal from './PerceptionModal.tsx';
import OrientationGuideModal from './OrientationGuideModal.tsx';
import SystemicGroundingModal from './SystemicGroundingModal.tsx';
import CognitiveCalibrationModal from './CognitiveCalibrationModal.tsx';
import FullCognitionModal from './FullCognitionModal.tsx';
import OmniModeModal from './OmniModeModal.tsx';
import RealityCheckModal from './RealityCheckModal.tsx';
import ArchitectureGuideModal from './ArchitectureGuideModal.tsx';
import EnforcementPipelineModal from './EnforcementPipelineModal.tsx';
import SCRERefactorModal from './SCRERefactorModal.tsx';
import ECASSynthesisModal from './ECASSynthesisModal.tsx';
import CSAEModal from './CSAEModal.tsx';
import ASCModal from './ASCModal.tsx';
import NeuralForgeModal from './NeuralForgeModal.tsx';
import PalCoreAuditModal from './PalCoreAuditModal.tsx';
import AlgorithmicCorrectionModal from './AlgorithmicCorrectionModal.tsx';
import ERUAuditModal from './ERUAuditModal.tsx';

// Type Imports
import { ActiveOperation, ASASFNodesState, AuditEventType, DeployedCapability, OperationType } from '../types.ts';
// Service Imports
import { transcribeAudio } from '../services/geminiService.ts';


interface ModalManagerProps {
    // Modal State Flags
    isCodexOpen: boolean;
    isBlueprintOpen: boolean;
    hasCriticalErrors: boolean;
    isAgentsPanelOpen: boolean;
    isGovernanceReportOpen: boolean;
    isEvolutionCycleOpen: boolean;
    isCognitionModalOpen: boolean;
    isEruDashboardOpen: boolean;
    isPerceptionModalOpen: boolean;
    isOrientationGuideOpen: boolean;
    isGroundingModalOpen: boolean;
    isCognitiveCalibrationOpen: boolean;
    isFullCognitionModalOpen: boolean;
    isOmniModeModalOpen: boolean;
    isRealityCheckModalOpen: boolean;
    isArchitectureGuideOpen: boolean;
    isEnforcementPipelineOpen: boolean;
    isEruAuditModalOpen: boolean;
    activeModalOperation: ActiveOperation | null;

    // Data for Modals
    asasfNodes: ASASFNodesState;
    currentPrompt: string;
    groundingCritique: string;
    promptForPipeline: string;
    imageForPipeline: File | null;
    activeOperations: ActiveOperation[];
    deployedCapabilities: DeployedCapability[];
    auditProgress: number;

    // Callbacks & Handlers
    onClose: (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => void;
    clearCriticalErrors: () => void;
    logEvent: (type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => void;
    handleSendMessage: (text: string, imageFile?: File | null) => Promise<void>;
    setActiveModalOperation: React.Dispatch<React.SetStateAction<ActiveOperation | null>>;
    
    // Individual Setters for Closing Modals
    setIsCodexOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBlueprintOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAgentsPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsGovernanceReportOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEvolutionCycleOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCognitionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEruDashboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsPerceptionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOrientationGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsGroundingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsCognitiveCalibrationOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsFullCognitionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOmniModeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsRealityCheckModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsArchitectureGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEnforcementPipelineOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsEruAuditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ModalManager: React.FC<ModalManagerProps> = (props) => {
    const { 
        onClose, 
        // Modal State
        isCodexOpen, isBlueprintOpen, hasCriticalErrors, isAgentsPanelOpen, isGovernanceReportOpen, 
        isEvolutionCycleOpen, isCognitionModalOpen, isEruDashboardOpen, isPerceptionModalOpen, 
        isOrientationGuideOpen, isGroundingModalOpen, isCognitiveCalibrationOpen, isFullCognitionModalOpen, 
        isOmniModeModalOpen, isRealityCheckModalOpen, isArchitectureGuideOpen, isEnforcementPipelineOpen, 
        isEruAuditModalOpen, activeModalOperation,
        // Data for Modals
        asasfNodes, currentPrompt, groundingCritique, promptForPipeline, imageForPipeline, 
        activeOperations, deployedCapabilities, auditProgress,
        // Callbacks & Handlers
        clearCriticalErrors, logEvent, handleSendMessage, setActiveModalOperation,
        // Individual Setters
        setIsCodexOpen, setIsBlueprintOpen, setIsAgentsPanelOpen, setIsGovernanceReportOpen, 
        setIsEvolutionCycleOpen, setIsCognitionModalOpen, setIsEruDashboardOpen, setIsPerceptionModalOpen,
        setIsOrientationGuideOpen, setIsGroundingModalOpen, setIsCognitiveCalibrationOpen, 
        setIsFullCognitionModalOpen, setIsOmniModeModalOpen, setIsRealityCheckModalOpen, 
        setIsArchitectureGuideOpen, setIsEnforcementPipelineOpen, setIsEruAuditModalOpen
    } = props;

    return (
        <>
            <CodexModal isOpen={isCodexOpen} onClose={onClose(setIsCodexOpen)} />
            <BlueprintModal isOpen={isBlueprintOpen} onClose={onClose(setIsBlueprintOpen)} logEvent={logEvent} />
            <ASASFPanel isOpen={hasCriticalErrors} nodes={asasfNodes} onRemediationComplete={clearCriticalErrors} />
            <AgentsPanel isOpen={isAgentsPanelOpen} onClose={onClose(setIsAgentsPanelOpen)} />
            <GovernanceReportModal isOpen={isGovernanceReportOpen} onClose={onClose(setIsGovernanceReportOpen)} />
            <EvolutionCycleModal isOpen={isEvolutionCycleOpen} onClose={onClose(setIsEvolutionCycleOpen)} />
            <UnifiedCognitionModal isOpen={isCognitionModalOpen} userPrompt={currentPrompt} />
            <ERUDashboard isOpen={isEruDashboardOpen} onClose={onClose(setIsEruDashboardOpen)} />
            <PerceptionModal 
                isOpen={isPerceptionModalOpen} 
                onClose={onClose(setIsPerceptionModalOpen)}
                onCapture={handleSendMessage}
                logEvent={logEvent}
                transcribeAudio={transcribeAudio}
            />
            <OrientationGuideModal isOpen={isOrientationGuideOpen} onClose={onClose(setIsOrientationGuideOpen)} />
            <SystemicGroundingModal isOpen={isGroundingModalOpen} onClose={onClose(setIsGroundingModalOpen)} critique={groundingCritique} />
            <CognitiveCalibrationModal isOpen={isCognitiveCalibrationOpen} onClose={onClose(setIsCognitiveCalibrationOpen)} />
            <FullCognitionModal isOpen={isFullCognitionModalOpen} onClose={onClose(setIsFullCognitionModalOpen)} />
            <OmniModeModal isOpen={isOmniModeModalOpen} onClose={onClose(setIsOmniModeModalOpen)} />
            <RealityCheckModal isOpen={isRealityCheckModalOpen} onClose={onClose(setIsRealityCheckModalOpen)} />
            <ArchitectureGuideModal isOpen={isArchitectureGuideOpen} onClose={onClose(setIsArchitectureGuideOpen)} deployedCapabilities={deployedCapabilities} />
            <EnforcementPipelineModal 
                isOpen={isEnforcementPipelineOpen} 
                prompt={promptForPipeline} 
                onClose={onClose(setIsEnforcementPipelineOpen)}
                onComplete={(processedPrompt) => handleSendMessage(processedPrompt, imageForPipeline)}
            />
            
            <SCRERefactorModal isOpen={activeModalOperation?.type === OperationType.SCRE} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.SCRE)} />
            <ECASSynthesisModal isOpen={activeModalOperation?.type === OperationType.ECAS} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.ECAS)} />
            <CSAEModal isOpen={activeModalOperation?.type === OperationType.CSAE} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.CSAE)} />
            <ASCModal isOpen={activeModalOperation?.type === OperationType.ASC} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.ASC)} />
            <NeuralForgeModal isOpen={activeModalOperation?.type === OperationType.NEURAL_FORGE} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.NEURAL_FORGE)} />
            <PalCoreAuditModal isOpen={activeModalOperation?.type === OperationType.PAL_CORE_AUDIT} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.PAL_CORE_AUDIT)} />
            <AlgorithmicCorrectionModal isOpen={activeModalOperation?.type === OperationType.ALGORITHMIC_CORRECTION} onClose={() => setActiveModalOperation(null)} operation={activeOperations.find(o => o.type === OperationType.ALGORITHMIC_CORRECTION)} />
            
            <ERUAuditModal isOpen={isEruAuditModalOpen} onClose={onClose(setIsEruAuditModalOpen)} progress={auditProgress} />
        </>
    );
};
