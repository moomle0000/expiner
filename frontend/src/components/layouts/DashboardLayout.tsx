import { Box, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveSidebar } from "./ResponsiveSidebar";
import { Topbar } from "./Topbar";

export interface DashboardLayoutProps {
  children: ReactNode;
  topbarTitle?: string;
  topbarRight?: ReactNode;
}

export function DashboardLayout({ children, topbarTitle, topbarRight }: DashboardLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      void router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="ink.900" color="ink.300">
        Loading…
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="ink.900">
      <ResponsiveSidebar role="user" isOpen={navOpen} onClose={() => setNavOpen(false)} />
      <Box flex="1" minW={0}>
        <Topbar title={topbarTitle} rightSlot={topbarRight} onOpenNav={() => setNavOpen(true)} />
        <Box as="main" p={{ base: 4, sm: 5, md: 8 }} maxW="1400px" mx="auto">
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
