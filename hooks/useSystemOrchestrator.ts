
import { useEffect } from 'react';
import { AuditEventType } from '../types.ts';

const BOOT_TIMEOUT = 10000; // 10 segundos

/**
 * Hook para gerenciar o processo de inicialização silenciosa do sistema em segundo plano.
 * Não retorna nenhum estado e não bloqueia a renderização da UI.
 * Se a inicialização falhar (por timeout ou erro), registra um erro crítico
 * que acionará o sistema de remediação ASASF.
 * @param logEvent - Função do hook useAuditSystem para registrar eventos.
 */
export const useSystemOrchestrator = (
    logEvent: (type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => void
) => {  
  useEffect(() => {
    // Este efeito é executado apenas uma vez na montagem do aplicativo.
    
    // A interface não possui autoridade para inicializar módulos internos.
    // O runtime real deve sinalizar sua própria prontidão; este hook apenas
    // mantém observabilidade quando essa prontidão não está exposta aqui.
    logEvent(
      AuditEventType.SYSTEM_INIT,
      'Orquestração de frontend não simulada; aguardando estado do runtime real.',
      'info',
    );
      
  // A lista de dependências está vazia para garantir que este processo de boot seja executado apenas uma vez.
  // A função logEvent é estável (definida com useCallback no hook de origem).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};