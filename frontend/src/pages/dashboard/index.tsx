import Head from "next/head";
import { VStack } from "@chakra-ui/react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { UserOverviewCards } from "@/components/dashboard/OverviewCards";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardHome() {
  const { user } = useAuth();
  return (
    <DashboardLayout topbarTitle="DASHBOARD / OVERVIEW">
      <Head>
        <title>Dashboard · express.upload</title>
      </Head>
      <PageHeader
        eyebrow={`Welcome back, ${user?.name || user?.username || "creator"}`}
        title="Your media workspace"
        description="Upload files, mint API keys, and inspect your storage at a glance."
      />
      <VStack align="stretch" spacing={8}>
        <UserOverviewCards />
      </VStack>
    </DashboardLayout>
  );
}
