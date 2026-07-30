import {
  Avatar,
  Box,
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
import { FiMoreVertical, FiTrash2, FiKey, FiEdit2, FiUserX, FiUserCheck } from "react-icons/fi";
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { getInitials, formatRelative } from "@/lib/format";
import { UserFormModal } from "./UserFormModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import type { User } from "@/types/api";

export function UsersTable() {
  const { users, loading, deleteUser, setUserStatus } = useUsers();
  const { user: me } = useAuth();
  const [deleting, setDeleting] = useState<User | null>(null);
  const [toggling, setToggling] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const createModal = useDisclosure();

  return (
    <VStack align="stretch" spacing={4}>
      <HStack justify="flex-end">
        <Box
          as="button"
          onClick={createModal.onOpen}
          px={4}
          py={2}
          bg="accent.lime"
          color="ink.900"
          fontWeight={600}
          borderRadius="lg"
          _hover={{ bg: "#d4ff5a" }}
        >
          + New user
        </Box>
      </HStack>

      <Box bg="ink.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
        {loading ? (
          <Text p={6} color="ink.300">Loading users…</Text>
        ) : users.length === 0 ? (
          <EmptyState title="No users yet" description="Create the first user to get started." />
        ) : (
          <Box overflowX="auto">
            <Table size="md" variant="simple">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th>Last login</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {users.map((u) => {
                  const isSelf = me?._id === u._id;
                  const isActive = u.status !== false;
                  return (
                    <Tr key={u._id} _hover={{ bg: "whiteAlpha.50" }} opacity={isActive ? 1 : 0.7}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={u.name || u.email}
                            bg="whiteAlpha.200"
                            color="ink.50"
                            getInitials={() => getInitials(u.name || u.email)}
                          />
                          <Box>
                            <HStack spacing={2}>
                              <Text fontWeight={600}>{u.name || u.username || "—"}</Text>
                              {isSelf && (
                                <Text
                                  fontFamily="mono"
                                  fontSize="2xs"
                                  color="accent.lime"
                                  textTransform="uppercase"
                                  letterSpacing="0.1em"
                                >
                                  you
                                </Text>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="ink.400">
                              {u.email}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td>
                        <RoleBadge role={u.role} />
                      </Td>
                      <Td>
                        <StatusBadge
                          active={isActive}
                          activeLabel="active"
                          inactiveLabel="disabled"
                        />
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="ink.300">
                          {formatRelative(u.createdAt)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="ink.300">
                          {formatRelative(u.lastLoginAt || u.lastLogin)}
                        </Text>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            size="sm"
                            variant="ghost"
                            aria-label="Actions"
                          />
                          <MenuList>
                            <MenuItem icon={<FiEdit2 />} onClick={() => setEditing(u)}>
                              Edit
                            </MenuItem>
                            <MenuItem icon={<FiKey />} onClick={() => setResetting(u)}>
                              Reset password
                            </MenuItem>
                            <MenuItem
                              icon={isActive ? <FiUserX /> : <FiUserCheck />}
                              onClick={() => {
                                if (isSelf) {
                                  toast({
                                    status: "warning",
                                    title: "You can't disable your own account",
                                    position: "top-right",
                                  });
                                  return;
                                }
                                setToggling(u);
                              }}
                              color={isActive ? "accent.amber" : "accent.lime"}
                            >
                              {isActive ? "Disable user" : "Enable user"}
                            </MenuItem>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color="accent.magenta"
                              onClick={() => setDeleting(u)}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <UserFormModal
        isOpen={createModal.isOpen || !!editing}
        onClose={() => {
          createModal.onClose();
          setEditing(null);
        }}
        user={editing}
      />

      <ResetPasswordModal
        isOpen={!!resetting}
        onClose={() => setResetting(null)}
        user={resetting}
      />

      <ConfirmDialog
        isOpen={!!toggling}
        onClose={() => setToggling(null)}
        loading={busy}
        onConfirm={async () => {
          if (!toggling) return;
          setBusy(true);
          try {
            const next = !(toggling.status !== false);
            await setUserStatus(toggling._id, next);
            toast({
              status: "success",
              title: next ? "User enabled" : "User disabled",
              description: `${toggling.email} is now ${next ? "active" : "disabled"}.`,
              position: "top-right",
            });
          } catch (err) {
            toast({
              status: "error",
              title: "Update failed",
              description: String(err),
              position: "top-right",
            });
          } finally {
            setBusy(false);
            setToggling(null);
          }
        }}
        title={toggling?.status !== false ? "Disable this user?" : "Enable this user?"}
        description={
          toggling
            ? toggling.status !== false
              ? `${toggling.email} will be unable to sign in. Their files and API keys remain in place.`
              : `${toggling.email} will be able to sign in again.`
            : ""
        }
        confirmLabel={toggling?.status !== false ? "Disable" : "Enable"}
        destructive={toggling?.status !== false}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        loading={busy}
        onConfirm={async () => {
          if (!deleting) return;
          setBusy(true);
          try {
            await deleteUser(deleting._id);
            toast({ status: "success", title: "User deleted", position: "top-right" });
          } catch (err) {
            toast({ status: "error", title: "Delete failed", description: String(err), position: "top-right" });
          } finally {
            setBusy(false);
            setDeleting(null);
          }
        }}
        title="Delete user?"
        description={deleting ? `This will permanently remove ${deleting.email}.` : ""}
        confirmLabel="Delete"
        destructive
      />
    </VStack>
  );
}
