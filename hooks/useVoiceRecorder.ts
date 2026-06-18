import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

const MAX_SECONDS = 30;

export type RecorderState = 'idle' | 'recording' | 'done';

/**
 * Records a voice letter while transcribing it on-device in one mic session.
 * Uses expo-speech-recognition's `recordingOptions.persist` so we get both
 * the audio file URI and the transcript without opening the mic twice.
 *
 * On iOS this routes through SFSpeechRecognizer (Apple on-device speech).
 * On Android it uses the platform recognizer; transcript may be empty if the
 * device has no on-device model, but audio still records.
 */
export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscript = useRef('');

  // ── Event listeners ────────────────────────────────────────────────────
  useSpeechRecognitionEvent('result', (e) => {
    const t = e.results?.[0]?.transcript ?? '';
    if (t) {
      setTranscript(t);
      if (e.isFinal) finalTranscript.current = t;
    }
  });

  useSpeechRecognitionEvent('audioend', (e: any) => {
    // Fired when the recording is persisted — payload carries the file uri.
    if (e?.uri) setAudioUri(e.uri);
  });

  useSpeechRecognitionEvent('end', () => {
    stopTimer();
    setState((s) => (s === 'recording' ? 'done' : s));
  });

  useSpeechRecognitionEvent('error', (e: any) => {
    setError(e?.message ?? 'Recording error');
    stopTimer();
    setState('idle');
  });

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  useEffect(() => () => stopTimer(), []);

  // ── Controls ───────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    setError(null);
    setTranscript('');
    setAudioUri(null);
    finalTranscript.current = '';
    setSeconds(0);

    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Microphone & speech permission needed.');
      return;
    }

    try {
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: false,
        recordingOptions: {
          persist: true,
        },
      });
      setState('recording');

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) stop();
          return next;
        });
      }, 1000);
    } catch (e: any) {
      setError(e?.message ?? 'Could not start recording.');
      setState('idle');
    }
  }, []);

  const stop = useCallback(() => {
    try { ExpoSpeechRecognitionModule.stop(); } catch { /* no-op */ }
    stopTimer();
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setSeconds(0);
    setTranscript('');
    setAudioUri(null);
    setError(null);
    finalTranscript.current = '';
  }, []);

  return {
    state,
    seconds,
    transcript: finalTranscript.current || transcript,
    audioUri,
    error,
    maxSeconds: MAX_SECONDS,
    start,
    stop,
    reset,
  };
}
