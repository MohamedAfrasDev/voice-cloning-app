import { Suspense } from "react";
import { Metadata } from "next";
import TextToSpeechLayout from "./components/text-to-speech-layout";
import TextToSpeechView from "./components/text-to-speech-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { generateId } from "better-auth";

export const metadata: Metadata = { title: "Text to Speech" };

export default function TexttoSpeechPage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string; voiceId?: string }>;
}) {
  return (
    <Suspense>
      <TextToSpeechContent searchParams={searchParams} />
    </Suspense>
  );
}

// Runtime data (searchParams) is read inside Suspense so the shell can stream.
async function TextToSpeechContent({
  searchParams,
}: {
  searchParams: Promise<{ text?: string; voiceId?: string }>;
}) {
  const { text, voiceId } = await searchParams;
  prefetch(trpc.voices.getAll.queryOptions());
  prefetch(trpc.generations.getAll.queryOptions());

  return (
    <HydrateClient>
      <TextToSpeechLayout>
        <TextToSpeechView initialValues={{ text, voiceId }} />
      </TextToSpeechLayout>
    </HydrateClient>
  );
}
