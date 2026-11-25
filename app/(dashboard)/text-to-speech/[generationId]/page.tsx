import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import TextToSpeechDetailView from "../components/text-to-speech-detail-view";

export default function TextToSpeechDetailPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  return (
    <Suspense>
      <DetailContent params={params} />
    </Suspense>
  );
}

async function DetailContent({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;

  prefetch(trpc.generations.getById.queryOptions({ id: generationId }));
  prefetch(trpc.voices.getAll.queryOptions());

  prefetch(trpc.generations.getAll.queryOptions());

  return (
    <HydrateClient>
      <TextToSpeechDetailView generationId={generationId} />
    </HydrateClient>
  );
}
