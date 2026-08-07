import Head from "next/head";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CategoryDetail } from "@/components/dashboard/CategoryDetail";

export default function DashboardCategoryDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  return (
    <DashboardLayout topbarTitle="DASHBOARD / CATEGORIES">
      <Head>
        <title>Category · express.upload</title>
      </Head>
      <CategoryDetail categoryId={id} />
    </DashboardLayout>
  );
}
