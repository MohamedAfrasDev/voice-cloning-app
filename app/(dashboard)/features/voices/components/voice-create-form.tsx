import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTRPC } from "@/trpc/client";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import locales from "locale-codes";
import { useDropzone } from "react-dropzone";
import {
  AlignLeft,
  AudioLines,
  Check,
  ChevronsUpDown,
  FileAudio,
  FolderOpen,
  Globe,
  Layers,
  Mic,
  Pause,
  Play,
  Tag,
  Upload,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import z, { int } from "zod";
import {
  VOICE_CATEGORIES,
  VOICE_CATEGORY_LABELS,
} from "../data/voice-categories";
import { InputGroupTextarea } from "@/components/ui/input-group";
import { VoiceCategory } from "@/generated/prisma/enums";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useAudioPlayback } from "@/hooks/use-audio-playback";
import { formatFileSize } from "@/lib/utils";
import { VoiceRecorder } from "./voice-recorder";
import { postJson, uploadFile } from "../lib/upload-voice";
import {
  MAX_UPLOAD_SIZE_BYTES,
  MAX_VOICE_DESCRIPTION_LENGTH,
  MAX_VOICE_NAME_LENGTH,
} from "@/lib/voice-upload";

const LANGUAGE_OPTIONS = locales.all
  .filter((l) => l.tag && l.tag.includes("-") && l.name)
  .map((l) => ({
    value: l.tag,
    label: l.location ? `${l.name} (${l.location})` : l.name,
  }));

const voiceCreateFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  file: z
    .instanceof(File, { message: "An audio file is required" })
    .nullable()
    .refine((f) => f !== null, "An audio file is required"),
  category: z.string().min(1, "A category is required"),
  language: z.string().min(1, "A language is required"),
  description: z.string(),
});

function FileDropzone({
  file,
  onFileChange,
  isInvalid,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  isInvalid?: boolean;
}) {
  const { isPlaying, togglePlay } = useAudioPlayback(file);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: { "audio/*": [] },
      maxSize: MAX_UPLOAD_SIZE_BYTES,
      multiple: false,
      onDrop: (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
          onFileChange(acceptedFiles[0]);
        }
      },
    });

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <FileAudio className="size-5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size={"icon-sm"}
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          variant={"ghost"}
          size="icon-sm"
          onClick={() => onFileChange(null)}
          aria-label="Remove audio file"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border px-6 py-10 transition-colors",
        isDragReject || isInvalid
          ? "border-destructive"
          : isDragActive
            ? "border-primary"
            : "",
      )}
    >
      <input {...getInputProps()} />

      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <AudioLines className="size-5 text-muted-foreground" />
      </div>

      <div className="flex flex-col items-center gap-1.5 ">
        <p className="text-base font-semibold tracking-tight">
          Upload your audio file
        </p>

        <p className="text-center text-sm text-muted-foreground">
          WAV, MP3, M4A, OGG, FLAC or WebM, max size 20MB
        </p>
      </div>

      <Button
        type="button"
        variant={"outline"}
        size={"sm"}
        className={"flex items-center gap-2"}
      >
        <FolderOpen className="size-3.5" />
        Upload file
      </Button>
    </div>
  );
}

