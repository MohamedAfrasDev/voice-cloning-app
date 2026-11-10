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
} from "@/components/ui/sidebar";
import Logo from "@/public/logo.svg";
import { OrgSwitcher } from "@/app/auth/org-switcher";
import { Skeleton } from "skullet/react";

const NAV_ITEMS = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Explore Voices", href: "/explore-voices", icon: Compass },
  { title: "Text to Speech", href: "/text-to-speech", icon: AudioLines },
  { title: "Voice Cloning", href: "/voice-cloning", icon: Mic },
];

const OTHER_ITEMS = [
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

  return (
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
                {items.map(({ title, href, icon: Icon }) => {
                  const active =
                    href === "/"
                      ? pathname === "/"
                      : !href.startsWith("mailto:") &&
                        pathname.startsWith(href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={title}
                        render={<Link href={href} />}
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
      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
