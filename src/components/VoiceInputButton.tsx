// ============================================================
// 语音输入按钮 - Web Speech API
// ============================================================

import { useState, useEffect, useCallback } from 'react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

// SpeechRecognition type declaration
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

function getSpeechRecognition(): ISpeechRecognition | null {
  const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognitionConstructor) return null;
  return new SpeechRecognitionConstructor() as ISpeechRecognition;
}

export function VoiceInputButton({ onTranscript, className = '' }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(getSpeechRecognition() !== null);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported, onTranscript]);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={startListening}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-colors ${
        isListening
          ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
          : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
      } ${className}`}
    >
      {isListening ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
          </svg>
          正在录音...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          语音输入
        </>
      )}
    </button>
  );
}