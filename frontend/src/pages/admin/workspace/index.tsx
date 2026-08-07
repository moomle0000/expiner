import Head from "next/head";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { WorkspacePanel } from "@/components/dashboard/WorkspacePanel";

export default function DashboardWorkspacePage() {
  return (
    <DashboardLayout topbarTitle="DASHBOARD / WORKSPACE">
      <Head>
        <title>Workspace · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Workspace"
        title="Your folders & categories"
        description="Create folders to assign uploads to and category labels to tag them. Everything here is scoped to your account only."
      />
      <WorkspacePanel />
    </DashboardLayout>
  );
}