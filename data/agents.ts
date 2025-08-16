
import { Agent, AgentStatus } from '../types.ts';
import {
    ShieldExclamationIcon,
    LightBulbIcon,
    CodeBracketIcon,
    ServerStackIcon,
} from '../components/icons.tsx';

export const agents: Agent[] = [
    {
        id: 'null_sentinel',
        name: 'Null Sentinel',
        description: 'Agente de segurança defensivo que monitora anomalias de dados e tentativas de intrusão.',
        icon: ShieldExclamationIcon,
        initialStatus: AgentStatus.Online,
    },
    {
        id: 'oracle',
        name: 'The Oracle',
        description: 'Agente de previsão que analisa tendências para antecipar eventos futuros.',
        icon: LightBulbIcon,
        initialStatus: AgentStatus.Analisando,
    },
    {
        id: 'architect',
        name: 'The Architect',
        description: 'Agente de infraestrutura que otimiza a alocação de recursos e a topologia da rede.',
        icon: ServerStackIcon,
        initialStatus: AgentStatus.Standby,
    },
    {
        id: 'weaver',
        name: 'The Weaver',
        description: 'Agente de código que refatora e otimiza algoritmos em tempo de execução.',
        icon: CodeBracketIcon,
        initialStatus: AgentStatus.Executando,
    },
];
