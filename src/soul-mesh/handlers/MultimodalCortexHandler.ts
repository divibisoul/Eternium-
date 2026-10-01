import { createExternalProvider, requireRecord, requireString } from './N02ExternalHandlerSupport';
export class MultimodalCortexHandler {
  private readonly provider = createExternalProvider();
  async handle(input: unknown, correlationId: string) {
    const value = requireRecord(input, 'multimodal_cortex');
    const text = typeof value.text === 'string' && value.text.trim() ? value.text.trim() : undefined;
    const audio = typeof value.audioBase64 === 'string' && value.audioBase64.trim() ? value.audioBase64.trim() : undefined;
    const image = typeof value.imageBase64 === 'string' && value.imageBase64.trim() ? value.imageBase64.trim() : undefined;
    if (!text && !audio && !image) throw new Error('N02_MULTIMODAL_MODALITY_REQUIRED');
    const [textAnalysis, audioAnalysis, imageAnalysis] = await Promise.all([
      text ? this.provider.text('Analyze semantics of text. Text: ' + text, correlationId) : Promise.resolve<string | undefined>(undefined),
      audio ? this.provider.transcribe(audio, requireString(value, 'audioMimeType')) : Promise.resolve<string | undefined>(undefined),
      image ? this.provider.vision(image, requireString(value, 'imageMimeType'), 'Analyze objects, scene, text, spatial relations and uncertainty in this image.', correlationId) : Promise.resolve<string | undefined>(undefined),
    ]);
    const analyses: Record<string,string> = {};
    if (textAnalysis) analyses.text = textAnalysis;
    if (audioAnalysis) analyses.audio = audioAnalysis;
    if (imageAnalysis) analyses.visual = imageAnalysis;
    const fused = await this.provider.json<{representation:string;confidence:number}>('Fuse these grounded modality analyses. Return JSON {"representation":string,"confidence":0..1}. Never invent missing facts. Analyses: ' + JSON.stringify(analyses), correlationId, 'multimodal-fusion');
    return { fused_representation: fused.representation, confidence: Math.max(0, Math.min(1, Number(fused.confidence))), modalities_used: Object.keys(analyses), analyses };
  }
}