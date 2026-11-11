import { Suspense } from "react";
import { Metadata } from "next";
import TextToSpeechLayout from "./components/text-to-speech-layout";
import TextToSpeechView from "./components/text-to-speech-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = { title: "Text to Speech" };
export default async function TexttoSpeechPage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string; voiceId?: string }>;
}) {
  const { text, voiceId } = await searchParams;
  prefetch(trpc.voices.getAll.queryOptions());
  return (
    <Suspense>
      <HydrateClient>
        <TextToSpeechLayout>
          <TextToSpeechView initialValues={{ text, voiceId }} />
        </TextToSpeechLayout>
      </HydrateClient>
    </Suspense>
  );
}
