import Head from "next/head";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <AdminLayout topbarTitle="ADMIN / USERS">
      <Head>
        <title>Users · Admin · express.upload</title>
      </Head>
      <PageHeader
        eyebrow="Users"
        title="People with access"
        description="Create, edit, and revoke access for users across the platform."
      />
      <UsersTable />
    </AdminLayout>
  );
}
