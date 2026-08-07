import { useMemo, useState } from "react";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import {
  FiDownload,
  FiExternalLink,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import { CopyButton } from "@/components/ui/CopyButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileIcon } from "@/components/ui/FileIcon";
import { API_BASE_URL } from "@/lib/endpoints";
import { formatBytes, formatDate, formatRelative } from "@/lib/format";
import type { AuthFile } from "@/types/api";

export interface FileCardsProps {
  files: AuthFile[];
  onRemove: (id: string) => Promise<void>;
  emptyTitle?: string;
  emptyDescription?: string;
}

type ViewMode = "grid" | "list";
type DatePreset = "all" | "today" | "week" | "month" | "year";
type SortKey = "newest" | "oldest" | "name-asc" | "size-desc";

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "Any upload date" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
  { value: "year", label: "This year" },
];

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

function matchesDatePreset(createdAt: string, preset: DatePreset): boolean {
  if (preset === "all") return true;
  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return true;
  const now = new Date();
  const DAY = 86400000;
  switch (preset) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return time >= start.getTime();
    }
    case "week":
      return now.getTime() - time <= 7 * DAY;
    case "month":
      return now.getTime() - time <= 30 * DAY;
    case "year":
      return new Date(createdAt).getFullYear() === now.getFullYear();
  }
}

