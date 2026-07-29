import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
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

interface SignupValues {
  name: string;
  username: string;
  email: string;
  password: string;
}

export function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    defaultValues: { name: "", username: "", email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    setSubmitting(true);
    try {
      const user = await signup({
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast({ status: "success", title: `Welcome, ${user.name || user.email}`, position: "top-right" });
      void router.replace("/dashboard");
    } catch (err) {
      toast({ status: "error", title: "Sign up failed", description: extractErrorMessage(err), position: "top-right" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <VStack as="form" onSubmit={handleSubmit(onSubmit)} align="stretch" spacing={5}>
      <Box>
        <Text
          fontFamily="mono"
          fontSize="xs"
          color="accent.lime"
          textTransform="uppercase"
          letterSpacing="0.18em"
          mb={2}
        >
          ▸ Create account
        </Text>
        <Heading size="xl" letterSpacing="-0.02em" lineHeight="1.05">
          Spin up your{" "}
          <Box as="span" color="accent.lime">
            asset pipeline
          </Box>
        </Heading>
      </Box>

      <FormControl isInvalid={!!errors.name}>
        <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="ink.300">
          Name
        </FormLabel>
        <Input placeholder="Jane Doe" {...register("name", { required: "Name is required", minLength: 2 })} />
        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.username}>
        <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="ink.300">
          Username
        </FormLabel>
        <Input placeholder="janedoe" {...register("username", { required: "Username is required", minLength: 2 })} />
        <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.email}>
        <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="ink.300">
          Email
        </FormLabel>
        <Input type="email" placeholder="you@company.com" {...register("email", { required: "Email is required" })} />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.password}>
        <FormLabel fontSize="xs" textTransform="uppercase" letterSpacing="0.12em" color="ink.300">
          Password
        </FormLabel>
        <PasswordInput
          placeholder="At least 8 characters"
          {...register("password", { required: "Password is required", minLength: { value: 8, message: "Minimum 8 characters" } })}
        />
        <FormHelperText color="ink.400">8 characters or more.</FormHelperText>
        <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
      </FormControl>

      <Button type="submit" size="lg" isLoading={submitting} loadingText="Creating account">
        Create account
      </Button>

      <HStack justify="center" spacing={1} fontSize="sm" color="ink.300">
        <Text>Already have an account?</Text>
        <Link href="/login">
          <Text as="span" color="accent.lime" fontWeight={600} _hover={{ textDecoration: "underline" }}>
            Sign in
          </Text>
        </Link>
      </HStack>
    </VStack>
  );
}
