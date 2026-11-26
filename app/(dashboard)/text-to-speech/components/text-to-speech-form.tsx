"use client";

import { useAppForm } from "@/hooks/use-app-form";
import { formOptions } from "@tanstack/react-form";
import React, { useEffect } from "react";
import z from "zod";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";
import { TRPCClientError } from "@trpc/client";
import { takeTtsDraft } from "@/lib/tts-draft";
import { useSubscriptionRequiredToast } from "../../features/billing/hooks/use-subscription-required-toast";
import { SUBSCRIPTION_REQUIRED } from "../../features/billing/lib/error-codes";
const ttsFormSchema = z.object({
  text: z.string().trim().min(1, "Please enter some text"),
  voiceId: z.string().min(1, "Please select a voice"),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number(),
  repetitionPenalty: z.number(),
});

export type TTSFormValues = z.infer<typeof ttsFormSchema>;

export const defaultTTSValue: TTSFormValues = {
  text: "",
  voiceId: "",
  temperature: 0.8,
  topP: 0.95,
  topK: 1000,
  repetitionPenalty: 1.2,
};

export const ttsFormOptions = formOptions({
  defaultValues: defaultTTSValue,
});

const TextToSpeechForm = ({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: TTSFormValues;
}) => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );
  const showSubscriptionRequired = useSubscriptionRequiredToast();
  const form = useAppForm({
    ...ttsFormOptions,
    defaultValues: defaultValues ?? defaultTTSValue,
    validators: {
      onSubmit: ttsFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const data = await createMutation.mutateAsync({
          text: value.text.trim(),
          voiceId: value.voiceId,
          temperature: value.temperature,
          topP: value.topP,
          topK: value.topK,
          repitionPenalty: value.repetitionPenalty,
        });

        toast.success("Audio generated successfully!");
        await queryClient.invalidateQueries(
          trpc.generations.getAll.queryFilter(),
        );
        router.push(`/text-to-speech/${data.id}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";

        // A TRPCClientError with a server error code came from a real server
        // response: 500s are already reported by the tRPC route and other codes
        // (NOT_FOUND, FORBIDDEN, ...) are expected. Without one the request
        // never got a response (network failure etc.), so report it here.
        const hasServerResponse =
          error instanceof TRPCClientError && !!error.data?.code;
        if (!hasServerResponse) {
          Sentry.captureException(error, { tags: { area: "tts-form" } });
        }

        if (message === SUBSCRIPTION_REQUIRED) {
          await showSubscriptionRequired();
        } else {
          toast.error(message);
        }
      }
    },
  });
  // An effect, not a default value: Next.js can keep this form mounted while
  // hidden, and effects run again when the page is shown.
  useEffect(() => {
    const draft = takeTtsDraft();
    if (draft) form.setFieldValue("text", draft);
  }, [form]);

  return <form.AppForm>{children}</form.AppForm>;
};

export default TextToSpeechForm;
