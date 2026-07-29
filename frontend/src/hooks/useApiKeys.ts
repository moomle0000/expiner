import { useCallback, useEffect, useState } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ApiKeyCreated, ApiKeyPublic } from "@/types/api";

export function useApiKeys(scope: "me" | "all" = "me") {
  const [keys, setKeys] = useState<ApiKeyPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = scope === "all" ? ENDPOINTS.adminKeys : ENDPOINTS.myKeys;
      const res = await api.get(url);
      const data = (res.data?.data ?? []) as ApiKeyPublic[];
      setKeys(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(
    async (name: string): Promise<ApiKeyCreated> => {
      const res = await api.post(ENDPOINTS.myKeys, { name });
      const created = res.data.data as ApiKeyCreated;
      await fetchAll();
      return created;
    },
    [fetchAll],
  );

  const revoke = useCallback(
    async (id: string) => {
      await api.post(ENDPOINTS.revokeKey(id));
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, active: false } : k)));
    },
    [],
  );

  return { keys, loading, error, create, revoke, refresh: fetchAll };
}
