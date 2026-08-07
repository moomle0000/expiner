import Head from "next/head";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { FoldersPanel } from "@/components/dashboard/FoldersPanel";

export default function DashboardFoldersPage() {
  return (
    <DashboardLayout topbarTitle="DASHBOARD / FOLDERS">
      <Head>
        <title>Folders · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Folders"
        title="Your folders"
        description="Everything you've grouped by folder. Open a folder to see the files inside it."
      />
      <FoldersPanel />
    </DashboardLayout>
  );
}
