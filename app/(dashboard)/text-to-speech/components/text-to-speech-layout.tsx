import PageHeader from "@/components/layout/page-header";
import React from "react";

const TextToSpeechLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-svh min-h-0 flex-col overflow-hidden">
      <PageHeader title="Text to speech" />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
};

export default TextToSpeechLayout;
