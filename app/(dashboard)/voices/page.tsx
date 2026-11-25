import { Metadata } from "next";
import { SearchParams } from "nuqs/server";
import React from "react";
import { voiceSearchParamsCache } from "../features/voices/lib/params";
import { prefetch, trpc, HydrateClient } from "@/trpc/server";
import { VoicesView } from "../features/voices/views/voices-view";

export const metadata: Metadata = { title: "Voices" };

export default async function VoicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query } = await voiceSearchParamsCache.parse(searchParams);
  prefetch(trpc.voices.getAll.queryOptions({ query }));
  return (
    <HydrateClient>
      <VoicesView />
    </HydrateClient>
  );
}
