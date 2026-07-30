import Head from "next/head";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";

export default function AdminProfilePage() {
  return (
    <AdminLayout topbarTitle="ADMIN / PROFILE">
      <Head>
        <title>Profile · Admin · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage your name, email, and password."
      />
      <ProfilePanel />
    </AdminLayout>
  );
}
