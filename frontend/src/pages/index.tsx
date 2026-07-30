import { useRouter } from "next/router";
import { useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      void router.replace("/login");
    } else if (isAdmin) {
      void router.replace("/admin");
    } else {
      void router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  return <Flex h="100vh" bg="ink.900" />;
}
