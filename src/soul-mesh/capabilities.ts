export const SOUL_CAPABILITIES = {
  generation: { id: 'ai.generate', execution: 'WEB_SESSION' as const },
  multimodal: { id: 'ai.multimodal', execution: 'WEB_SESSION' as const },
};

export function soulCapability(id: string) {
  return Object.values(SOUL_CAPABILITIES).find(capability => capability.id === id);
}
