import { Box, Flex, HStack, Heading, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <Flex
      align={{ base: "flex-start", md: "flex-end" }}
      justify="space-between"
      direction={{ base: "column", md: "row" }}
      gap={4}
      mb={8}
    >
      <Box>
        {eyebrow && (
          <HStack spacing={2} mb={2}>
            <Box w="6px" h="6px" borderRadius="full" bg="accent.lime" />
            <Text
              fontFamily="mono"
              fontSize="xs"
              color="accent.lime"
              textTransform="uppercase"
              letterSpacing="0.18em"
            >
              {eyebrow}
            </Text>
          </HStack>
        )}
        <Heading
          as="h1"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="700"
          letterSpacing="-0.02em"
          lineHeight="1.05"
        >
          {title}
        </Heading>
        {description && (
          <Text mt={2} color="ink.300" maxW="2xl">
            {description}
          </Text>
        )}
      </Box>
      {actions && <HStack spacing={3}>{actions}</HStack>}
    </Flex>
  );
}
