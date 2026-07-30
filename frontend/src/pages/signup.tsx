import Head from "next/head";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <>
      <Head>
        <title>Create account · express.upload</title>
      </Head>
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </>
  );
}