export function FileCards({
  files,
  onRemove,
  emptyTitle = "No files yet",
  emptyDescription,
}: FileCardsProps) {
  const [target, setTarget] = useState<AuthFile | null>(null);
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<DatePreset>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("grid");
  const toast = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((f) => {
      const name = `${f.originalName} ${f.filename ?? ""}`.toLowerCase();
      if (q && !name.includes(q)) return false;

      if (from || to) {
        const d = new Date(f.createdAt).getTime();
        if (Number.isNaN(d)) return true;
        if (from && d < new Date(from).getTime()) return false;
        if (to) {
          const end = new Date(to);
          end.setHours(23, 59, 59, 999);
          if (d > end.getTime()) return false;
        }
        return true;
      }
      return matchesDatePreset(f.createdAt, preset);
    });
  }, [files, query, preset, from, to]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "name-asc":
        list.sort((a, b) => a.originalName.localeCompare(b.originalName));
        break;
      case "size-desc":
        list.sort((a, b) => b.size - a.size);
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    return list;
  }, [filtered, sort]);

  function changePreset(next: DatePreset) {
    setPreset(next);
    if (next !== "all") {
      setFrom("");
      setTo("");
    }
  }

  function changeFrom(value: string) {
    setFrom(value);
    if (value || to) setPreset("all");
  }

  function changeTo(value: string) {
    setTo(value);
    if (from || value) setPreset("all");
  }

  function resetFilters() {
    setQuery("");
    setPreset("all");
    setFrom("");
    setTo("");
    setSort("newest");
  }

  const hasFilters =
    query.trim().length > 0 ||
    preset !== "all" ||
    from.length > 0 ||
    to.length > 0;

  return (
    <VStack align="stretch" spacing={4}>
      <HStack spacing={2} wrap="wrap">
        <InputGroup maxW="sm" minW="200px" flex="1">
          <InputLeftElement
            position="absolute"
            pointerEvents="none"
            color="ink.400"
          >
            <SearchIcon />
          </InputLeftElement>
          <Input
            placeholder="Search by file name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="sm"
          />
        </InputGroup>

        <Select
          size="sm"
          maxW="xs"
          value={preset}
          onChange={(e) => changePreset(e.target.value as DatePreset)}
          aria-label="Filter by upload date"
        >
          {DATE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>

        <Input
          type="date"
          size="sm"
          maxW="36"
          value={from}
          onChange={(e) => changeFrom(e.target.value)}
          aria-label="Uploaded after"
        />
        <Input
          type="date"
          size="sm"
          maxW="36"
          value={to}
          onChange={(e) => changeTo(e.target.value)}
          aria-label="Uploaded before"
        />

        <Select
          size="sm"
          maxW="xs"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort files"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name-asc">Name A–Z</option>
          <option value="size-desc">Largest first</option>
        </Select>

        <HStack
          spacing={0}
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          borderRadius="md"
          overflow="hidden"
        >
          <IconButton
            aria-label="Grid view"
            icon={<FiGrid />}
            size="sm"
            variant={view === "grid" ? "solid" : "ghost"}
            onClick={() => setView("grid")}
          />
          <IconButton
            aria-label="List view"
            icon={<FiList />}
            size="sm"
            variant={view === "list" ? "solid" : "ghost"}
            onClick={() => setView("list")}
          />
        </HStack>
      </HStack>

      <HStack justify="space-between">
        <Text fontSize="xs" color="ink.400" fontFamily="mono">
          {sorted.length} of {files.length}
        </Text>
        {hasFilters && (
          <Button size="xs" variant="ghost" onClick={resetFilters}>
            Clear filters
          </Button>
        )}
      </HStack>

      {files.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No matching files"
          description="Nothing matches your search, date filter, or sort. Try adjusting them."
          action={
            <Button size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : view === "list" ? (
        <Box
          bg="ink.800"
          borderWidth="1px"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Category</Th>
                  <Th>Size</Th>
                  <Th>Uploaded</Th>
                  <Th isNumeric>Link</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {sorted.map((f) => (
                  <Tr key={f._id}>
                    <Td>
                      <HStack spacing={3} minW="0">
                        <FileIcon mime={f.mimetype} boxSize={5} />
                        <Text
                          fontSize="sm"
                          fontWeight={600}
                          noOfLines={1}
                          title={f.originalName}
                        >
                          {f.originalName}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      {f.category ? (
                        <Tag size="sm" colorScheme="brand">
                          {f.category}
                        </Tag>
                      ) : (
                        <Text fontSize="xs" color="ink.500">
                          —
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="sm">{formatBytes(f.size)}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="xs" whiteSpace="nowrap">
                        {formatDate(f.createdAt)}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <CopyButton value={publicUrl(f)} />
                    </Td>
                    <Td>
                      <FileMenu file={f} onDelete={() => setTarget(f)} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
          {sorted.map((f) => (
            <FileCard key={f._id} file={f} onDelete={() => setTarget(f)} />
          ))}
        </SimpleGrid>
      )}

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={async () => {
          if (!target) return;
          try {
            await onRemove(target._id);
            toast({
              status: "success",
              title: "File deleted",
              position: "top-right",
            });
          } catch (err) {
            toast({
              status: "error",
              title: "Delete failed",
              description: String(err),
              position: "top-right",
            });
          } finally {
            setTarget(null);
          }
        }}
        title="Delete file?"
        description={
          target ? `"${target.originalName}" will be removed permanently.` : ""
        }
        confirmLabel="Delete"
        destructive
      />
    </VStack>
  );
}

function FileCard({
  file: f,
  onDelete,
}: {
  file: AuthFile;
  onDelete: () => void;
}) {
  return (
    <Box
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
          <FileMenu file={f} onDelete={onDelete} />
        </HStack>
      </Box>
      <VStack align="stretch" p={3} spacing={1}>
        <Text
          fontSize="sm"
          fontWeight={600}
          noOfLines={1}
          title={f.originalName}
        >
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
        <Text fontSize="xs" color="ink.500">
          Uploaded {formatDate(f.createdAt)}
        </Text>
        {f.category ? (
          <Tag size="sm" colorScheme="brand" alignSelf="flex-start" mt={0.5}>
            {f.category}
          </Tag>
        ) : null}
        <HStack
          mt={1}
          bg="ink.900"
          borderRadius="md"
          px={2}
          py={1.5}
          borderWidth="1px"
          borderColor="whiteAlpha.100"
        >
          <Text
            fontSize="xs"
            fontFamily="mono"
            color="ink.300"
            noOfLines={1}
            flex="1"
          >
            /f/{f.shortUrl}
          </Text>
          <CopyButton value={publicUrl(f)} />
        </HStack>
      </VStack>
    </Box>
  );
}

function FileMenu({
  file: f,
  onDelete,
}: {
  file: AuthFile;
  onDelete: () => void;
}) {
  return (
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
        <MenuItem icon={<FiTrash2 />} color="accent.magenta" onClick={onDelete}>
          Delete
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
