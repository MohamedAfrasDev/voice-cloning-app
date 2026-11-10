import { Button } from "@/components/ui/button";
import { AudioLines, BookOpen, Sparkles, Volume2 } from "lucide-react";
import React from "react";

const VoicePreviewPlaceholder = () => {
  return (
    <div className="hidden flex-1 lg:flex h-full flex-col items-center justify-center gap-6 border-t">
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex w-32 items-center justify-center">
          <div className="absolute left-0  rounded-full bg-muted p-4">
            <Volume2 className="size-5 text-muted-foreground" />
          </div>
          <div className="absolute z-10  rounded-full bg-foreground p-4">
            <Sparkles className="size-5 text-background" />
          </div>{" "}
          <div className="absolute right-0  rounded-full bg-muted p-4">
            <AudioLines className="size-5 text-muted-foreground" />
          </div>
        </div>
      </div>
      <div className="items-center flex flex-col gap-2 mt-3">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Preview will appear here
        </p>
        <p className="max-w-64 text-center text-sm text-muted-foreground">
          Once you generate, your audio result will appear here. Sit back and
          relax.
        </p>

        <Button variant={"outline"} size={"sm"} className={"mt-4"}>
          <BookOpen />
          Don&apos;t know how?
        </Button>
      </div>
    </div>
  );
};

export default VoicePreviewPlaceholder;
