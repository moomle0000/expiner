import { Badge } from "@chakra-ui/react";
import type { UserRole } from "@/types/api";

const COLORS: Record<UserRole, { bg: string; color: string }> = {
  admin: { bg: "accent.magenta", color: "white" },
  user: { bg: "whiteAlpha.200", color: "ink.100" },
  landlord: { bg: "accent.amber", color: "ink.900" },
};

export function RoleBadge({ role }: { role?: UserRole }) {
  if (!role) return null;
  const c = COLORS[role];
  return (
    <Badge bg={c.bg} color={c.color} px={2} py={0.5} fontSize="xs" borderRadius="md">
      {role}
    </Badge>
  );
}
