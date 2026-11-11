"use client";

import { useAppForm } from "@/hooks/use-app-form";
import { formOptions } from "@tanstack/react-form";
import React from "react";
import z from "zod";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import error from "next/error";
const ttsFormSchema = z.object({
  text: z.string().min(1, "Please enter some text"),
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
  const createMutation = useMutation(
    trpc.generations.create.mutationOptions({}),
  );
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

        toast.success("Audio geenrated successfully!");
        router.push(`/text-to-speech/${data.id}`);
      } catch {
        const message =
          error instanceof Error ? error.message : "Failed to generate audio";
      }
    },
  });
  return <form.AppForm>{children}</form.AppForm>;
};

export default TextToSpeechForm;
