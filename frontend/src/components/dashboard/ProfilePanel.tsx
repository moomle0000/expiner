import {
  Avatar,
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
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import api, { extractErrorMessage } from "@/lib/api";
import { API_BASE_URL, ENDPOINTS } from "@/lib/endpoints";
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

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const avatarUrl = user?.avatar ? `${API_BASE_URL}${user.avatar}` : undefined;

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setAvatarUploading(true);
    try {
      const res = await api.post(ENDPOINTS.meAvatar, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.data);
      toast({ status: "success", title: "Avatar updated", position: "top-right" });
    } catch (err) {
      toast({ status: "error", title: "Upload failed", description: extractErrorMessage(err), position: "top-right" });
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  }

  async function handleRemoveAvatar() {
    try {
      const res = await api.patch(ENDPOINTS.me, { avatar: null });
      setUser(res.data.data);
      toast({ status: "success", title: "Avatar removed", position: "top-right" });
    } catch (err) {
      toast({ status: "error", title: "Remove failed", description: extractErrorMessage(err), position: "top-right" });
    }
  }

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
      <Box bg="ink.800" borderWidth="1px" borderColor="whiteAlpha.100" borderRadius="xl" p={6} gridColumn={{ lg: "1 / -1" }}>
        <Text fontSize="lg" fontWeight={700} mb={1}>
          Profile picture
        </Text>
        <Text fontSize="sm" color="ink.300" mb={6}>
          JPG, PNG, GIF or WebP — up to 5 MB. Used in the top bar.
        </Text>
        <HStack spacing={5} align="center">
          <Avatar size="2xl" name={user?.name || user?.email} src={avatarUrl} bg="accent.lime" color="ink.900" fontWeight={700} />
          <VStack align="flex-start" spacing={3}>
            <HStack>
              <Button size="sm" isLoading={avatarUploading} onClick={() => avatarInputRef.current?.click()}>
                Upload new picture
              </Button>
              {user?.avatar && (
                <Button size="sm" variant="ghost" onClick={handleRemoveAvatar}>
                  Remove
                </Button>
              )}
            </HStack>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
            <Text fontSize="xs" color="ink.400">
              {user?.avatar ? avatarUrl : "No picture yet — upload one to personalize your account."}
            </Text>
          </VStack>
        </HStack>
      </Box>

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
