import { useCallback, useEffect, useState } from "react";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { User } from "@/types/api";

export interface UserInput {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: "admin" | "user";
  status?: boolean;
  active?: boolean;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(ENDPOINTS.users);
      setUsers((res.data?.data ?? []) as User[]);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const createUser = useCallback(
    async (input: UserInput) => {
      const res = await api.post(ENDPOINTS.users, input);
      const created = res.data.data as User;
      setUsers((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const updateUser = useCallback(async (id: string, input: UserInput) => {
    const res = await api.patch(ENDPOINTS.user(id), input);
    const updated = res.data.data as User;
    setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
    return updated;
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    await api.delete(ENDPOINTS.user(id));
    setUsers((prev) => prev.filter((u) => u._id !== id));
  }, []);

  const resetPassword = useCallback(async (userId: string, newPassword: string) => {
    await api.post(ENDPOINTS.adminResetPassword, { userId, newPassword });
  }, []);

  const setUserStatus = useCallback(async (userId: string, status: boolean) => {
    const res = await api.patch(ENDPOINTS.user(userId), { status });
    const updated = res.data.data as User;
    setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    return updated;
  }, []);

  return { users, loading, error, refresh: fetchAll, createUser, updateUser, deleteUser, resetPassword, setUserStatus };
}
