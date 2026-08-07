import {
  Box,
  Button,
  Heading,
  HStack,
  Input,
  List,
  ListItem,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiFolder, FiTag, FiTrash2, FiPlus } from "react-icons/fi";
import { useFolders } from "@/hooks/useFolders";
import { useCategories } from "@/hooks/useCategories";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { extractErrorMessage } from "@/lib/api";

type Deletable = { _id: string; name: string };

export function WorkspacePanel() {
  const folders = useFolders();
  const categories = useCategories();
  const toast = useToast();
  const [target, setTarget] = useState<{ kind: "folder" | "category"; item: Deletable } | null>(null);

  async function confirmDelete() {
    if (!target) return;
    try {
      if (target.kind === "folder") {
        await folders.remove(target.item._id);
      } else {
        await categories.remove(target.item._id);
      }
      toast({ status: "success", title: `${target.kind} deleted`, position: "top-right" });
    } catch (err) {
      toast({ status: "error", title: "Delete failed", description: extractErrorMessage(err), position: "top-right" });
    } finally {
      setTarget(null);
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <ManageSection
          title="Folders"
          icon={<FiFolder />}
          emptyHint="No folders yet. Create one to organize your uploads."
          loading={folders.loading}
          items={folders.folders}
          addPlaceholder="e.g. Contracts, Receipts, Docs"
          onAdd={async (name) => {
            try {
              await folders.create(name);
              toast({ status: "success", title: "Folder created", position: "top-right" });
            } catch (err) {
              toast({ status: "error", title: "Could not create folder", description: extractErrorMessage(err), position: "top-right" });
            }
          }}
          onDelete={(item) => setTarget({ kind: "folder", item })}
        />
        <ManageSection
          title="Categories"
          icon={<FiTag />}
          emptyHint="No categories yet. Create labels to tag your uploads."
          loading={categories.loading}
          items={categories.categories}
          addPlaceholder="e.g. Work, Personal, Invoice"
          onAdd={async (name) => {
            try {
              await categories.create(name);
              toast({ status: "success", title: "Category created", position: "top-right" });
            } catch (err) {
              toast({ status: "error", title: "Could not create category", description: extractErrorMessage(err), position: "top-right" });
            }
          }}
          onDelete={(item) => setTarget({ kind: "category", item })}
        />
      </SimpleGrid>

      <ConfirmDialog
        isOpen={!!target}
        onClose={() => setTarget(null)}
        onConfirm={confirmDelete}
        title={target ? `Delete ${target.kind} "${target.item.name}"?` : ""}
        description={`"${target?.item.name ?? ""}" will be removed from your account. Files already uploaded are not deleted.`}
        confirmLabel="Delete"
        destructive
      />
    </VStack>
  );
}

interface ManageSectionProps {
  title: string;
  icon: React.ReactNode;
  emptyHint: string;
  loading: boolean;
  items: { _id: string; name: string }[];
  addPlaceholder: string;
  onAdd: (name: string) => void | Promise<void>;
  onDelete: (item: { _id: string; name: string }) => void;
}

function ManageSection({ title, icon, emptyHint, loading, items, addPlaceholder, onAdd, onDelete }: ManageSectionProps) {
  const [name, setName] = useState("");

  function submit() {
    const clean = name.trim();
    if (!clean) return;
    void onAdd(clean);
    setName("");
  }

  return (
    <Box bg="ink.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="xl" p={5}>
      <HStack spacing={2} mb={4}>
        <Box color="accent.lime">{icon}</Box>
        <Heading as="h3" size="sm">
          {title}
        </Heading>
      </HStack>

      <HStack mb={4}>
        <Input
          placeholder={addPlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          size="sm"
        />
        <Button size="sm" leftIcon={<FiPlus />} onClick={submit}>
          Add
        </Button>
      </HStack>

      {loading ? (
        <Spinner size="sm" color="accent.lime" />
      ) : items.length === 0 ? (
        <Text fontSize="sm" color="ink.400">
          {emptyHint}
        </Text>
      ) : (
        <List spacing={2}>
          {items.map((item) => (
            <ListItem
              key={item._id}
              bg="ink.900"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              borderRadius="md"
              px={3}
              py={2}
            >
              <HStack justify="space-between">
                <Text fontSize="sm" noOfLines={1}>
                  {item.name}
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  color="accent.magenta"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => onDelete(item)}
                >
                  <FiTrash2 />
                </Button>
              </HStack>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}