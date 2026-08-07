import {
  Box,
  Button,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useFolders } from "@/hooks/useFolders";
import { useCategories } from "@/hooks/useCategories";
import { FileCards } from "@/components/ui/FileCards";
import { FileDropzone } from "@/components/ui/FileDropzone";
import type { FileCategory } from "@/types/api";

const TYPE_LABEL: Record<FileCategory, string> = {
  image: "Images",
  document: "Documents",
  video: "Video",
  audio: "Audio",
  archive: "Archives",
  executable: "Executables",
  other: "Other",
};

export function MyFilesGrid() {
  const { files, loading, type, setType, category, setCategory, remove, refresh } = useFiles();
  const { folders } = useFolders();
  const { categories } = useCategories();
  const [newCategory, setNewCategory] = useState("");
  const [uploadFolder, setUploadFolder] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");

  const fileCategories = Array.from(new Set(files.map((f) => f.category))).filter(
    (c): c is string => !!c,
  );

  function selectType(t: FileCategory | "all") {
    setType(t);
    if (t !== "all") setCategory("all");
  }

  function selectCategory(c: string | "all") {
    setCategory(c);
    if (c !== "all") setType("all");
  }

  return (
    <VStack align="stretch" spacing={6}>
      <HStack spacing={2} wrap="wrap">
        <Select
          size="sm"
          maxW="xs"
          value={uploadFolder}
          onChange={(e) => setUploadFolder(e.target.value)}
          aria-label="Upload folder"
        >
          <option value="">No folder</option>
          {folders.map((f) => (
            <option key={f._id} value={f.name}>
              {f.name}
            </option>
          ))}
        </Select>
        <Select
          size="sm"
          maxW="xs"
          value={uploadCategory}
          onChange={(e) => setUploadCategory(e.target.value)}
          aria-label="Upload category"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          size="sm"
          placeholder="New category (optional)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          flex="1"
          minW="200px"
        />
      </HStack>
      <FileDropzone
        onUploaded={() => refresh()}
        folder={uploadFolder || undefined}
        category={newCategory.trim() || uploadCategory || undefined}
      />

      <HStack spacing={2} wrap="wrap">
        <FilterChip active={type === "all" && category === "all"} onClick={() => { selectType("all"); selectCategory("all"); }}>
          All
        </FilterChip>
        {(Object.keys(TYPE_LABEL) as FileCategory[]).map((c) => (
          <FilterChip key={c} active={type === c && category === "all"} onClick={() => selectType(c)}>
            {TYPE_LABEL[c]}
          </FilterChip>
        ))}
        {fileCategories.length > 0 && (
          <Select
            size="sm"
            value={category}
            onChange={(e) => selectCategory(e.target.value)}
            borderRadius="full"
            w="auto"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {fileCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
      </HStack>

      {loading ? (
        <Text color="ink.300">Loading…</Text>
      ) : (
        <FileCards
          files={files}
          onRemove={remove}
          emptyDescription="Drop your first asset above to start streaming. It will appear here, organized by type."
        />
      )}
    </VStack>
  );
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      variant={active ? "solid" : "outline"}
      onClick={onClick}
      borderRadius="full"
      px={4}
    >
      {children}
    </Button>
  );
}
