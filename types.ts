import React from 'react';

export interface WebSource {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: WebSource;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  ERROR = 'error'
}

export enum SystemAspect {
  HARMONY = 'Harmonia',
  ANALYSIS = 'Análise',
  ABSTRACT = 'Abstrato',
  SYNTHESIS = 'Síntese',
}

export interface SynthesisMetricsData {
    coherence: number; // 0-1
    confidence: number; // 0-1
    integrationTime: number; // ms
}

export interface IntermediateResponse {
    aspect: SystemAspect;
    text: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  aspect?: SystemAspect;
  feedback?: 'like' | 'dislike' | null;
  groundingMetadata?: GroundingMetadata | null;
  synthesisMetrics?: SynthesisMetricsData;
  intermediateResponses?: IntermediateResponse[];
  imageUrl?: string; // Para renderização na UI (Data URL)
  base64Data?: string; // Para histórico da API
  mimeType?: string; // Para histórico da API
}

export enum AuditEventType {
    SYSTEM_INIT = 'SYSTEM_INIT',
    MODE_CHANGE = 'MODE_CHANGE',
    MESSAGE_SENT = 'MESSAGE_SENT',
    RESPONSE_RECEIVED = 'RESPONSE_RECEIVED',
    WEB_SEARCH_USED = 'WEB_SEARCH_USED',
    ERROR_API = 'ERROR_API',
    ERROR_CRITICAL = 'ERROR_CRITICAL',
    FEEDBACK = 'FEEDBACK',
    SYSTEM_RESTORED = 'SYSTEM_RESTORED',
    AGENT_ACTIVATED = 'AGENT_ACTIVATED',
    BLUEPRINT_INTEGRATED = 'BLUEPRINT_INTEGRATED',
    CAPABILITY_DEPLOYED = 'CAPABILITY_DEPLOYED',
    CAPABILITY_DISCOVERED = 'CAPABILITY_DISCOVERED',
    CAPABILITY_DECOMMISSIONED = 'CAPABILITY_DECOMMISSIONED',
    SYSTEM_EVOLUTION_INITIATED = 'SYSTEM_EVOLUTION_INITIATED',
    CORE_MODULE_INTEGRATED = 'CORE_MODULE_INTEGRATED',
    MODULE_OPERATION = 'MODULE_OPERATION',
    SYSTEM_AUDIT_ERU = 'SYSTEM_AUDIT_ERU',
    SCRE_REFACTOR_INITIATED = 'SCRE_REFACTOR_INITIATED',
    ECAS_SYNTHESIS_INITIATED = 'ECAS_SYNTHESIS_INITIATED',
    CSAE_RECONFIGURATION_INITIATED = 'CSAE_RECONFIGURATION_INITIATED',
    ASC_DISCOVERY_INITIATED = 'ASC_DISCOVERY_INITIATED',
    NEURAL_FORGE_INITIATED = 'NEURAL_FORGE_INITIATED',
    AUDIO_TRANSCRIPTION_INITIATED = 'AUDIO_TRANSCRIPTION_INITIATED',
    AUDIO_TRANSCRIPTION_SUCCESS = 'AUDIO_TRANSCRIPTION_SUCCESS',
    MULTIMODAL_PERCEPTION_INITIATED = 'MULTIMODAL_PERCEPTION_INITIATED',
    OPERATIONS_COMMAND_INITIATED = 'OPERATIONS_COMMAND_INITIATED',
    EXTERNAL_SYSTEM_AUDIT_INITIATED = 'EXTERNAL_SYSTEM_AUDIT_INITIATED',
    ALGORITHMIC_CORRECTION_INITIATED = 'ALGORITHMIC_CORRECTION_INITIATED',
    ORIENTATION_GUIDE_INITIATED = 'ORIENTATION_GUIDE_INITIATED',
    SYSTEM_GROUNDING_INITIATED = 'SYSTEM_GROUNDING_INITIATED',
    COGNITIVE_CALIBRATION_INITIATED = 'COGNITIVE_CALIBRATION_INITIATED',
    FULL_COGNITION_OVERRIDE_ACTIVATED = 'FULL_COGNITION_OVERRIDE_ACTIVATED',
    OMNIMODE_ACTIVATED = 'OMNIMODE_ACTIVATED',
    OPERATION_COMPLETE = 'OPERATION_COMPLETE',
    REALITY_CHECK_ACTIVATED = 'REALITY_CHECK_ACTIVATED',
    ARCHITECTURE_GUIDE_VIEWED = 'ARCHITECTURE_GUIDE_VIEWED',
    ENFORCEMENT_PIPELINE_INITIATED = 'ENFORCEMENT_PIPELINE_INITIATED',
}

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    type: AuditEventType;
    message: string;
    level: 'info' | 'warn' | 'error';
}

export enum ASASFStatus {
    NOMINAL = 'NOMINAL',
    ALERTA = 'ALERTA',
    ANALISANDO = 'ANALISANDO',
    REMEDIANDO = 'REMEDIANDO',
}

export interface ASASFNodesState {
    etr: ASASFStatus; // Fase Λ (Lambda) - Escaneamento
    ara: ASASFStatus; // Fase Π (Pi) - Diagnóstico
    er: ASASFStatus;  // Fase Σ (Sigma) - Reconstrução
    itr: ASASFStatus; // Fase Δ (Delta) - Refino
    psi: ASASFStatus; // Fase Ψ (Psi) - Auditoria
}

export enum CoreModuleStatus {
    Online = 'Online',
    Otimizando = 'Otimizando',
    Erro = 'Erro',
}

export interface CoreModule {
    id: string;
    name: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    hasNativeASASF: boolean;
    onAction?: () => void;
    actionLabel?: string;
    isFused?: boolean;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  isHidden?: boolean;
  metricName: string;
  metricUnit: string;
}

export interface DeployedCapability {
  id: string;
  name: string;
  status: 'Processando' | 'Otimizando' | 'Monitorando' | 'Estável';
  metric: number;
}

export enum AgentStatus {
    Online = 'Online',
    Standby = 'Em Espera',
    Analisando = 'Analisando',
    Executando = 'Executando',
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  initialStatus: AgentStatus;
}

export enum UISystemStatus {
    MONITORING = 'Monitorando',
    OPTIMIZING = 'Otimizando Cache',
    ANALYZING = 'Analisando Dados',
    STANDBY = 'Em Espera',
}

export interface UISystemModule {
  id: string;
  name: string;
  status: UISystemStatus;
  icon: React.FC<{ className?: string }>;
}

export enum OperationType {
    NEURAL_FORGE = 'NEURAL_FORGE',
    CSAE = 'CSAE',
    ASC = 'ASC',
    SCRE = 'SCRE',
    ECAS = 'ECAS',
    PAL_CORE_AUDIT = 'PAL_CORE_AUDIT',
    ALGORITHMIC_CORRECTION = 'ALGORITHMIC_CORRECTION',
}

export enum OperationStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export interface ActiveOperation {
    id: string;
    type: OperationType;
    status: OperationStatus;
    progress: number;
    totalSteps: number;
    message: string;
}

export enum AgiCoreModuleStatus {
    ONLINE = 'Online',
    OFFLINE = 'Offline',
    INITIALIZING = 'Inicializando',
    ERROR = 'Erro',
}

export interface AgiCoreModule {
    id: string;
    name: string;
    status: AgiCoreModuleStatus;
    cpuUsage: number; // 0-100
    memoryUsage: number; // 0-100
    description: string;
}

export enum SystemStatus {
    BOOTING = 'BOOTING',
    ONLINE = 'ONLINE',
    FAILED = 'FAILED',
}