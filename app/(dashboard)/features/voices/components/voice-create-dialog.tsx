import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";
import { VoiceCreateForm } from "./voice-create-form";
import { Button } from "@/components/ui/button";

interface VoiceCreateDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const VoiceCreateDialog = ({
  children,
  open,
  onOpenChange,
}: VoiceCreateDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        {children && (
          <SheetTrigger render={<div>{children}</div>}></SheetTrigger>
        )}

        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Create custom voices</SheetTitle>
            <SheetDescription>
              Upload or record an audio sample to add a new voice to your
              library
            </SheetDescription>
          </SheetHeader>
          <VoiceCreateForm
            scrollable
            footer={(submit) => (
              <SheetFooter>
                {submit}
                <SheetClose
                  render={<Button variant={"outline"}>Cancel</Button>}
                />
              </SheetFooter>
            )}
          />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger render={<div>{children}</div>}></DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create custom voices</DialogTitle>
          <DialogDescription>
            Upload or record an audio sample to add a new voice to your library
          </DialogDescription>
        </DialogHeader>
        <VoiceCreateForm
          scrollable
          footer={(submit) => (
            <SheetFooter>
              {submit}
              <SheetClose
                render={<Button variant={"outline"}>Cancel</Button>}
              />
            </SheetFooter>
          )}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCreateDialog;
