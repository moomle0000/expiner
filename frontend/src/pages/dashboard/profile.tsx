import Head from "next/head";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";

export default function DashboardProfilePage() {
  return (
    <DashboardLayout topbarTitle="DASHBOARD / PROFILE">
      <Head>
        <title>Profile · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage your name, email, and password."
      />
      <ProfilePanel />
    </DashboardLayout>
  );
}
