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
import { useSuspenseQuery } from "@tanstack/react-query";
import { TTSVoicesProvider } from "../contexts/tts-voices-context";

const TextToSpeechView = ({
  initialValues,
}: {
  initialValues?: Partial<TTSFormValues>;
}) => {
  const trpc = useTRPC();

  const { data: voices } = useSuspenseQuery(trpc.voices.getAll.queryOptions());

  const { custom: customVoices, system: systemVoices } = voices;

  const allVoices = [...customVoices, ...systemVoices];
  const fallbackVoiceId = allVoices[0]?.id ?? "";

  const resolvedVoiceId =
    initialValues?.voiceId &&
    allVoices.some((v) => v.id === initialValues.voiceId)
      ? initialValues.voiceId
      : fallbackVoiceId;

  const defaultValues: TTSFormValues = {
    ...defaultTTSValue,
    ...initialValues,
    voiceId: resolvedVoiceId,
  };
  return (
    <TTSVoicesProvider value={{ customVoices, systemVoices, allVoices }}>
      <TextToSpeechForm defaultValues={defaultValues}>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            <TextInputPanel />
            <VoicePreviewPlaceholder />
          </div>
          <SettingsPanel />
        </div>
      </TextToSpeechForm>
    </TTSVoicesProvider>
  );
};

export default TextToSpeechView;
