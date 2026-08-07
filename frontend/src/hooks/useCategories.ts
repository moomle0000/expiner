import { useCallback, useEffect, useState } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { WorkspaceCategory } from "@/types/api";

export function useCategories() {
  const [categories, setCategories] = useState<WorkspaceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(ENDPOINTS.categories);
      setCategories((res.data?.data ?? []) as WorkspaceCategory[]);
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
    async (name: string): Promise<WorkspaceCategory> => {
      const res = await api.post(ENDPOINTS.createCategory, { name });
      const created = res.data.data as WorkspaceCategory;
      await fetchAll();
      return created;
    },
    [fetchAll],
  );

  const remove = useCallback(async (id: string) => {
    await api.delete(ENDPOINTS.deleteCategory(id));
    setCategories((prev) => prev.filter((c) => c._id !== id));
  }, []);

  return { categories, loading, error, create, remove, refresh: fetchAll };
}