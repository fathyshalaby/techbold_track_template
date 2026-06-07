"use client";

import {
  type Icon,
  IconClipboardCheck,
  IconDashboard,
  IconDatabase,
  IconListDetails,
  IconPlayerPlay,
  IconRefresh,
  IconServer,
  IconShieldCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import type * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: Icon;
};

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { label: "Tickets", href: "/dashboard/tickets", icon: IconListDetails },
  { label: "Runs", href: "/dashboard/runs", icon: IconPlayerPlay },
  { label: "Approvals", href: "/dashboard/approvals", icon: IconShieldCheck },
  { label: "Resolutions", href: "/dashboard/resolutions", icon: IconClipboardCheck },
  { label: "Memory", href: "/dashboard/memory", icon: IconDatabase },
];

export const SIDEBAR_ITEMS: SidebarItem[] = sidebarItems;

function isActiveHref(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function healthTone(status?: string) {
  if (status === "ok") return { dot: "bg-emerald-500", label: "Operational" };
  if (status === "degraded") return { dot: "bg-amber-500", label: "Degraded" };
  if (status === "down") return { dot: "bg-destructive", label: "Down" };
  return { dot: "bg-muted-foreground", label: "Unknown" };
}

function NavGroup({
  items,
  pathname,
}: {
  items: SidebarItem[];
  pathname: string | null;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={isActiveHref(pathname, item.href)}
                tooltip={item.label}
                render={<Link href={item.href} />}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SidebarStatusFooter({
  healthStatus,
  sourceLabelText,
}: {
  healthStatus?: string;
  sourceLabelText?: string;
}) {
  const router = useRouter();
  const tone = healthTone(healthStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
          >
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <span
                className={cn(
                  "absolute right-1.5 top-1.5 size-2 rounded-full ring-2 ring-muted",
                  tone.dot,
                )}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold">ON</span>
            </span>
            <span className="grid flex-1 leading-tight">
              <span className="truncate text-sm font-medium">On-call technician</span>
              <span className="truncate text-xs text-muted-foreground">
                {tone.label}
                {sourceLabelText ? ` · ${sourceLabelText}` : ""}
              </span>
            </span>
          </SidebarMenuButton>
        }
      />
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem render={<Link href="/dashboard/backend-status" />}>
          <IconServer />
          Backend status
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.refresh()}>
          <IconRefresh />
          Refresh data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar({
  healthStatus,
  sourceLabelText,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  healthStatus?: string;
  sourceLabelText?: string;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <IconShieldCheck className="size-5!" />
              </span>
              <span className="grid leading-tight">
                <span className="text-sm font-semibold">Sphinx</span>
                <span className="text-xs text-muted-foreground">Technician console</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={sidebarItems} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarStatusFooter healthStatus={healthStatus} sourceLabelText={sourceLabelText} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
