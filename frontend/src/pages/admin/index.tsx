import Head from "next/head";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminOverviewCards } from "@/components/dashboard/OverviewCards";
import { useAuth } from "@/hooks/useAuth";

export default function AdminHome() {
  const { user } = useAuth();
  return (
    <AdminLayout topbarTitle="ADMIN / OVERVIEW">
      <Head>
        <title>Admin · express.upload</title>
      </Head>
      <PageHeader
        eyebrow={`Signed in as ${user?.email}`}
        title="Control plane"
        description="Manage users, files, and API keys across the entire workspace."
      />
      <VStack align="stretch" spacing={8}>
        <AdminOverviewCards />
        <Box>
          <Text fontSize="xs" fontFamily="mono" color="ink.400" textTransform="uppercase" letterSpacing="0.18em" mb={3}>
            Quick start
          </Text>
          <HStack spacing={3} wrap="wrap">
            <QuickAction href="/admin/users" label="Manage users" />
            <QuickAction href="/admin/keys" label="API keys" />
            <QuickAction href="/admin/files" label="All files" />
          </HStack>
        </Box>
      </VStack>
    </AdminLayout>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Box
      as="a"
      href={href}
      px={4}
      py={2}
      bg="ink.800"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      borderRadius="lg"
      fontSize="sm"
      fontWeight={600}
      _hover={{ borderColor: "accent.lime", color: "accent.lime" }}
      transition="all 0.15s"
    >
      → {label}
    </Box>
  );
}
