import { useCallback, useState } from "react";
import { useToast } from "@chakra-ui/react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { AuthFile } from "@/types/api";

export interface UseFileUploadOptions {
  folder?: string;
  category?: string;
}

/**
 * Uploads a batch of files through `POST /api/files/upload`. Returns the
 * created `AuthFile`s (possibly empty if the whole batch failed). Shared by
 * the visible `FileDropzone` and hidden drag targets on the file-manager
 * pages so upload behaviour stays in one place.
 */
export function useFileUpload({ folder, category }: UseFileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const upload = useCallback(
    async (files: FileList | File[]): Promise<AuthFile[]> => {
      if (!files || files.length === 0) return [];
      setUploading(true);
      const list = Array.from(files);
      const uploaded: AuthFile[] = [];
      try {
        for (const file of list) {
          const fd = new FormData();
          fd.append("file", file);
          if (category) fd.append("category", category);
          const res = await api.post(ENDPOINTS.fileUpload, fd, {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-Folder": folder ?? "",
            },
          });
          uploaded.push(res.data.data as AuthFile);
        }
        toast({
          status: "success",
          title: "Upload complete",
          description: `${list.length} file${list.length > 1 ? "s" : ""} uploaded`,
          position: "top-right",
        });
        return uploaded;
      } catch (err) {
        toast({
          status: "error",
          title: "Upload failed",
          description: extractErrorMessage(err),
          position: "top-right",
        });
        return uploaded;
      } finally {
        setUploading(false);
      }
    },
    [folder, category, toast],
  );

  return { upload, uploading };
}
