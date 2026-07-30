import { Box, Container, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { FiHexagon } from "react-icons/fi";
import type { ReactNode } from "react";

export function AuthLayout({ children, side }: { children: ReactNode; side?: ReactNode }) {
  return (
    <Flex minH="100vh" bg="ink.900" color="ink.50">
      {/* Left brand panel */}
      <Box
        display={{ base: "none", lg: "flex" }}
        w="44%"
        position="relative"
        bg="ink.800"
        borderRightWidth="1px"
        borderColor="whiteAlpha.100"
        p={12}
        flexDirection="column"
        overflow="hidden"
      >
        <HStack mb={12} spacing={3}>
          <Box color="accent.lime" fontSize="2xl">
            <FiHexagon />
          </Box>
          <Text fontWeight="700" letterSpacing="-0.01em">
            express<Box as="span" color="accent.lime">.</Box>upload
          </Text>
        </HStack>
        <VStack align="stretch" spacing={6} maxW="md" mt={6}>
          <Text
            fontSize="3xl"
            fontWeight="700"
            letterSpacing="-0.02em"
            lineHeight="1.1"
          >
            A control plane for your{" "}
            <Box as="span" color="accent.lime">
              file infrastructure
            </Box>
            .
          </Text>
          <Text color="ink.300">
            Authenticate, manage users, mint scoped API keys, and stream uploads
            with the same low-latency backend that powers your integrations.
          </Text>
        </VStack>
        {side && <Box mt={12}>{side}</Box>}
        <Box position="absolute" bottom={8} left={12} right={12}>
          <Text fontFamily="mono" fontSize="xs" color="ink.400" letterSpacing="0.1em">
            v1.0 — REST API · JWT · X-API-Key
          </Text>
        </Box>
        {/* Decorative glow */}
        <Box
          position="absolute"
          top="-20%"
          right="-20%"
          w="60%"
          h="60%"
          borderRadius="full"
          bg="accent.lime"
          filter="blur(140px)"
          opacity={0.07}
          pointerEvents="none"
        />
      </Box>
      <Flex flex="1" align="center" justify="center" p={{ base: 6, md: 12 }}>
        <Container maxW="md">{children}</Container>
      </Flex>
    </Flex>
  );
}
