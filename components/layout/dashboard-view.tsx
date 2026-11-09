import Link from "next/link";
import { Headphones, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { QuickActions } from "./quick-actions";
import { TextInputPanel } from "./text-input-panel";
import HeroPattern from "./hero-pattern";

const DashboardView = ({ name }: { name: string }) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="mt-1 md:hidden" />
          <div>
            <p className="text-muted-foreground">Nice to see you</p>
            <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="mailto:contact@afras.dev" />}
          >
            <ThumbsUp />
            <span className="hidden sm:inline">Feedback</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="mailto:contact@afras.dev" />}
          >
            <Headphones />
            <span className="hidden sm:inline">Need help?</span>
          </Button>
        </div>
      </header>

      <TextInputPanel />
      {/* <HeroPattern /> */}

      <QuickActions />
    </div>
  );
};

export default DashboardView;
