import Head from "next/head";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { MyFilesGrid } from "@/components/dashboard/MyFilesGrid";

export default function AdminFilesPage() {
  return (
    <AdminLayout topbarTitle="ADMIN / FILES">
      <Head>
        <title>Files · Admin · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Files"
        title="Asset library"
        description="Inspect and manage files across the workspace."
      />
      <MyFilesGrid />
    </AdminLayout>
  );
}
