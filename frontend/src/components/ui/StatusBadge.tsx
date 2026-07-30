import { Badge, HStack, Box } from "@chakra-ui/react";

export interface StatusBadgeProps {
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  showDot?: boolean;
}

export function StatusBadge({
  active,
  activeLabel = "active",
  inactiveLabel = "disabled",
  showDot = true,
}: StatusBadgeProps) {
  const on = Boolean(active);
  return (
    <Badge
      bg={on ? "whiteAlpha.200" : "accent.magenta"}
      color={on ? "ink.100" : "white"}
      px={2}
      py={0.5}
      fontSize="xs"
    >
      <HStack spacing={1.5}>
        {showDot && (
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg={on ? "accent.lime" : "white"}
            boxShadow={on ? "0 0 6px var(--chakra-colors-accent-lime)" : "none"}
          />
        )}
        <span>{on ? activeLabel : inactiveLabel}</span>
      </HStack>
    </Badge>
  );
}
