import {
  Box,
  Button,
  HStack,
  SimpleGrid,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { FiArrowRight, FiTag } from "react-icons/fi";
import { useCategories } from "@/hooks/useCategories";
import { useFiles } from "@/hooks/useFiles";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBytes, formatDate } from "@/lib/format";
import type { WorkspaceCategory } from "@/types/api";

export function CategoriesPanel() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { files, loading: filesLoading } = useFiles();
  const loading = categoriesLoading || filesLoading;

  function filesIn(category: WorkspaceCategory) {
    return files.filter((f) => f.category === category.name);
  }

  if (loading) {
    return <Text color="ink.300">Loading…</Text>;
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={<FiTag />}
        title="No categories yet"
        description="Create category labels in the Workspace, then tag uploads with them to keep them grouped here."
        action={
          <NextLink href="/dashboard/workspace" passHref legacyBehavior>
            <Button as="a" size="sm" leftIcon={<FiTag />}>
              Open Workspace
            </Button>
          </NextLink>
        }
      />
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
      {categories.map((category) => {
        const categoryFiles = filesIn(category);
        const totalSize = categoryFiles.reduce(
          (acc, f) => acc + (f.size || 0),
          0,
        );
        return (
          <NextLink
            key={category._id}
            href={`/dashboard/category/${category._id}`}
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
                <Box color="accent.amber" fontSize="xl">
                  <FiTag />
                </Box>
                <Tag size="md" colorScheme="brand">
                  {category.name}
                </Tag>
              </HStack>
              <Text fontSize="sm" color="ink.400">
                {categoryFiles.length}{" "}
                {categoryFiles.length === 1 ? "file" : "files"} ·{" "}
                {formatBytes(totalSize)}
              </Text>
              <HStack justify="space-between" mt={2}>
                <Text fontSize="xs" color="ink.500">
                  Created {formatDate(category.createdAt)}
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
