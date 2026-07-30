import Head from "next/head";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiKeysPanel } from "@/components/dashboard/ApiKeysPanel";

export default function DashboardApiKeysPage() {
  return (
    <DashboardLayout topbarTitle="DASHBOARD / API KEYS">
      <Head>
        <title>API keys · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="API keys"
        title="Server-to-server auth"
        description="Mint scoped keys for scripts and integrations. The raw key is shown only once at creation."
      />
      <ApiKeysPanel scope="me" />
    </DashboardLayout>
  );
}
