import { Button, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiFolder } from "react-icons/fi";
import { useFolders } from "@/hooks/useFolders";
import { useFiles } from "@/hooks/useFiles";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileCards } from "@/components/ui/FileCards";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { formatBytes, formatDate } from "@/lib/format";

export interface FolderDetailProps {
  folderId: string;
}

export function FolderDetail({ folderId }: FolderDetailProps) {
  const { folders, loading: foldersLoading } = useFolders();
  const { files, loading: filesLoading, remove } = useFiles();
  const loading = foldersLoading || filesLoading;

  const folder = folders.find((f) => f._id === folderId);
  const folderFiles = folder
    ? files.filter((f) => f.folder === folder.name)
    : [];
  const totalSize = folderFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalDownloads = folderFiles.reduce(
    (acc, f) => acc + (f.downloads || 0),
    0,
  );
  const totalViews = folderFiles.reduce((acc, f) => acc + (f.views || 0), 0);

  if (loading) {
    return <Text color="ink.300">Loading…</Text>;
  }

  if (!folder) {
    return (
      <EmptyState
        icon={<FiFolder />}
        title="Folder not found"
        description="This folder doesn't exist or has been deleted."
        action={
          <NextLink href="/dashboard/folder" passHref legacyBehavior>
            <Button as="a" size="sm" leftIcon={<ArrowBackIcon />}>
              All folders
            </Button>
          </NextLink>
        }
      />
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <PageHeader
        eyebrow="Folder"
        title={folder.name}
        description={
          folderFiles.length === 0
            ? "No files in this folder yet."
            : `Everything you've stored in "${folder.name}", scoped to your account.`
        }
        actions={
          <NextLink href="/dashboard/folder" passHref legacyBehavior>
            <Button
              as="a"
              variant="outline"
              size="sm"
              leftIcon={<ArrowBackIcon />}
            >
              All folders
            </Button>
          </NextLink>
        }
      />

      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
        <StatCard
          label="Files"
          value={folderFiles.length}
          accent="lime"
          hint="stored in this folder"
        />
        <StatCard
          label="Total size"
          value={formatBytes(totalSize)}
          accent="cyan"
        />
        <StatCard label="Downloads" value={totalDownloads} accent="amber" />
        <StatCard
          label="Views"
          value={totalViews}
          accent="magenta"
          hint={`created ${formatDate(folder.createdAt)}`}
        />
      </SimpleGrid>

      <FileCards
        files={folderFiles}
        onRemove={remove}
        emptyTitle="This folder is empty"
        emptyDescription="Upload a file and assign it to this folder from the Files page to see it here."
      />
    </VStack>
  );
}
