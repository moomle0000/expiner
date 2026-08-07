import { Box, HStack, Text, VStack, useToast } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { AuthFile } from "@/types/api";

export interface FileDropzoneProps {
  onUploaded?: (file: AuthFile) => void;
  folder?: string;
<<<<<<< HEAD
  category?: string;
=======
>>>>>>> origin/main
  accept?: string;
  multiple?: boolean;
}

<<<<<<< HEAD
export function FileDropzone({ onUploaded, folder, category, accept, multiple = true }: FileDropzoneProps) {
=======
export function FileDropzone({ onUploaded, folder, accept, multiple = true }: FileDropzoneProps) {
>>>>>>> origin/main
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const upload = useCallback(
    async (files: FileList | File[]) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      const list = Array.from(files);
      try {
        for (const file of list) {
          const fd = new FormData();
          fd.append("file", file);
<<<<<<< HEAD
          if (category) fd.append("category", category);
=======
>>>>>>> origin/main
          const res = await api.post(ENDPOINTS.fileUpload, fd, {
            headers: { "Content-Type": "multipart/form-data", "X-Folder": folder ?? "" },
          });
          const uploaded = res.data.data as AuthFile;
          onUploaded?.(uploaded);
        }
        toast({
          status: "success",
          title: "Upload complete",
          description: `${list.length} file${list.length > 1 ? "s" : ""} uploaded`,
          position: "top-right",
        });
      } catch (err) {
        toast({ status: "error", title: "Upload failed", description: extractErrorMessage(err), position: "top-right" });
      } finally {
        setUploading(false);
      }
    },
<<<<<<< HEAD
    [folder, category, onUploaded, toast],
=======
    [folder, onUploaded, toast],
>>>>>>> origin/main
  );

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        void upload(e.dataTransfer.files);
      }}
      cursor="pointer"
      borderWidth="1.5px"
      borderStyle="dashed"
      borderColor={isOver ? "accent.lime" : "whiteAlpha.200"}
      borderRadius="xl"
      p={10}
      bg={isOver ? "whiteAlpha.50" : "ink.800"}
      transition="all 0.15s"
      _hover={{ borderColor: "whiteAlpha.400" }}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
      <VStack spacing={3}>
        <Box color={uploading ? "accent.lime" : "ink.300"} fontSize="3xl">
          <FiUploadCloud />
        </Box>
        <HStack>
          <Text fontWeight="600">{uploading ? "Uploading…" : "Drop files here"}</Text>
          <Text color="ink.400">or click to browse</Text>
        </HStack>
        <Text fontSize="xs" color="ink.400">
          Files are stored under your account folder. Max size depends on the server.
        </Text>
      </VStack>
    </Box>
  );
}
