"use client";

import { HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SettingsPanelHistory from "./settings-panel-history";
import { useIsMobile } from "@/hooks/use-mobile";

interface HistoryDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const HistoryDrawer = ({
  open,
  onOpenChange,
  children,
}: HistoryDrawerProps) => {
  const isMobile = useIsMobile();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children ?? (
        <SheetTrigger
          render={
            <Button variant="outline" size="sm">
              <HistoryIcon />
              History
            </Button>
          }
        />
      )}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "max-h-[85vh] rounded-t-xl" : undefined}
      >
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
          <SheetDescription>Your previous generations.</SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto">
          <SettingsPanelHistory />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HistoryDrawer;
