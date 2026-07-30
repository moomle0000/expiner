import { useCallback, useEffect, useState } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { AuthFile, FileCategory } from "@/types/api";

export function useFiles(initialType?: FileCategory | "all") {
  const [files, setFiles] = useState<AuthFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<FileCategory | "all">(initialType ?? "all");

  const fetchAll = useCallback(async (t: FileCategory | "all") => {
    setLoading(true);
    setError(null);
    try {
      const url = t === "all" ? ENDPOINTS.files : ENDPOINTS.filesByType(t);
      const res = await api.get(url);
      const data = (res.data?.data ?? []) as AuthFile[];
      setFiles(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll(type);
  }, [type, fetchAll]);

  const remove = useCallback(
    async (id: string) => {
      await api.delete(ENDPOINTS.deleteFile(id));
      setFiles((prev) => prev.filter((f) => f._id !== id));
    },
    [],
  );

  const refresh = useCallback(() => fetchAll(type), [fetchAll, type]);

  return { files, loading, error, type, setType, remove, refresh };
}
