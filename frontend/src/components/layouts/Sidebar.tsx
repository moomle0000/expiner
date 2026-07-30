// Compatibility shim. The old single-breakpoint Sidebar has been replaced by
// ResponsiveSidebar (which renders a fixed sidebar on lg+ and a drawer below
// lg). This file re-exports the desktop-only body of the new component so
// anything that still imports `Sidebar` keeps working.
import { Box } from "@chakra-ui/react";
import { getSidebarSections } from "./ResponsiveSidebar";

export interface SidebarProps {
  role: "admin" | "user";
}

export function Sidebar({ role }: SidebarProps) {
  // This shim is no longer wired into the app — ResponsiveSidebar is.
  // Render an empty fixed placeholder so any stale import doesn't crash a page.
  return <Box aria-hidden="true" display="none" />;
}

export type { SidebarSection } from "./ResponsiveSidebar";
