import Head from "next/head";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { FolderDetail } from "@/components/dashboard/FolderDetail";

export default function DashboardFolderDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  return (
    <DashboardLayout topbarTitle="DASHBOARD / FOLDERS">
      <Head>
        <title>Folder · express.upload</title>
      </Head>
      <FolderDetail folderId={id} />
    </DashboardLayout>
  );
}
