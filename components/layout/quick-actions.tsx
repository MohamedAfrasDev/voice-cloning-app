"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { quickActions } from "@/app/(dashboard)/features/dashboard/data/quick-action";
import { setTtsDraft } from "@/lib/tts-draft";

export function QuickActions() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Quick actions</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map(({ title, description, gradient, text }) => (
          <div
            key={title}
            className="flex gap-4 rounded-2xl border bg-card p-4 shadow-xs"
          >
            <div
              className={`relative aspect-[4/3] w-2/5 shrink-0 self-start rounded-xl bg-gradient-to-br ${gradient}`}
            >
              <div className="absolute left-1/2 top-1/2 size-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/40" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-medium leading-snug">{title}</h3>
                <p className="text-sm text-muted-foreground">{description} </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                nativeButton={false}
                render={<Link href="/text-to-speech" />}
                onClick={() => setTtsDraft(text)}
              >
                Try now
                <ArrowRight />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
