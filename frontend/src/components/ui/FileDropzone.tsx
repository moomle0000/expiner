import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { AuthFile } from "@/types/api";

export interface FileDropzoneProps {
  onUploaded?: (file: AuthFile) => void;
  folder?: string;
  category?: string;
  accept?: string;
  multiple?: boolean;
}

export function FileDropzone({
  onUploaded,
  folder,
  category,
  accept,
  multiple = true,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);
  const { upload, uploading } = useFileUpload({ folder, category });

  const start = useCallback(
    async (files: FileList | File[]) => {
      const uploaded = await upload(files);
      for (const f of uploaded) onUploaded?.(f);
    },
    [upload, onUploaded],
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
        void start(e.dataTransfer.files);
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
        onChange={(e) => e.target.files && start(e.target.files)}
      />
      <VStack spacing={3}>
        <Box color={uploading ? "accent.lime" : "ink.300"} fontSize="3xl">
          <FiUploadCloud />
        </Box>
        <HStack>
          <Text fontWeight="600">
            {uploading ? "Uploading…" : "Drop files here"}
          </Text>
          <Text color="ink.400">or click to browse</Text>
        </HStack>
        <Text fontSize="xs" color="ink.400">
          Files are stored under your account folder. Max size depends on the
          server.
        </Text>
      </VStack>
    </Box>
  );
}
