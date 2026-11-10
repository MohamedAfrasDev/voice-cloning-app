"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroupTextarea } from "@/components/ui/input-group";
import { useTypedAppFormContext } from "@/hooks/use-app-form";
import { Coins } from "lucide-react";
import React, { useState } from "react";
import { ttsFormOptions } from "./text-to-speech-form";
import { useStore } from "@tanstack/react-form";
import GenerateButton from "./generate-button";

const TextInputPanel = () => {
  const form = useTypedAppFormContext(ttsFormOptions);

  const text = useStore(form.store, (s) => s.values.text);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const isValid = useStore(form.store, (s) => s.isValid);
  return (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      <div className="relative min-h-0 flex-1">
        <div className="pointer-events-none absolute z-10 inset-x-0 top-0 h-8 bg-linear-to-b from-background to-transparent" />

        <form.Field name="text">
          {(field) => (
            <InputGroupTextarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Start typing or paste your text here..."
              className="absolute no-scrollbar inset-0 h-full field-sizing-fixed overflow-y-auto focus-visible:ring-0 resize-none border-0 bg-transparent p-4 pb-6 lg:p-3 lg:pb-8 text-base! leading-relaxed tracking-tight shadow-none wrap-break-word"
              maxLength={5000}
              disabled={isSubmitting}
            />
          )}
        </form.Field>

        <div className="pointer-events-none absolute z-10 inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="shrink-0 pt-4 lg:pt-5">
        <div className="flex flex-col gap-3 lg:hidden">
          <GenerateButton
            className="w-full"
            disabled={isSubmitting}
            isSubmitting={isSubmitting}
            onSubmit={() => form.handleSubmit()}
          />
        </div>

        {text.length > 0 ? (
          <div className="hidden items-center justify-between lg:flex">
            <Badge variant={"outline"} className="gap-1.5 border-dashed">
              <Coins className="size-3 text-primary" />
              <span className="text-xs">
                <span className="tabular-nums">
                  ${(text.length * 0.0003).toFixed(4)}
                </span>
              </span>
            </Badge>

            <div className="flex items-center gap-3">
              <p className="text-xs tracking-tight">
                {text.length.toLocaleString()}
                <span className="text-muted-foreground">
                  &nbsp; /&nbsp;{5000} characters
                </span>
              </p>
              <GenerateButton
                size="sm"
                disabled={isSubmitting}
                isSubmitting={isSubmitting}
                onSubmit={() => form.handleSubmit()}
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              Get started by typing or pasting text above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInputPanel;
