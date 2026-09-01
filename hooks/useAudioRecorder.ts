import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAudioRecorderOptions { maxDurationMs?: number; onComplete?: (audio: Blob) => void; onError?: (error: Error) => void; }
export interface UseAudioRecorderResult { isRecording: boolean; start: () => Promise<void>; stop: () => void; error: Error | null; }

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((value) => MediaRecorder.isTypeSupported(value));
}

export function useAudioRecorder({ maxDurationMs = 60_000, onComplete, onError }: UseAudioRecorderOptions = {}): UseAudioRecorderResult {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (isRecording) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('Audio recording is not supported by this browser.');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      streamRef.current = stream;
      chunksRef.current = [];
      setError(null);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.onerror = () => { const err = new Error('MediaRecorder failed while capturing audio.'); setError(err); onError?.(err); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        chunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        if (blob.size > 0) onComplete?.(blob);
      };
      recorder.start(250);
      setIsRecording(true);
      timerRef.current = window.setTimeout(stop, Math.max(1_000, maxDurationMs));
    } catch (cause) {
      const err = cause instanceof Error ? cause : new Error(String(cause));
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      setError(err);
      setIsRecording(false);
      onError?.(err);
    }
  }, [isRecording, maxDurationMs, onComplete, onError, stop]);

  useEffect(() => () => { stop(); streamRef.current?.getTracks().forEach((track) => track.stop()); }, [stop]);
  return { isRecording, start, stop, error };
}

export default useAudioRecorder;
