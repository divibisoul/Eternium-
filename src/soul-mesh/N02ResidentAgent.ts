export const N02_RESIDENT_AGENT = {
  id: 'N02.resident',
  name: 'Agent-Neural Inference Steward',
  nucleus: 'N02',
  version: '1.0.0',
  role: 'conversation-generation-neural-context',
  executionMode: 'embedded-local-worker',
  lifecycle: 'BOUND',
  repositoryWrite: false,
  superpowers: {
    revision: '8ca22dba9a94f28898bbce59f2537ff4d87c747d',
    mode: 'development-methodology-and-skill-pack',
    runtimePolicyEngine: false,
  },
  skills: ['brainstorming','test-driven-development','systematic-debugging','verification-before-completion'],
  publishedCapabilities: ['mesh.health','mesh.discovery','mesh.resident.describe@1.0.0','inference.*','model-routing-evidence','mesh.supergpu.execute@1.0.0','superagi.fabric.execute@1.0.0'],
  authority: 'N02 owns native neural/language inference; external agent frameworks are provider implementations.',
  evidence: 'soul-evidence/1',
} as const;
