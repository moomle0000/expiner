import {
  Avatar,
  Badge,
  Box,
  Button,
  Code,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import { useApiKeys } from "@/hooks/useApiKeys";
import { CreateKeyModal } from "./CreateKeyModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatRelative, getOwnerLabel, getInitials } from "@/lib/format";
import { RoleBadge } from "@/components/ui/RoleBadge";
import type { ApiKeyPublic } from "@/types/api";

export interface ApiKeysPanelProps {
  scope?: "me" | "all";
  title?: string;
  description?: string;
}

export function ApiKeysPanel({ scope = "me", title, description }: ApiKeysPanelProps) {
  const { keys, loading, revoke } = useApiKeys(scope);
  const create = useDisclosure();
  const [target, setTarget] = useState<ApiKeyPublic | null>(null);
  const [revealed, setRevealed] = useState<{ name: string; key: string } | null>(null);
  const toast = useToast();

  return (
    <VStack align="stretch" spacing={5}>
      {(title || description) && (
        <Box>
          {title && (
            <Text fontSize="lg" fontWeight={700} mb={1}>
              {title}
            </Text>
          )}
          {description && (
            <Text fontSize="sm" color="ink.300">
              {description}
            </Text>
          )}
        </Box>
      )}

      {revealed && (
        <Box
          p={4}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="accent.lime"
          bg="ink.800"
        >
          <HStack mb={2}>
            <Badge bg="accent.lime" color="ink.900">
              New key
            </Badge>
            <Text fontSize="sm" fontWeight={600}>
              {revealed.name}
            </Text>
          </HStack>
          <HStack
            bg="ink.900"
            borderRadius="md"
            p={2}
            borderWidth="1px"
            borderColor="whiteAlpha.100"
          >
            <Code flex="1" bg="transparent" color="accent.lime" fontSize="sm">
              {revealed.key}
            </Code>
            <CopyButton value={revealed.key} />
            <Button size="xs" variant="outline" onClick={() => setRevealed(null)}>
              Dismiss
            </Button>
          </HStack>
          <Text mt={2} fontSize="xs" color="ink.400">
            Copy this key now — it will not be shown again.
          </Text>
        </Box>
      )}

      <HStack justify="flex-end">
        <Button onClick={create.onOpen}>+ Mint new key</Button>
      </HStack>

      <Box bg="ink.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
        {loading ? (
          <Text p={6} color="ink.300">Loading keys…</Text>
        ) : keys.length === 0 ? (
          <EmptyState
            title="No API keys yet"
            description="Mint your first key to start using the X-API-Key header in scripts and integrations."
          />
        ) : (
          <Box overflowX="auto">
            <Table size="md" variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  {scope === "all" && <Th>Owner</Th>}
                  <Th>Status</Th>
                  <Th>Last used</Th>
                  <Th>Created</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {keys.map((k) => (
                  <Tr key={k.id} _hover={{ bg: "whiteAlpha.50" }}>
                    <Td>
                      <Text fontWeight={600}>{k.name}</Text>
                    </Td>
                    {scope === "all" && (
                      <Td>
                        {k.user ? (
                          <HStack spacing={2}>
                            <Avatar
                              size="2xs"
                              name={getOwnerLabel(k.user)}
                              bg={k.user.role === "admin" ? "accent.magenta" : "whiteAlpha.200"}
                              color={k.user.role === "admin" ? "white" : "ink.50"}
                              getInitials={() => getInitials(getOwnerLabel(k.user))}
                            />
                            <Box>
                              <Text fontSize="sm" fontWeight={600} lineHeight="1.1">
                                {getOwnerLabel(k.user)}
                              </Text>
                              <HStack spacing={2} mt={0.5}>
                                {k.user.role && <RoleBadge role={k.user.role} />}
                                <Text fontSize="xs" color="ink.400" fontFamily="mono">
                                  {k.user.email || k.createdBy}
                                </Text>
                              </HStack>
                            </Box>
                          </HStack>
                        ) : (
                          <HStack spacing={2}>
                            <Avatar size="2xs" name="?" bg="whiteAlpha.100" color="ink.400" />
                            <Box>
                              <Text fontSize="sm" color="ink.400" fontStyle="italic">
                                Deleted user
                              </Text>
                              <Text fontSize="xs" color="ink.500" fontFamily="mono">
                                {k.createdBy}
                              </Text>
                            </Box>
                          </HStack>
                        )}
                      </Td>
                    )}
                    <Td>
                      <Badge
                        bg={k.active ? "whiteAlpha.200" : "accent.magenta"}
                        color={k.active ? "ink.100" : "white"}
                      >
                        {k.active ? "active" : "revoked"}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="ink.300">
                        {formatRelative(k.lastUsedAt)}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="ink.300">
                        {formatRelative(k.createdAt)}
                      </Text>
                    </Td>
                    <Td>
                      {k.active && (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            size="sm"
                            variant="ghost"
                            aria-label="Actions"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color="accent.magenta"
                              onClick={() => setTarget(k)}
                            >
                              Revoke
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <CreateKeyModal
        isOpen={create.isOpen}
        onClose={create.onClose}
        onCreated={(k) => {
          setRevealed({ name: k.name, key: k.key });
          create.onClose();
        }}
      />

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={async () => {
          if (!target) return;
          try {
            await revoke(target.id);
            toast({ status: "success", title: "Key revoked", position: "top-right" });
          } catch (err) {
            toast({ status: "error", title: "Revoke failed", description: String(err), position: "top-right" });
          } finally {
            setTarget(null);
          }
        }}
        title="Revoke API key?"
        description={target ? `"${target.name}" will no longer authenticate requests.` : ""}
        confirmLabel="Revoke"
        destructive
      />
    </VStack>
  );
}
