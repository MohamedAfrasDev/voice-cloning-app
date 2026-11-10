import { cn } from "cn";
import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { ThumbsUpIcon } from "lucide-react";
import Link from "next/link";

const PageHeader = ({
  title,
  className,
}: {
  title: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />

        <h1 className="text-lg font-semibold tracking-tight">{title} </h1>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant={"outline"}
          size={"sm"}
          nativeButton={false}
          render={<Link href={"mailto:contact@afras.dev"} />}
        >
          <ThumbsUpIcon />
          <span className="hidden lg:block">Feedback</span>
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
