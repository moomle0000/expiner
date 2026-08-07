import Head from "next/head";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkspacePanel } from "@/components/dashboard/WorkspacePanel";

export default function AdminWorkspacePage() {
  return (
    <AdminLayout topbarTitle="ADMIN / WORKSPACE">
      <Head>
        <title>Workspace · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Workspace"
        title="Your folders & categories"
        description="Create folders to assign uploads to and category labels to tag them. Everything here is scoped to your account only."
      />
      <WorkspacePanel />
    </AdminLayout>
  );
}