import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();

const rules = [
  {
    file: "App.tsx",
    forbidden: [
      ["Math.random(", "estado de aplicação não pode depender de aleatoriedade sintética"],
      ["Initial status", "comentário de implantação automática não pode voltar"],
      ["Initial random metric", "métrica sintética não pode voltar"],
    ],
  },
  {
    file: "hooks/useAgiCoreSystems.ts",
    forbidden: [
      ["Math.random(", "status/telemetria sintética"],
      ["setInterval(", "polling sintético"],
      ["setTimeout(", "recuperação temporizada sintética"],
      ["Simulat", "simulação de runtime"],
    ],
  },
  {
    file: "hooks/useSystemOrchestrator.ts",
    forbidden: [
      ["setTimeout(", "boot sintético"],
      ["Simula", "boot simulado"],
    ],
  },
  {
    file: "hooks/useAsasfSystem.ts",
    forbidden: [
      ["setTimeout(", "remediação temporizada"],
      ["simulate", "remediação simulada"],
    ],
  },
  {
    file: "hooks/useReverseEquation.ts",
    forbidden: [
      ["Math.random(", "métrica ERU sintética"],
      ["setInterval(", "telemetria sintética"],
      ["Simulate", "telemetria simulada"],
    ],
  },
  {
    file: "components/DCRSMonitor.tsx",
    forbidden: [
      ["Math.random(", "telemetria DCRS sintética"],
      ["setInterval(", "telemetria DCRS temporizada"],
    ],
  },
  {
    file: "components/BNCv2Monitor.tsx",
    forbidden: [
      ["Math.random(", "telemetria BNC sintética"],
      ["setInterval(", "telemetria BNC temporizada"],
    ],
  },
  {
    file: "components/DIASPerformanceMonitor.tsx",
    forbidden: [
      ["Math.random(", "telemetria DIAS sintética"],
      ["setInterval(", "telemetria DIAS temporizada"],
    ],
  },
  {
    file: "components/GovernanceReportModal.tsx",
    forbidden: [
      ["Math.random(", "assinatura de entropia fictícia"],
      ["fake entropy", "assinatura fictícia"],
    ],
  },
  {
    file: "components/UnifiedCognitionModal.tsx",
    forbidden: [
      ["setTimeout(", "pipeline cognitivo temporizado"],
    ],
  },
  {
    file: "components/EnforcementPipelineModal.tsx",
    forbidden: [
      ["setTimeout(", "pipeline de enforcement temporizado"],
      ["duration:", "duração sintética por etapa"],
    ],
  },
  {
    file: "components/OmniModeModal.tsx",
    forbidden: [
      ["setTimeout(", "ativação de modo temporizada"],
      ["Overclock Cognitivo Estável: 240%", "afirmação de desempenho não medida"],
    ],
  },
  {
    file: "components/FullCognitionModal.tsx",
    forbidden: [
      ["setTimeout(", "ativação cognitiva temporizada"],
      ["Nível 9 Aceita", "autoridade não comprovada"],
    ],
  },
  {
    file: "components/RealityCheckModal.tsx",
    forbidden: [
      ["setTimeout(", "verificação temporizada"],
      ["FALHA CONFIRMADA", "conclusão automática não observada"],
    ],
  },
  {
    file: "components/SystemicGroundingModal.tsx",
    forbidden: [
      ["setTimeout(", "aterramento temporizado"],
      ["Protocolo de Aterramento Concluído", "conclusão automática não observada"],
    ],
  },
  {
    file: "components/CognitiveCalibrationModal.tsx",
    forbidden: [
      ["setTimeout(", "calibração temporizada"],
      ["Calibração Concluída", "conclusão automática não observada"],
    ],
  },
  {
    file: "components/OrientationGuideModal.tsx",
    forbidden: [
      ["setTimeout(", "orientação temporizada"],
      ["Ouvindo...", "captação não observada"],
      ["Entendido. Toque no seu perfil.", "observação de tela não comprovada"],
    ],
  },
  {
    file: "components/ASASFPanel.tsx",
    forbidden: [
      ["setTimeout(", "remediação ASASF temporizada"],
      ["onRemediationComplete();", "auto-resolução"],
    ],
  },
  {
    file: "services/geminiService.ts",
    forbidden: [
      ["ModuleEnforcer", "pipeline inexistente não pode ser atribuído como executado"],
      ["LEVEL: 9", "autoridade não comprovada"],
      ["Overclock", "capacidade de desempenho não comprovada"],
    ],
  },
  {
    file: "services/soulMeshAdapter.ts",
    forbidden: [
      ["success: true, output: task.input", "eco de entrada não pode representar execução real"],
    ],
  },
];

const failures = [];

for (const rule of rules) {
  const path = resolve(root, rule.file);
  const source = await readFile(path, "utf8");
  for (const [needle, reason] of rule.forbidden) {
    if (source.includes(needle)) {
      failures.push({ file: rule.file, needle, reason });
    }
  }
}

if (failures.length) {
  console.error("AETERNUM_EVIDENCE_BOUNDARY_FAILED");
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.reason} [${failure.needle}]`);
  }
  process.exitCode = 1;
} else {
  console.log(`AETERNUM_EVIDENCE_BOUNDARY_OK: ${rules.length} critical files checked`);
}
