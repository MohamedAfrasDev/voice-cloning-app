import { Metadata } from "next";
import TextToSpeechLayout from "./components/text-to-speech-layout";
import TextToSpeechView from "./components/text-to-speech-view";

export const metadata: Metadata = { title: "Text to Speech" };
export default function TexttoSpeechPage() {
  return (
    <TextToSpeechLayout>
      <TextToSpeechView />
    </TextToSpeechLayout>
  );
}
