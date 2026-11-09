"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const MAX_CHARS = 5000;

export function TextInputPanel() {
  const [text, setText] = useState("");
  const length = text.length;
  const router = useRouter();

  const handleGenerate = () => {
    const trimmed = text.trim();

    if (!trimmed) return;
    router.push(`/text-to-speech?text=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="rounded-3xl border border-primary/20 bg-linear-to-b from-primary/10 via-muted to-muted/50 p-1.5 shadow-sm">
      <div className="rounded-[1.25rem] bg-card p-5">
        <label htmlFor="dashboard-text" className="sr-only">
          Text to convert to speech
        </label>
        <textarea
          id="dashboard-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Start typing or paste your text here..."
          className="h-44 w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Coins className="size-4 text-amber-500" />
            {length === 0 ? "Start typing to estimate" : "Ready to generate"}
          </span>
          <span className="text-muted-foreground">
            {length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </span>
        </div>
      </div>
      <div className="flex justify-end p-3">
        <Button disabled={length === 0} size="lg" onClick={handleGenerate}>
          Generate speech
        </Button>
      </div>
    </div>
  );
}
