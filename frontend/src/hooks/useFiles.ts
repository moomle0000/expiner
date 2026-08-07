import { useCallback, useEffect, useState } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { AuthFile, FileCategory } from "@/types/api";

export function useFiles(initialType?: FileCategory | "all") {
  const [files, setFiles] = useState<AuthFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<FileCategory | "all">(initialType ?? "all");
  const [category, setCategory] = useState<string | "all">("all");

  const fetchAll = useCallback(async (t: FileCategory | "all", c: string | "all") => {
    setLoading(true);
    setError(null);
    try {
      let url: string;
      if (c && c !== "all") url = ENDPOINTS.filesByCategory(c);
      else if (t !== "all") url = ENDPOINTS.filesByType(t);
      else url = ENDPOINTS.files;
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
    void fetchAll(type, category);
  }, [type, category, fetchAll]);

  const remove = useCallback(
    async (id: string) => {
      await api.delete(ENDPOINTS.deleteFile(id));
      setFiles((prev) => prev.filter((f) => f._id !== id));
    },
    [],
  );

  const refresh = useCallback(() => fetchAll(type, category), [fetchAll, type, category]);

  return { files, loading, error, type, setType, category, setCategory, remove, refresh };
}
