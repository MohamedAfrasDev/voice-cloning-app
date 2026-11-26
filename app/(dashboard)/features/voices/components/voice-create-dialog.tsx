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
import React, { useCallback } from "react";
import { VoiceCreateForm } from "./voice-create-form";
import { Button } from "@/components/ui/button";
import { useCheckout } from "../../billing/hooks/use-checkout";
import { toast } from "sonner";

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

  const { checkout } = useCheckout();

  const handleError = useCallback(
    (message: string) => {
      if (message === "SUBSCRIPTION_REQUIRED") {
        toast.error("Subscription required", {
          action: {
            label: "Subscribe",
            onClick: () => checkout(),
          },
        });
      } else {
        toast.error(message);
      }
    },
    [checkout],
  );

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
            onError={handleError}
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
          onError={handleError}
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
