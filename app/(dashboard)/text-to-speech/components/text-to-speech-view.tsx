import React from "react";
import TextInputPanel from "./text-input-panel";
import VoicePreviewPlaceholder from "./voice-preview-placeholder";
import SettingsPanel from "./settings-panel";
import TextToSpeechForm from "./text-to-speech-form";

const TextToSpeechView = () => {
  return (
    <TextToSpeechForm>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col">
          <TextInputPanel />
          <VoicePreviewPlaceholder />
        </div>
        <SettingsPanel />
      </div>
    </TextToSpeechForm>
  );
};

export default TextToSpeechView;
