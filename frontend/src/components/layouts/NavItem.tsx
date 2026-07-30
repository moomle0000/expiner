import { Box, HStack, Icon, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { IconType } from "react-icons";

export interface NavItemProps {
  href: string;
  label: string;
  icon: IconType;
  exact?: boolean;
  badge?: string;
  onNavigate?: () => void;
}

export function NavItem({ href, label, icon, exact, badge, onNavigate }: NavItemProps) {
  const router = useRouter();
  const target = href.replace(/\/$/, "");
  const current = router.asPath.replace(/\/$/, "");
  const active = exact ? current === target : current === target || current.startsWith(`${target}/`);

  return (
    <Link href={href} passHref legacyBehavior>
      <HStack
        as="a"
        spacing={3}
        px={3}
        py={{ base: 3, md: 2.5 }}
        minH={{ base: "44px", md: "auto" }}
        borderRadius="lg"
        cursor="pointer"
        bg={active ? "whiteAlpha.100" : "transparent"}
        color={active ? "ink.50" : "ink.300"}
        borderLeftWidth="2px"
        borderLeftColor={active ? "accent.lime" : "transparent"}
        _hover={{ bg: "whiteAlpha.100", color: "ink.50" }}
        _active={{ bg: "whiteAlpha.200" }}
        transition="all 0.12s"
        onClick={() => onNavigate?.()}
      >
        <Icon as={icon} boxSize={4} color={active ? "accent.lime" : "ink.300"} />
        <Text fontSize="sm" fontWeight={active ? 600 : 500}>
          {label}
        </Text>
        {badge && (
          <Box
            ml="auto"
            fontSize="2xs"
            fontFamily="mono"
            bg="whiteAlpha.200"
            color="ink.100"
            px={1.5}
            py={0.5}
            borderRadius="md"
          >
            {badge}
          </Box>
        )}
      </HStack>
    </Link>
  );
}
