import { useCallback, useEffect, useState } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { AuthFile, FileCategory } from "@/types/api";

export function useFiles(initialType?: FileCategory | "all") {
  const [files, setFiles] = useState<AuthFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<FileCategory | "all">(initialType ?? "all");
<<<<<<< HEAD
  const [category, setCategory] = useState<string | "all">("all");

  const fetchAll = useCallback(async (t: FileCategory | "all", c: string | "all") => {
    setLoading(true);
    setError(null);
    try {
      let url: string;
      if (c && c !== "all") url = ENDPOINTS.filesByCategory(c);
      else if (t !== "all") url = ENDPOINTS.filesByType(t);
      else url = ENDPOINTS.files;
=======

  const fetchAll = useCallback(async (t: FileCategory | "all") => {
    setLoading(true);
    setError(null);
    try {
      const url = t === "all" ? ENDPOINTS.files : ENDPOINTS.filesByType(t);
>>>>>>> origin/main
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
<<<<<<< HEAD
    void fetchAll(type, category);
  }, [type, category, fetchAll]);
=======
    void fetchAll(type);
  }, [type, fetchAll]);
>>>>>>> origin/main

  const remove = useCallback(
    async (id: string) => {
      await api.delete(ENDPOINTS.deleteFile(id));
      setFiles((prev) => prev.filter((f) => f._id !== id));
    },
    [],
  );

<<<<<<< HEAD
  const refresh = useCallback(() => fetchAll(type, category), [fetchAll, type, category]);

  return { files, loading, error, type, setType, category, setCategory, remove, refresh };
=======
  const refresh = useCallback(() => fetchAll(type), [fetchAll, type]);

  return { files, loading, error, type, setType, remove, refresh };
>>>>>>> origin/main
}
