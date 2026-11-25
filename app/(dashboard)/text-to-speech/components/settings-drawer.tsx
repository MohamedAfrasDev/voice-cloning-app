"use client";

import { HistoryIcon, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SettingsPanelHistory from "./settings-panel-history";
import SettingsPanel from "./settings-panel";
import SettingsPanelSettings from "./settings-panel-settings";

interface SettingsDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const SettingsDrawer = ({
  open,
  onOpenChange,
  children,
}: SettingsDrawerProps) => {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children ?? (
        <SheetTrigger
          render={
            <Button variant="outline" size="sm">
              <Settings />
              Settings
            </Button>
          }
        />
      )}
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "max-h-[85vh] rounded-t-xl" : undefined}
      >
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          {/* <SheetDescription>Your previous generations.</SheetDescription> */}
        </SheetHeader>

        <div className="overflow-y-auto">
          <SettingsPanelSettings />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsDrawer;
