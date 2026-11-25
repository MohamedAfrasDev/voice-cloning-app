import { useCallback, useEffect, useRef, useState } from "react";
import RecordRTCType from "recordrtc";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<RecordRTCType | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const micStreamRef = useRef<{ onDestroy: () => void } | null>(null);
  // Bumped on reset/unmount so an in-flight startRecording can tell it was
  // cancelled and must not acquire (or keep) the mic after being disposed.
  const startIdRef = useRef(0);
  // True while a start is awaiting the mic prompt / recorder import, so a
  // double click can't acquire a second stream and leak the first.
  const isStartingRef = useRef(false);

  const destroyWaveSurfer = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.onDestroy();
      micStreamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.destroy();
      wsRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recorderRef.current) {
      recorderRef.current.destroy();
      recorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    destroyWaveSurfer();
  }, [destroyWaveSurfer]);

  // Release the timer, recorder and mic when the component unmounts.
  useEffect(() => {
    return () => {
      // Counter, not a DOM node: we want the latest value on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      startIdRef.current++;
      isStartingRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (!isRecording || !containerRef.current || !streamRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "hsl(var(--foreground) / 0.5)",
      height: 144,
      barWidth: 1,
      barGap: 2,
      barRadius: 1,
      cursorWidth: 0,
      barMinHeight: 10,
      barHeight: 2,
      normalize: true,
    });

    wsRef.current = ws;

    const record = ws.registerPlugin(
      RecordPlugin.create({ scrollingWaveform: true }),
    );

    const handle = record.renderMicStream(streamRef.current);
    micStreamRef.current = handle;

    return () => {
      destroyWaveSurfer();
    };
  }, [isRecording, destroyWaveSurfer]);

  const startRecording = useCallback(async () => {
    if (isStartingRef.current || recorderRef.current) return;

    isStartingRef.current = true;
    const startId = ++startIdRef.current;
    const isCancelled = () => startIdRef.current !== startId;

    try {
      setError(null);
      setAudioBlob(null);
      setElapsedTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      if (isCancelled()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const { default: RecordRTC, StereoAudioRecorder } =
        await import("recordrtc");

      if (isCancelled()) {
        stream.getTracks().forEach((track) => track.stop());
        if (streamRef.current === stream) streamRef.current = null;
        return;
      }

      const recorder = new RecordRTC(stream, {
        recorderType: StereoAudioRecorder,
        mimeType: "audio/wav",
        numberOfAudioChannels: 1,
        desiredSampRate: 44100,
      });

      recorderRef.current = recorder;
      recorder.startRecording();

      setIsRecording(true);
      const startTime = Date.now();

      timerRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    } catch (error) {
      if (isCancelled()) return;
      cleanup();

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings.",
        );
      } else {
        setError("Failed to access microphone. Please check your device.");
      }
    } finally {
      // A cancelled start already had its flag cleared (or handed to a newer
      // start) by reset/unmount, so only the current start may clear it.
      if (!isCancelled()) isStartingRef.current = false;
    }
  }, [cleanup]);

  const stopRecording = useCallback(
    (onBlob?: (blob: Blob) => void) => {
      const recorder = recorderRef.current;

      if (!recorder) return;

      recorder.stopRecording(() => {
        const blob = recorder.getBlob();
        setAudioBlob(blob);
        setIsRecording(false);
        cleanup();
        onBlob?.(blob);
      });
    },
    [cleanup],
  );

  const resetRecording = useCallback(() => {
    startIdRef.current++;
    isStartingRef.current = false;
    cleanup();
    setIsRecording(false);
    setElapsedTime(0);
    setAudioBlob(null);
    setError(null);
  }, [cleanup]);

  return {
    isRecording,
    elapsedTime,
    audioBlob,
    containerRef,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
