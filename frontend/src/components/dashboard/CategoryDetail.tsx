import { Button, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiTag } from "react-icons/fi";
import { useCategories } from "@/hooks/useCategories";
import { useFiles } from "@/hooks/useFiles";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileCards } from "@/components/ui/FileCards";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { formatBytes, formatDate } from "@/lib/format";

export interface CategoryDetailProps {
  categoryId: string;
}

export function CategoryDetail({ categoryId }: CategoryDetailProps) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { files, loading: filesLoading, remove } = useFiles();
  const loading = categoriesLoading || filesLoading;

  const category = categories.find((c) => c._id === categoryId);
  const categoryFiles = category
    ? files.filter((f) => f.category === category.name)
    : [];
  const totalSize = categoryFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalDownloads = categoryFiles.reduce(
    (acc, f) => acc + (f.downloads || 0),
    0,
  );
  const totalViews = categoryFiles.reduce((acc, f) => acc + (f.views || 0), 0);

  if (loading) {
    return <Text color="ink.300">Loading…</Text>;
  }

  if (!category) {
    return (
      <EmptyState
        icon={<FiTag />}
        title="Category not found"
        description="This category doesn't exist or has been deleted."
        action={
          <NextLink href="/dashboard/category" passHref legacyBehavior>
            <Button as="a" size="sm" leftIcon={<ArrowBackIcon />}>
              All categories
            </Button>
          </NextLink>
        }
      />
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <PageHeader
        eyebrow="Category"
        title={category.name}
        description={
          categoryFiles.length === 0
            ? "No files in this category yet."
            : `Everything you've tagged "${category.name}", scoped to your account.`
        }
        actions={
          <NextLink href="/dashboard/category" passHref legacyBehavior>
            <Button
              as="a"
              variant="outline"
              size="sm"
              leftIcon={<ArrowBackIcon />}
            >
              All categories
            </Button>
          </NextLink>
        }
      />

      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
        <StatCard
          label="Files"
          value={categoryFiles.length}
          accent="amber"
          hint="tagged with this label"
        />
        <StatCard
          label="Total size"
          value={formatBytes(totalSize)}
          accent="cyan"
        />
        <StatCard label="Downloads" value={totalDownloads} accent="lime" />
        <StatCard
          label="Views"
          value={totalViews}
          accent="magenta"
          hint={`created ${formatDate(category.createdAt)}`}
        />
      </SimpleGrid>

      <FileCards
        files={categoryFiles}
        onRemove={remove}
        emptyTitle="This category is empty"
        emptyDescription="Upload a file and tag it with this category from the Files page to see it here."
      />
    </VStack>
  );
}
