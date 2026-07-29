import Head from "next/head";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { MyFilesGrid } from "@/components/dashboard/MyFilesGrid";

export default function DashboardFilesPage() {
  return (
    <DashboardLayout topbarTitle="DASHBOARD / FILES">
      <Head>
        <title>My files · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Files"
        title="Your uploads"
        description="Drag, drop, and stream. Every file is scoped to your account."
      />
      <MyFilesGrid />
    </DashboardLayout>
  );
}
