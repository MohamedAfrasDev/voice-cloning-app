"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AudioLines,
  Compass,
  Headphones,
  LayoutDashboard,
  Mic,
  Settings,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Logo from "@/public/logo.svg";
import { OrgSwitcher } from "@/app/auth/org-switcher";
import { Skeleton } from "skullet/react";
import { UsageContainer } from "@/app/(dashboard)/features/billing/components/usage-container";
import { useState } from "react";
import VoiceCreateDialog from "@/app/(dashboard)/features/voices/components/voice-create-dialog";

// An item either navigates (href) or opens the voice creation dialog.
type NavItem = { title: string; icon: LucideIcon } & (
  | { href: string; dialog?: never }
  | { dialog: "voice-create"; href?: never }
);

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Explore Voices", href: "/voices", icon: Compass },
  { title: "Text to Speech", href: "/text-to-speech", icon: AudioLines },
  { title: "Voice Cloning", dialog: "voice-create", icon: Mic },
];

const OTHER_ITEMS: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
  {
    title: "Help and support",
    href: "mailto:contact@afras.dev",
    icon: Headphones,
  },
];

const GROUPS = [
  { label: undefined, items: NAV_ITEMS },
  { label: "Others", items: OTHER_ITEMS },
];

export function AppSidebar({ footer }: { footer?: React.ReactNode }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [voiceCreatingDialog, setVoiceCreatingDialog] = useState(false);

  const openVoiceCreateDialog = () => {
    // Close the mobile sidebar so it doesn't stay open behind the dialog.
    setOpenMobile(false);
    setVoiceCreatingDialog(true);
  };

  return (
    <>
      <VoiceCreateDialog
        open={voiceCreatingDialog}
        onOpenChange={setVoiceCreatingDialog}
      />
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/" />}>
                <Image
                  src={Logo}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7"
                />
                <span className="text-base font-semibold tracking-tight">
                  Live Voice
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <OrgSwitcher />
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {GROUPS.map(({ label, items }) => (
            <SidebarGroup key={label ?? "main"}>
              {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu className="flex flex-col gap-1">
                  {items.map(({ title, href, dialog, icon: Icon }) => {
                    const active =
                      href === "/"
                        ? pathname === "/"
                        : !!href &&
                          !href.startsWith("mailto:") &&
                          pathname.startsWith(href);
                    return (
                      <SidebarMenuItem key={title}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={title}
                          // Without `render`, a native <button> is used.
                          render={href ? <Link href={href} /> : undefined}
                          onClick={dialog ? openVoiceCreateDialog : undefined}
                          aria-haspopup={dialog ? "dialog" : undefined}
                        >
                          <Icon />
                          <span>{title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <UsageContainer />
          {footer}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}
