import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, type ReactNode } from "react";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function MobileDrawer({ isOpen, onClose, title, children }: MobileDrawerProps) {
  const router = useRouter();

  // Close the drawer whenever the route changes so tapping a link
  // doesn't leave the overlay open over the new page.
  useEffect(() => {
    if (isOpen) onClose();
    // We intentionally only depend on the route so the close runs on every
    // navigation, not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
      <DrawerOverlay backdropFilter="blur(4px)" />
      <DrawerContent bg="ink.800" color="ink.100">
        {title && <DrawerHeader borderBottomWidth="1px" borderColor="whiteAlpha.100" fontWeight={700}>{title}</DrawerHeader>}
        <DrawerCloseButton />
        <DrawerBody p={0}>{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export function HamburgerButton({ onClick, "aria-label": ariaLabel = "Open navigation" }: { onClick: () => void; "aria-label"?: string }) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      display={{ base: "inline-flex", lg: "none" }}
      alignItems="center"
      justifyContent="center"
      h="40px"
      w="40px"
      minW="40px"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      color="ink.100"
      bg="ink.800"
      _hover={{ bg: "whiteAlpha.100", borderColor: "whiteAlpha.400" }}
      _active={{ bg: "whiteAlpha.200" }}
      transition="all 0.12s"
    >
      <Box as="span" display="inline-flex" flexDirection="column" gap="4px" aria-hidden="true">
        <Box w="18px" h="2px" bg="currentColor" borderRadius="full" />
        <Box w="18px" h="2px" bg="currentColor" borderRadius="full" />
        <Box w="18px" h="2px" bg="currentColor" borderRadius="full" />
      </Box>
    </Box>
  );
}
