import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
  {
    title: "Narrate a Story",
    description: "Bring characters to life with expressive AI narration",
    gradient: "from-cyan-400 to-sky-200",
  },
  {
    title: "Record an Ad",
    description: "Create professional advertisements with lifelike AI voices",
    gradient: "from-pink-400 to-pink-200",
  },
  {
    title: "Direct a Movie Scene",
    description: "Generate dramatic dialogue for film and video",
    gradient: "from-violet-500 to-violet-200",
  },
  {
    title: "Voice a Game Character",
    description: "Build immersive worlds with dynamic character voices",
    gradient: "from-orange-400 to-orange-200",
  },
  {
    title: "Introduce Your Podcast",
    description: "Hook your listeners from the very first second",
    gradient: "from-blue-500 to-blue-200",
  },
  {
    title: "Guide a Meditation",
    description: "Craft soothing, calming audio for wellness content",
    gradient: "from-lime-400 to-lime-200",
  },
];

export function QuickActions() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Quick actions</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ACTIONS.map(({ title, description, gradient }) => (
          <div
            key={title}
            className="flex gap-4 rounded-2xl border bg-card p-4 shadow-xs"
          >
            <div
              className={`relative aspect-[4/3] w-2/5 shrink-0 self-start rounded-xl bg-gradient-to-br ${gradient}`}
            >
              <div className="absolute left-1/2 top-1/2 size-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-medium leading-snug">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                nativeButton={false}
                render={<Link href="/text-to-speech" />}
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
