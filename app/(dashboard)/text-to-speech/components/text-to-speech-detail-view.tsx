"use client";
import React from "react";
import TextInputPanel from "./text-input-panel";
import VoicePreviewPlaceholder from "./voice-preview-placeholder";
import SettingsPanel from "./settings-panel";
import TextToSpeechForm, {
  defaultTTSValue,
  TTSFormValues,
} from "./text-to-speech-form";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { TTSVoicesProvider } from "../contexts/tts-voices-context";
import { VoicePreviewPanel } from "./voice-preview-panel";
import { VoicePreviewMobile } from "./voice-preview-mobile";
import { useMediaQuery } from "@/hooks/use-media-query";

const TextToSpeechDetailView = ({ generationId }: { generationId: string }) => {
  const trpc = useTRPC();
  // Matches the `lg` breakpoint used by the layout.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [generationQuery, voicesQuery] = useSuspenseQueries({
    queries: [
      trpc.generations.getById.queryOptions({ id: generationId }),
      trpc.voices.getAll.queryOptions(),
    ],
  });

  const data = generationQuery.data;
  const { custom: customVoices, system: systemVoices } = voicesQuery.data;

  const allVoices = [...customVoices, ...systemVoices];
  const fallbackVoiceId = allVoices[0]?.id ?? "";

  const resolvedVoiceId =
    data?.voiceId && allVoices.some((v) => v.id === data.voiceId)
      ? data.voiceId
      : fallbackVoiceId;

  const defaultValues: TTSFormValues = {
    text: data.text,
    voiceId: resolvedVoiceId,
    temperature: data.temperature,
    topP: data.topP,
    topK: data.topK,
    repetitionPenalty: data.repetitionPenalty,
  };

  const generatipnVoice = {
    id: data.voiceId ?? undefined,
    name: data.voiceName,
  };
  return (
    <TTSVoicesProvider value={{ customVoices, systemVoices, allVoices }}>
      <TextToSpeechForm key={generationId} defaultValues={defaultValues}>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            <TextInputPanel />

            {/* Mount only one player: a hidden one would still autoplay. */}
            {isDesktop === false && (
              <VoicePreviewMobile
                audioUrl={data.audioUrl}
                voice={generatipnVoice}
                text={data.text}
              />
            )}
            {isDesktop === true && (
              <VoicePreviewPanel
                audioUrl={data.audioUrl}
                voice={generatipnVoice}
                text={data.text}
              />
            )}
          </div>
          <SettingsPanel />
        </div>
      </TextToSpeechForm>
    </TTSVoicesProvider>
  );
};

export default TextToSpeechDetailView;
