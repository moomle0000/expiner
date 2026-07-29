import { Box, HStack, Stat, StatLabel, StatNumber, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: "lime" | "magenta" | "cyan" | "amber";
}

const ACCENT_BG: Record<NonNullable<StatCardProps["accent"]>, string> = {
  lime: "accent.lime",
  magenta: "accent.magenta",
  cyan: "accent.cyan",
  amber: "accent.amber",
};

export function StatCard({ label, value, hint, accent = "lime" }: StatCardProps) {
  return (
    <Box
      position="relative"
      p={5}
      bg="ink.800"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} right={0} h="2px" bg={ACCENT_BG[accent]} />
      <Stat>
        <StatLabel
          color="ink.300"
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="0.14em"
          fontFamily="mono"
        >
          {label}
        </StatLabel>
        <StatNumber fontSize="3xl" fontWeight="700" letterSpacing="-0.02em" mt={1}>
          {value}
        </StatNumber>
      </Stat>
      {hint && (
        <HStack mt={2} spacing={2}>
          <Box w="4px" h="4px" borderRadius="full" bg={ACCENT_BG[accent]} />
          <Text fontSize="xs" color="ink.400">
            {hint}
          </Text>
        </HStack>
      )}
    </Box>
  );
}
