import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraIcon, MicrophoneIcon, XMarkIcon, CheckIcon, ArrowsPathIcon, ViewfinderCircleIcon } from './icons.tsx';
import { AuditEventType } from '../types.ts';

interface PerceptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (text: string, imageFile: File | null) => void;
    logEvent: (type: AuditEventType, message: string, level: 'info' | 'warn' | 'error') => void;
    transcribeAudio: (audioBase64: string, mimeType: string) => Promise<string>;
}

const PerceptionModal: React.FC<PerceptionModalProps> = ({ isOpen, onClose, onCapture, logEvent, transcribeAudio }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const cleanup = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setIsProcessing(false);
        setError(null);
    }, [stream]);

    useEffect(() => {
        const setup = async () => {
            if (isOpen) {
                try {
                    setError(null);
                    logEvent(AuditEventType.MULTIMODAL_PERCEPTION_INITIATED, 'Modo de Percepção Ativa iniciado.', 'info');
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Erro ao acessar mídia:", err);
                    const msg = "Permissão para câmera e microfone negada ou dispositivo não encontrado.";
                    setError(msg);
                    logEvent(AuditEventType.ERROR_API, msg, 'error');
                }
            } else {
                cleanup();
            }
        };
        setup();
        return () => cleanup();
    }, [isOpen, logEvent, cleanup]);

    const handleCapture = async () => {
        if (!videoRef.current || !stream) return;

        setIsProcessing(true);
        let transcribedText = '';
        let imageFile: File | null = null;
        
        // Capture audio
        const audioPromise = new Promise<string>((resolve, reject) => {
            try {
                const supportedTypes = ['audio/webm', 'audio/mp4', 'audio/ogg'];
                const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type));
                if (!mimeType) throw new Error("Nenhum tipo de MIME de áudio suportado.");

                const recorder = new MediaRecorder(stream, { mimeType });
                mediaRecorderRef.current = recorder;
                const audioChunks: Blob[] = [];

                recorder.ondataavailable = e => audioChunks.push(e.data);
                recorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: mimeType });
                    if (audioBlob.size > 0) {
                        const reader = new FileReader();
                        reader.readAsDataURL(audioBlob);
                        reader.onloadend = async () => {
                            const base64Audio = (reader.result as string).split(',')[1];
                            try {
                                const text = await transcribeAudio(base64Audio, mimeType);
                                logEvent(AuditEventType.AUDIO_TRANSCRIPTION_SUCCESS, 'Áudio transcrito com sucesso.', 'info');
                                resolve(text);
                            } catch (e) {
                                reject(e);
                            }
                        };
                    } else {
                        resolve(''); // Resolve with empty string if no audio data
                    }
                };
                recorder.start();
                setTimeout(() => recorder.stop(), 5000); // 5s recording
            } catch (e) {
                reject(e);
            }
        });

        // Capture image
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageBlob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        if (imageBlob) {
            imageFile = new File([imageBlob], "capture.jpg", { type: "image/jpeg" });
        }
        
        try {
            transcribedText = await audioPromise;
            onCapture(transcribedText, imageFile);
            onClose();
        } catch(err) {
            const msg = err instanceof Error ? err.message : "Erro desconhecido durante a captura.";
            setError(msg);
            logEvent(AuditEventType.ERROR_API, `Erro de captura: ${msg}`, 'error');
            setIsProcessing(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-gray-900 border border-cyan-500/30 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-20">
                    <XMarkIcon className="w-8 h-8"/>
                </button>
                <div className="relative w-full aspect-video bg-black rounded-t-lg overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    {error && <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white text-center p-4">{error}</div>}
                    <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-black/50 p-2 rounded-lg">
                        <CameraIcon className="w-5 h-5 text-white"/>
                        <MicrophoneIcon className={`w-5 h-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-white'}`}/>
                    </div>
                </div>
                <div className="p-4 flex items-center justify-center">
                    <button 
                        onClick={handleCapture}
                        disabled={isProcessing || !!error}
                        className="p-4 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessing ? <ArrowsPathIcon className="w-8 h-8 animate-spin" /> : <ViewfinderCircleIcon className="w-8 h-8" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PerceptionModal;