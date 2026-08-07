import { Box, Button, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiFolder } from "react-icons/fi";
import { useState } from "react";
import { useFolders } from "@/hooks/useFolders";
import { useFiles } from "@/hooks/useFiles";
import { useFileUpload } from "@/hooks/useFileUpload";
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
  const {
    files,
    loading: filesLoading,
    remove,
    refresh: refreshFiles,
  } = useFiles();
  const { upload, uploading } = useFileUpload({
    folder: folders.find((f) => f._id === folderId)?.name,
  });
  const [isDragging, setIsDragging] = useState(false);
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

  function dropFiles(fileList: FileList) {
    void (async () => {
      await upload(fileList);
      refreshFiles();
    })();
  }

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
            ? "No files in this folder yet. Drag & drop files here to add to it."
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

      <Box
        position="relative"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          dropFiles(e.dataTransfer.files);
        }}
      >
        <FileCards
          files={folderFiles}
          onRemove={remove}
          emptyTitle="This folder is empty"
          emptyDescription="Drag & drop files onto this area to upload them straight into this folder."
        />
        {(isDragging || uploading) && (
          <Box
            position="absolute"
            inset={0}
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="accent.lime"
            borderRadius="xl"
            bg="whiteAlpha.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
            zIndex={1}
          >
            <Text color="accent.lime" fontWeight={700}>
              {uploading
                ? "Uploading…"
                : `Drop to upload into "${folder.name}"`}
            </Text>
          </Box>
        )}
      </Box>
    </VStack>
  );
}
