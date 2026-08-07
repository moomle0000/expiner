import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { FiHexagon, FiHome, FiUsers, FiFileText, FiKey, FiUser, FiFolder } from "react-icons/fi";
import { NavItem } from "./NavItem";
import { MobileDrawer } from "./MobileDrawer";
import type { IconType } from "react-icons";

export interface SidebarSection {
  title?: string;
  items: { href: string; label: string; icon: IconType; exact?: boolean; badge?: string }[];
}

export interface SidebarSectionsProps {
  role: "admin" | "user";
}

export function getSidebarSections({ role }: SidebarSectionsProps): SidebarSection[] {
  if (role === "admin") {
    return [
      { items: [{ href: "/admin", label: "Overview", icon: FiHome, exact: true }] },
      {
        title: "Manage",
        items: [
          { href: "/admin/users", label: "Users", icon: FiUsers },
          { href: "/admin/files", label: "Files", icon: FiFileText },
          { href: "/admin/keys", label: "API Keys", icon: FiKey },
        ],
      },
      { title: "Account", items: [{ href: "/admin/profile", label: "Profile", icon: FiUser }] },
    ];
  }
  return [
    { items: [{ href: "/dashboard", label: "Overview", icon: FiHome, exact: true }] },
    {
      title: "Workspace",
      items: [
        { href: "/dashboard/workspace", label: "Workspace", icon: FiFolder },
        { href: "/dashboard/files", label: "My Files", icon: FiFileText },
        { href: "/dashboard/api-keys", label: "API Keys", icon: FiKey },
      ],
    },
    { title: "Account", items: [{ href: "/dashboard/profile", label: "Profile", icon: FiUser }] },
  ];
}

export interface ResponsiveSidebarProps {
  role: "admin" | "user";
  isOpen: boolean;
  onClose: () => void;
}

/**
 * One component that owns the desktop fixed sidebar and the mobile/tablet
 * drawer. On `lg+` the fixed sidebar is shown and the drawer is hidden; below
 * `lg` the fixed sidebar is hidden and the drawer is opened on demand via
 * the hamburger in the topbar.
 */
export function ResponsiveSidebar({ role, isOpen, onClose }: ResponsiveSidebarProps) {
  const sections = getSidebarSections({ role });
  const homeHref = role === "admin" ? "/admin" : "/dashboard";

  const navContent = (
    <NavBody role={role} sections={sections} homeHref={homeHref} onNavigate={onClose} />
  );

  return (
    <>
      {/* Desktop fixed sidebar — lg and up */}
      <Box
        as="aside"
        w="260px"
        flexShrink={0}
        bg="ink.800"
        borderRightWidth="1px"
        borderColor="whiteAlpha.100"
        h="100vh"
        position="sticky"
        top={0}
        display={{ base: "none", lg: "flex" }}
        flexDirection="column"
      >
        {navContent}
      </Box>

      {/* Mobile + tablet drawer — below lg */}
      <Box display={{ base: "block", lg: "none" }}>
        <MobileDrawer isOpen={isOpen} onClose={onClose}>
          {navContent}
        </MobileDrawer>
      </Box>
    </>
  );
}

function NavBody({
  role,
  sections,
  homeHref,
  onNavigate,
}: {
  role: "admin" | "user";
  sections: SidebarSection[];
  homeHref: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <HStack px={5} py={5} spacing={3} borderBottomWidth="1px" borderColor="whiteAlpha.100">
        <Box color="accent.lime" fontSize="xl">
          <FiHexagon />
        </Box>
        <Link href={homeHref} passHref legacyBehavior>
          <Text as="a" fontWeight="700" letterSpacing="-0.01em" onClick={onNavigate}>
            express<Box as="span" color="accent.lime">.</Box>upload
          </Text>
        </Link>
      </HStack>

      <VStack align="stretch" spacing={6} p={4} flex="1" overflowY="auto">
        {sections.map((section, i) => (
          <Box key={i}>
            {section.title && (
              <Text
                fontFamily="mono"
                fontSize="2xs"
                color="ink.400"
                textTransform="uppercase"
                letterSpacing="0.18em"
                px={3}
                mb={2}
              >
                {section.title}
              </Text>
            )}
            <VStack align="stretch" spacing={1}>
              {section.items.map((it) => (
                <NavItem key={it.href} {...it} onNavigate={onNavigate} />
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>

      <Box p={4} borderTopWidth="1px" borderColor="whiteAlpha.100">
        <HStack
          px={3}
          py={2}
          bg="ink.900"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <Box
            w={2}
            h={2}
            borderRadius="full"
            bg="accent.lime"
            boxShadow="0 0 8px var(--chakra-colors-accent-lime)"
          />
          <Text fontSize="xs" fontFamily="mono" color="ink.300">
            {role === "admin" ? "Admin session" : "User session"}
          </Text>
        </HStack>
      </Box>
    </>
  );
}
