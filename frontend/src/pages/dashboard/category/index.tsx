import Head from "next/head";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoriesPanel } from "@/components/dashboard/CategoriesPanel";

export default function DashboardCategoriesPage() {
  return (
    <DashboardLayout topbarTitle="DASHBOARD / CATEGORIES">
      <Head>
        <title>Categories · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Categories"
        title="Your categories"
        description="Everything you've grouped by category. Open a category to see the files tagged with it."
      />
      <CategoriesPanel />
    </DashboardLayout>
  );
}
