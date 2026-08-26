import type { DeployedCapability, SystemAspect } from '../types.ts';
import {
  getSoulAIProvider,
  processUserDirective as processWithSoulProvider,
  transcribeAudio as transcribeWithSoulProvider,
  type AIContent,
} from './aiProvider.ts';

/**
 * Compatibility boundary for legacy imports.
 *
 * This file no longer creates or owns an AI client. The actual provider is
 * injected at runtime by the hybrid APK Web Session / AI Pilot.
 */
export async function processUserDirective(
  mode: SystemAspect,
  contents: AIContent[],
  useWebSearch: boolean,
  deployedCapabilities: DeployedCapability[],
  isFullCognitionMode: boolean,
) {
  const response = await processWithSoulProvider(
    mode,
    contents,
    useWebSearch,
    deployedCapabilities,
    isFullCognitionMode,
  );

  return {
    text: response.text,
    candidates: response.groundingMetadata
      ? [{ groundingMetadata: response.groundingMetadata }]
      : [],
  };
}

export async function transcribeAudio(audioBase64: string, mimeType: string) {
  return transcribeWithSoulProvider(audioBase64, mimeType);
}

export { getSoulAIProvider };
