"use client";

import * as Sentry from "@sentry/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioPlayback(src: string | File | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Only set for object URLs this hook created from a File; caller-supplied
  // string URLs are never revoked.
  const objectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detach the audio element, then revoke any object URL we created for it.
  const releaseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      releaseAudio();
      // The next src starts from a clean slate, not the old src's state.
      setIsPlaying(false);
      setIsLoading(false);
    };
  }, [src, releaseAudio]);

  const togglePlay = useCallback(() => {
    if (!src) return;

    // A failed element stays in its error state, so on failure we drop it and
    // the next toggle builds a fresh one (that is what makes retry work).
    const handleFailure = (audio: HTMLAudioElement, error: unknown) => {
      if (audioRef.current !== audio) return; // stale: src changed/unmounted
      setIsPlaying(false);
      setIsLoading(false);
      releaseAudio();
      Sentry.captureException(error, { tags: { area: "audio-playback" } });
    };

    if (!audioRef.current) {
      let url: string;
      if (src instanceof File) {
        url = URL.createObjectURL(src);
        objectUrlRef.current = url;
      } else {
        url = src;
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.addEventListener("ended", () => setIsPlaying(false));
      audio.addEventListener("canplaythrough", () => setIsLoading(false), {
        once: true,
      });
      audio.addEventListener("error", () =>
        handleFailure(
          audio,
          new Error(
            `Audio failed to load (MediaError code ${audio.error?.code ?? "unknown"})`,
          ),
        ),
      );
    }

    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error: unknown) => {
          // play() rejects with AbortError when a pause/src change interrupts
          // it; that's expected, not a failure to report.
          if (error instanceof DOMException && error.name === "AbortError") {
            if (audioRef.current === audio) setIsLoading(false);
            return;
          }
          handleFailure(audio, error);
        });
    }
  }, [src, isPlaying, releaseAudio]);

  return { isPlaying, isLoading, togglePlay };
}
