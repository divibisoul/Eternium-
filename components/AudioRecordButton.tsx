import React, { useEffect, useRef, useState } from 'react';

type AudioRecordButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onRecordingComplete?: (audio: Blob) => void;
  onRecordingError?: (error: Error) => void;
  maxDurationMs?: number;
};

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((value) => MediaRecorder.isTypeSupported(value));
}

export default function AudioRecordButton({
  onRecordingComplete,
  onRecordingError,
  maxDurationMs = 60_000,
  disabled,
  children,
  type = 'button',
  onClick,
  ...rest
}: AudioRecordButtonProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('Audio recording is not supported by this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        const error = new Error('MediaRecorder failed while capturing audio.');
        onRecordingError?.(error);
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };
      recorder.onstop = () => {
        const blobType = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        chunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
        if (blob.size > 0) onRecordingComplete?.(blob);
      };
      recorder.start(250);
      setRecording(true);
      timerRef.current = window.setTimeout(stopRecording, Math.max(1_000, maxDurationMs));
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      const normalized = error instanceof Error ? error : new Error(String(error));
      onRecordingError?.(normalized);
      setRecording(false);
    }
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    if (recording) stopRecording();
    else await startRecording();
  };

  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      aria-pressed={recording}
      aria-label={recording ? 'Stop recording' : 'Start recording'}
      onClick={handleClick}
    >
      {children ?? (recording ? 'Stop recording' : 'Record audio')}
    </button>
  );
}
