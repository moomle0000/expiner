import {
  Box,
  Button,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FiArrowRight, FiFolder } from "react-icons/fi";
import { useFolders } from "@/hooks/useFolders";
import { useFiles } from "@/hooks/useFiles";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBytes, formatDate } from "@/lib/format";
import type { WorkspaceFolder } from "@/types/api";

export function FoldersPanel() {
  const { folders, loading: foldersLoading } = useFolders();
  const { files, loading: filesLoading } = useFiles();
  const loading = foldersLoading || filesLoading;

  function filesIn(folder: WorkspaceFolder) {
    return files.filter((f) => f.folder === folder.name);
  }

  if (loading) {
    return <Text color="ink.300">Loading…</Text>;
  }

  if (folders.length === 0) {
    return (
      <EmptyState
        icon={<FiFolder />}
        title="No folders yet"
        description="Create a folder in the Workspace, then assign uploads to it to keep them grouped here."
        action={
          <NextLink href="/dashboard/workspace" passHref legacyBehavior>
            <Button as="a" size="sm" leftIcon={<FiFolder />}>
              Open Workspace
            </Button>
          </NextLink>
        }
      />
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
      {folders.map((folder) => {
        const folderMount = filesIn(folder);
        const totalSize = folderMount.reduce(
          (acc, f) => acc + (f.size || 0),
          0,
        );
        return (
          <NextLink
            key={folder._id}
            href={`/dashboard/folder/${folder._id}`}
            passHref
            legacyBehavior
          >
            <Box
              as="a"
              bg="ink.800"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              borderRadius="xl"
              p={5}
              _hover={{ borderColor: "whiteAlpha.300" }}
              transition="border-color 0.15s"
            >
              <HStack spacing={3} mb={3}>
                <Box color="accent.lime" fontSize="xl">
                  <FiFolder />
                </Box>
                <Text fontSize="lg" fontWeight={700} noOfLines={1}>
                  {folder.name}
                </Text>
              </HStack>
              <Text fontSize="sm" color="ink.400">
                {folderMount.length}{" "}
                {folderMount.length === 1 ? "file" : "files"} ·{" "}
                {formatBytes(totalSize)}
              </Text>
              <HStack justify="space-between" mt={2}>
                <Text fontSize="xs" color="ink.500">
                  Created {formatDate(folder.createdAt)}
                </Text>
                <Box color="ink.400">
                  <FiArrowRight />
                </Box>
              </HStack>
            </Box>
          </NextLink>
        );
      })}
    </SimpleGrid>
  );
}
