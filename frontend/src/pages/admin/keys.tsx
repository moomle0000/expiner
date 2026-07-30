import Head from "next/head";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiKeysPanel } from "@/components/dashboard/ApiKeysPanel";

export default function AdminKeysPage() {
  return (
    <AdminLayout topbarTitle="ADMIN / API KEYS">
      <Head>
        <title>API keys · Admin · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="API keys"
        title="All issued keys"
        description="Audit, monitor, and revoke any API key issued by the platform."
      />
      <ApiKeysPanel scope="all" />
    </AdminLayout>
  );
}
