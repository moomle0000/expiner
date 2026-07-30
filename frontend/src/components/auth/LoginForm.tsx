import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/api";
import { PasswordInput } from "@/components/ui/PasswordInput";
import Link from "next/link";

interface LoginValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    try {
      const user = await login(values.email.trim(), values.password);
      toast({ status: "success", title: `Welcome back, ${user.name || user.email}`, position: "top-right" });
      const next = router.query.next as string | undefined;
      void router.replace(next || (user.role === "admin" ? "/admin" : "/dashboard"));
    } catch (err) {
      toast({ status: "error", title: "Sign in failed", description: extractErrorMessage(err), position: "top-right" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} align="stretch" spacing={6}>
      <Box>
        <Text
          fontFamily="mono"
          fontSize="xs"
          color="accent.lime"
          textTransform="uppercase"
          letterSpacing="0.18em"
          mb={2}
        >
          ▸ Sign in
        </Text>
        <Heading size="xl" letterSpacing="-0.02em" lineHeight="1.05">
          Access your{" "}
          <Box as="span" color="accent.lime">
            media console
          </Box>
        </Heading>
        <Text mt={2} color="ink.300" fontSize="sm">
          Use the email and password from your account.
        </Text>
      </Box>

      <FormControl isInvalid={!!errors.email}>
        <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="ink.300">
          Email
        </FormLabel>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email", { required: "Email is required" })}
        />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="ink.300">
          Password
        </FormLabel>
        <PasswordInput
          autoComplete="current-password"
          placeholder="••••••••"
          {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
        />
        <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
      </FormControl>

      <Button type="submit" size="lg" isLoading={submitting} loadingText="Signing in">
        Sign in
      </Button>

      <HStack justify="center" spacing={1} fontSize="sm" color="ink.300">
        <Text>No account?</Text>
        <Link href="/signup">
          <Text as="span" color="accent.lime" fontWeight={600} _hover={{ textDecoration: "underline" }}>
            Create one
          </Text>
        </Link>
      </HStack>
    </VStack>
  );
}