function LanguageCombobox({
  value,
  onChange,
  isInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  isInvalid: boolean;
}) {
  const selected = LANGUAGE_OPTIONS.find((l) => l.value === value) ?? null;

  return (
    <Combobox
      items={LANGUAGE_OPTIONS}
      value={selected}
      onValueChange={(item) => {
        if (item) onChange(item.value);
      }}
      isItemEqualToValue={(a, b) => a.value === b.value}
      itemToStringLabel={(item) => item.label}
    >
      <ComboboxInput
        placeholder="Search language"
        aria-invalid={isInvalid}
        className="w-full"
      />

      <ComboboxContent>
        <ComboboxEmpty>No language found.</ComboboxEmpty>

        <ComboboxList>
          {(lang: (typeof LANGUAGE_OPTIONS)[number]) => (
            <ComboboxItem key={lang.value} value={lang}>
              {lang.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

interface VoiceCreateFormProps {
  scrollable?: boolean;
  footer?: (submit: React.ReactNode) => React.ReactNode;
  onError?: (message: string) => void;
}

export function VoiceCreateForm({
  scrollable,
  footer,
  onError,
}: VoiceCreateFormProps) {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      file,
      category,
      language,
      description,
    }: {
      name: string;
      file: File;
      category: string;
      language: string;
      description?: string;
    }) => {
      const { uploadId } = await uploadFile(file);

      return postJson("/api/voices/create", {
        uploadId,
        name,
        category,
        language,
        description,
      });
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      file: null as File | null,
      category: "GENERAL" as string,
      language: "en-US",
      description: "",
    },
    validators: {
      onSubmit: voiceCreateFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          name: value.name,
          file: value.file!,
          category: value.category,
          language: value.language,
          description: value.description || undefined,
        });

        toast.success("Voice created successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.voices.getAll.queryKey(),
        });
        form.reset();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create voice";

        if (onError) {
          onError(message);
        } else {
          toast.error(message);
        }
      }
    },
  });

  const isMobile = useIsMobile();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className={cn("flex flex-col", scrollable ? "min-h-0 flex-1 gap-2 short:flex-none" : "gap-6")}
    >
      <div
        className={cn(
          scrollable
            ? "flex min-h-0 flex-col gap-6 overflow-y-auto px-4 py-1 short:shrink-0 short:overflow-visible"
            : "flex flex-col gap-6",
        )}
      >
        <form.Field name="file">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <Tabs defaultValue={"upload"}>
                  <TabsList className={"h-11! w-full"}>
                    <TabsTrigger value={"upload"}>
                      <Upload className="size-3.5" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value={"record"}>
                      <Mic className="size-3.5" />
                      Record
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                    <FileDropzone
                      file={field.state.value}
                      onFileChange={field.handleChange}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>
                  <TabsContent value="record">
                    <VoiceRecorder
                      file={field.state.value}
                      onFileChange={field.handleChange}
                      isInvalid={isInvalid}
                    />
                  </TabsContent>
                </Tabs>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="name">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <Tag className="size-4 text-muted-foreground" />
                  </div>

                  <Input
                    id={field.name}
                    placeholder="Voice Label"
                    maxLength={MAX_VOICE_NAME_LENGTH}
                    aria-invalid={isInvalid}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="pl-10"
                  />

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="category">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant={"outline"}
                          className={"flex gap-1 items-center"}
                        >
                          <Layers className="size-4 text-muted-foreground" />

                          {VOICE_CATEGORY_LABELS[
                            field.state.value as VoiceCategory
                          ] ?? "Select category..."}
                        </Button>
                      }
                    ></DropdownMenuTrigger>

                    <DropdownMenuContent>
                      {VOICE_CATEGORIES.map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onClick={(e) => {
                            field.setValue(cat);
                          }}
                        >
                          {VOICE_CATEGORY_LABELS[cat]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="language">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <LanguageCombobox
                  value={field.state.value}
                  onChange={field.handleChange}
                  isInvalid={isInvalid}
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="description">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-0 flex h-full w-11 items-center justify-center">
                    <AlignLeft className="size-4 text-muted-foreground" />
                  </div>

                  <InputGroupTextarea
                    id={field.name}
                    placeholder="Describe this voice"
                    maxLength={MAX_VOICE_DESCRIPTION_LENGTH}
                    aria-invalid={isInvalid}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className="min-h-20 pl-10"
                    rows={3}
                  />

                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </div>
              </Field>
            );
          }}
        </form.Field>
      </div>

      {/* Outside the scrolling body so the submit button stays visible. */}
      <form.Subscribe
        selector={(s) => ({
          isSubmitting: s.isSubmitting,
        })}
      >
        {({ isSubmitting }) => {
          const submitButton = (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Voice"}
            </Button>
          );

          return footer ? footer(submitButton) : submitButton;
        }}
      </form.Subscribe>
    </form>
  );
}
