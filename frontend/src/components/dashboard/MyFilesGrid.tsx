import {
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiDownload, FiCopy, FiTrash2, FiExternalLink, FiMoreVertical } from "react-icons/fi";
import { useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { FileIcon } from "@/components/ui/FileIcon";
import { CopyButton } from "@/components/ui/CopyButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { API_BASE_URL } from "@/lib/endpoints";
import { formatBytes, formatRelative } from "@/lib/format";
import type { AuthFile, FileCategory } from "@/types/api";

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
  const { files, loading, type, setType, remove, refresh } = useFiles();
  const [target, setTarget] = useState<AuthFile | null>(null);
  const toast = useToast();

  function publicUrl(f: AuthFile): string {
    return `${API_BASE_URL}/f/${f.shortUrl}${f.extension ?? ""}`;
  }

  function streamUrl(f: AuthFile): string {
    return `${API_BASE_URL}/api/files/${f._id}${f.extension ?? ""}`;
  }

  function downloadUrl(f: AuthFile): string {
    return `${API_BASE_URL}/api/files/${f._id}/download`;
  }

  function isImage(f: AuthFile): boolean {
    return (f.mimetype || "").startsWith("image/");
  }

  return (
    <VStack align="stretch" spacing={6}>
      <FileDropzone onUploaded={() => refresh()} />

      <HStack spacing={2} wrap="wrap">
        <FilterChip active={type === "all"} onClick={() => setType("all")}>
          All
        </FilterChip>
        {(Object.keys(TYPE_LABEL) as FileCategory[]).map((c) => (
          <FilterChip key={c} active={type === c} onClick={() => setType(c)}>
            {TYPE_LABEL[c]}
          </FilterChip>
        ))}
      </HStack>

      {loading ? (
        <Text color="ink.300">Loading…</Text>
      ) : files.length === 0 ? (
        <EmptyState
          title="No files yet"
          description="Drop your first asset above to start streaming. It will appear here, organized by type."
        />
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
          {files.map((f) => (
            <Box
              key={f._id}
              bg="ink.800"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              borderRadius="xl"
              overflow="hidden"
              _hover={{ borderColor: "whiteAlpha.300" }}
              transition="border-color 0.15s"
            >
              <Box
                position="relative"
                h="140px"
                bg="ink.900"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
              >
                {isImage(f) ? (
                  <Image
                    src={streamUrl(f)}
                    alt={f.originalName}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                ) : (
                  <FileIcon mime={f.mimetype} boxSize={10} />
                )}
                <HStack position="absolute" top={2} right={2} spacing={1}>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      size="xs"
                      variant="ghost"
                      aria-label="Actions"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<FiDownload />}
                        as="a"
                        href={downloadUrl(f)}
                        target="_blank"
                      >
                        Download
                      </MenuItem>
                      <MenuItem
                        icon={<FiExternalLink />}
                        as="a"
                        href={streamUrl(f)}
                        target="_blank"
                      >
                        Open
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        color="accent.magenta"
                        onClick={() => setTarget(f)}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </Box>
              <VStack align="stretch" p={3} spacing={1}>
                <Text fontSize="sm" fontWeight={600} noOfLines={1} title={f.originalName}>
                  {f.originalName}
                </Text>
                <HStack justify="space-between">
                  <Text fontSize="xs" color="ink.400">
                    {formatBytes(f.size)} · {formatRelative(f.createdAt)}
                  </Text>
                  <Text fontSize="xs" color="ink.400" fontFamily="mono">
                    ↓ {f.downloads} · 👁 {f.views}
                  </Text>
                </HStack>
                <HStack
                  mt={1}
                  bg="ink.900"
                  borderRadius="md"
                  px={2}
                  py={1.5}
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontSize="xs" fontFamily="mono" color="ink.300" noOfLines={1} flex="1">
                    /f/{f.shortUrl}
                  </Text>
                  <CopyButton value={publicUrl(f)} />
                </HStack>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={async () => {
          if (!target) return;
          try {
            await remove(target._id);
            toast({ status: "success", title: "File deleted", position: "top-right" });
          } catch (err) {
            toast({ status: "error", title: "Delete failed", description: String(err), position: "top-right" });
          } finally {
            setTarget(null);
          }
        }}
        title="Delete file?"
        description={target ? `"${target.originalName}" will be removed permanently.` : ""}
        confirmLabel="Delete"
        destructive
      />
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
