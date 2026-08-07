import { useCallback, useEffect, useState } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { WorkspaceFolder } from "@/types/api";

export function useFolders() {
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(ENDPOINTS.folders);
      setFolders((res.data?.data ?? []) as WorkspaceFolder[]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(
    async (name: string): Promise<WorkspaceFolder> => {
      const res = await api.post(ENDPOINTS.createFolder, { name });
      const created = res.data.data as WorkspaceFolder;
      await fetchAll();
      return created;
    },
    [fetchAll],
  );

  const remove = useCallback(async (id: string) => {
    await api.delete(ENDPOINTS.deleteFolder(id));
    setFolders((prev) => prev.filter((f) => f._id !== id));
  }, []);

  return { folders, loading, error, create, remove, refresh: fetchAll };
}