import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <VStack
      spacing={4}
      py={16}
      px={6}
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      borderStyle="dashed"
      borderRadius="xl"
      bg="ink.800"
      textAlign="center"
    >
      {icon && (
        <Box color="ink.400" fontSize="3xl">
          {icon}
        </Box>
      )}
      <Box>
        <Heading size="md" mb={1}>
          {title}
        </Heading>
        {description && (
          <Text color="ink.300" fontSize="sm" maxW="md" mx="auto">
            {description}
          </Text>
        )}
      </Box>
      {action}
    </VStack>
  );
}
