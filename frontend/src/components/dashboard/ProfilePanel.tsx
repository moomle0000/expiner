import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import api, { extractErrorMessage } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { formatDate } from "@/lib/format";

interface ProfileValues {
  name: string;
  email: string;
}
interface PasswordValues {
  currentPassword: string;
  newPassword: string;
}

export function ProfilePanel() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const profile = useForm<ProfileValues>({
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });
  const pass = useForm<PasswordValues>({ defaultValues: { currentPassword: "", newPassword: "" } });

  useEffect(() => {
    profile.reset({ name: user?.name ?? "", email: user?.email ?? "" });
  }, [user, profile]);

  async function onProfileSubmit(values: ProfileValues) {
    try {
      const res = await api.patch(ENDPOINTS.me, { name: values.name, email: values.email });
      const updated = res.data.data;
      setUser(updated);
      toast({ status: "success", title: "Profile updated", position: "top-right" });
    } catch (err) {
      toast({ status: "error", title: "Update failed", description: extractErrorMessage(err), position: "top-right" });
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    try {
      await api.post(ENDPOINTS.mePassword, values);
      toast({ status: "success", title: "Password changed", position: "top-right" });
      pass.reset();
    } catch (err) {
      toast({ status: "error", title: "Change failed", description: extractErrorMessage(err), position: "top-right" });
    }
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
      <Box bg="ink.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="xl" p={6}>
        <Text fontSize="lg" fontWeight={700} mb={1}>
          Profile
        </Text>
        <Text fontSize="sm" color="ink.300" mb={6}>
          Update your public details.
        </Text>
        <VStack as="form" onSubmit={profile.handleSubmit(onProfileSubmit)} spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input {...profile.register("name")} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" {...profile.register("email")} />
          </FormControl>
          <HStack>
            <Button type="submit" isLoading={profile.formState.isSubmitting}>
              Save changes
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box bg="ink.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="xl" p={6}>
        <Text fontSize="lg" fontWeight={700} mb={1}>
          Change password
        </Text>
        <Text fontSize="sm" color="ink.300" mb={6}>
          Pick a strong password you don't reuse.
        </Text>
        <VStack as="form" onSubmit={pass.handleSubmit(onPasswordSubmit)} spacing={4} align="stretch">
          <FormControl isInvalid={!!pass.formState.errors.currentPassword}>
            <FormLabel>Current password</FormLabel>
            <PasswordInput {...pass.register("currentPassword", { required: "Required" })} />
            <FormErrorMessage>{pass.formState.errors.currentPassword?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!pass.formState.errors.newPassword}>
            <FormLabel>New password</FormLabel>
            <PasswordInput
              {...pass.register("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })}
            />
            <FormErrorMessage>{pass.formState.errors.newPassword?.message}</FormErrorMessage>
          </FormControl>
          <HStack>
            <Button type="submit" isLoading={pass.formState.isSubmitting}>
              Update password
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box bg="ink.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="xl" p={6} gridColumn={{ lg: "1 / -1" }}>
        <Text fontSize="lg" fontWeight={700} mb={1}>
          Account
        </Text>
        <Text fontSize="sm" color="ink.300" mb={4}>
          Read-only information about this account.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Field label="User ID" value={user?._id} mono />
          <Field label="Role" value={user?.role} />
          <Field label="Folder slug" value={user?.folderSlug} mono />
          <Field label="Created" value={formatDate(user?.createdAt)} />
          <Field label="Last login" value={formatDate(user?.lastLoginAt || user?.lastLogin)} />
          <Field label="Updated" value={formatDate(user?.updatedAt)} />
        </SimpleGrid>
      </Box>
    </SimpleGrid>
  );
}

function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <Box>
      <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.1em" color="ink.400" mb={1}>
        {label}
      </Text>
      <Text fontSize="sm" fontFamily={mono ? "mono" : "body"} color="ink.100">
        {value || "—"}
      </Text>
    </Box>
  );
}
