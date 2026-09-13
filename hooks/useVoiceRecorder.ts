import { useEffect, useRef, useState, useCallback } from 'react';
import { requireOptionalNativeModule } from 'expo';

/**
 * Optional handle to the expo-speech-recognition native module.
 *
 * We resolve it with `requireOptionalNativeModule` (NOT `requireNativeModule`)
 * and deliberately do NOT `import` from 'expo-speech-recognition' — that package
 * runs `requireNativeModule("ExpoSpeechRecognition")` at module-load time, which
 * throws hard when the native code isn't in the current build. That throw used to
 * crash the entire letter composer the moment it mounted (useVoiceRecorder runs
 * unconditionally), even in text/Love-Card mode.
 *
 * With the optional API, a missing native module simply resolves to `null`:
 * voice recording reports as unavailable until the app is rebuilt, while text and
 * Love Card letters keep working.
 */
const SpeechModule: any = requireOptionalNativeModule('ExpoSpeechRecognition');

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

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── Native event listeners (no-op when the module is unavailable) ─────────
  useEffect(() => {
    if (!SpeechModule) return;

    const subs = [
      SpeechModule.addListener('result', (e: any) => {
        const t = e?.results?.[0]?.transcript ?? '';
        if (t) {
          setTranscript(t);
          if (e.isFinal) finalTranscript.current = t;
        }
      }),
      // Fired when the recording is persisted — payload carries the file uri.
      SpeechModule.addListener('audioend', (e: any) => {
        if (e?.uri) setAudioUri(e.uri);
      }),
      SpeechModule.addListener('end', () => {
        stopTimer();
        setState((s) => (s === 'recording' ? 'done' : s));
      }),
      SpeechModule.addListener('error', (e: any) => {
        setError(e?.message ?? 'Recording error');
        stopTimer();
        setState('idle');
      }),
    ];
    return () => subs.forEach((s) => s?.remove?.());
  }, [stopTimer]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  // ── Controls ───────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    try { SpeechModule?.stop(); } catch { /* no-op */ }
    stopTimer();
  }, [stopTimer]);

  const start = useCallback(async () => {
    if (!SpeechModule) {
      setError('Voice letters need the latest version of the app.');
      return;
    }
    setError(null);
    setTranscript('');
    setAudioUri(null);
    finalTranscript.current = '';
    setSeconds(0);

    const perm = await SpeechModule.requestPermissionsAsync();
    if (!perm?.granted) {
      setError('Microphone & speech permission needed.');
      return;
    }

    try {
      SpeechModule.start({
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
  }, [stop]);

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
    /** False when the speech-recognition native module isn't in this build. */
    available: !!SpeechModule,
    start,
    stop,
    reset,
  };
}
