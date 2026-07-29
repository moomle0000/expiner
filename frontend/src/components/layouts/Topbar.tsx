import {
  Avatar,
  Box,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon, BellIcon } from "@chakra-ui/icons";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/format";
import { useRouter } from "next/router";
import Link from "next/link";
import { HamburgerButton } from "./MobileDrawer";
import type { ReactNode } from "react";

export interface TopbarProps {
  title?: string;
  rightSlot?: ReactNode;
  onOpenNav?: () => void;
}

export function Topbar({ title, rightSlot, onOpenNav }: TopbarProps) {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  async function handleLogout() {
    await logout();
    toast({ status: "success", title: "Signed out", position: "top-right" });
    void router.push("/login");
  }

  const profileHref = isAdmin ? "/admin/profile" : "/dashboard/profile";

  return (
    <Flex
      as="header"
      h="64px"
      align="center"
      px={{ base: 4, md: 8 }}
      borderBottomWidth="1px"
      borderColor="whiteAlpha.100"
      bg="ink.900"
      position="sticky"
      top={0}
      zIndex={10}
      backdropFilter="blur(8px)"
      gap={3}
    >
      {onOpenNav && <HamburgerButton onClick={onOpenNav} />}
      {title && (
        <HStack spacing={3}>
          <Text fontFamily="mono" fontSize="xs" color="ink.400" letterSpacing="0.1em">
            {title}
          </Text>
        </HStack>
      )}
      <Box flex="1" />
      {rightSlot}
      <HStack spacing={2} ml={4}>
        <IconButton aria-label="Notifications" icon={<BellIcon />} variant="ghost" size="sm" />
        <Menu>
          <MenuButton
            as={Box}
            cursor="pointer"
            _hover={{ bg: "whiteAlpha.100" }}
            borderRadius="lg"
            p={1.5}
          >
            <HStack spacing={2}>
              <Avatar
                size="sm"
                name={user?.name || user?.email}
                bg="accent.lime"
                color="ink.900"
                fontWeight="700"
                getInitials={() => getInitials(user?.name || user?.email)}
              />
              <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="sm" fontWeight={600} lineHeight="1.1">
                  {user?.name || user?.username || user?.email?.split("@")[0]}
                </Text>
                <Text fontSize="xs" color="ink.400" lineHeight="1.1">
                  {user?.email}
                </Text>
              </Box>
              <ChevronDownIcon color="ink.300" />
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem as={Link} href={profileHref}>
              Profile
            </MenuItem>
            <MenuItem as={Link} href={isAdmin ? "/admin/keys" : "/dashboard/api-keys"}>
              API Keys
            </MenuItem>
            <MenuDivider />
            <MenuItem onClick={handleLogout} color="accent.magenta" fontWeight={600}>
              Sign out
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
}
