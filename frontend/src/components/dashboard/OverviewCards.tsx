import { SimpleGrid } from "@chakra-ui/react";

import { StatCard } from "@/components/ui/StatCard";
import { useFiles } from "@/hooks/useFiles";
import { useApiKeys } from "@/hooks/useApiKeys";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { formatBytes } from "@/lib/format";

export function UserOverviewCards() {
  const { files } = useFiles();
  const { keys } = useApiKeys("me");
  const { user } = useAuth();
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
      <StatCard label="Files" value={files.length} hint="owned by you" />
      <StatCard
        label="Storage"
        value={formatBytes(totalSize)}
        hint="sum of file sizes"
        accent="cyan"
      />
      <StatCard label="API keys" value={keys.length} hint={keys.filter((k) => k.active).length + " active"} accent="amber" />
      <StatCard
        label="Account"
        value={user?.role ?? "—"}
        hint={user?.email ?? ""}
        accent="magenta"
      />
    </SimpleGrid>
  );
}

export function AdminOverviewCards() {
  const { users } = useUsers();
  const { files } = useFiles();
  const { keys } = useApiKeys("all");
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
      <StatCard label="Users" value={users.length} hint={`${users.filter((u) => u.role === "admin").length} admins`} />
      <StatCard label="Files" value={files.length} hint={formatBytes(totalSize)} accent="cyan" />
      <StatCard
        label="API keys"
        value={keys.length}
        hint={`${keys.filter((k) => k.active).length} active`}
        accent="amber"
      />
      <StatCard
        label="Views"
        value={files.reduce((acc, f) => acc + (f.views || 0), 0)}
        hint="across all files"
        accent="magenta"
      />
    </SimpleGrid>
  );
}
