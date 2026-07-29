import Head from "next/head";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign in · express.upload</title>
      </Head>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
}
