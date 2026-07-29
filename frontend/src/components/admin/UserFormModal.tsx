import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  FormHelperText,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUsers, type UserInput } from "@/hooks/useUsers";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { extractErrorMessage } from "@/lib/api";
import type { User } from "@/types/api";

interface FormValues {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: "admin" | "user";
  status?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserFormModal({ isOpen, onClose, user }: Props) {
  const { createUser, updateUser } = useUsers();
  const toast = useToast();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { email: "", password: "", name: "", username: "", role: "user", status: true },
  });
  const statusValue = watch("status");

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role === "admin" ? "admin" : "user",
        status: user.status !== false,
        password: "",
      });
    } else {
      reset({ email: "", password: "", name: "", username: "", role: "user", status: true });
    }
  }, [user, isOpen, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (user) {
        const payload: UserInput = {
          email: values.email,
          name: values.name,
          username: values.username,
          role: values.role,
          status: values.status,
        };
        if (values.password) payload.password = values.password;
        await updateUser(user._id, payload);
        toast({ status: "success", title: "User updated", position: "top-right" });
      } else {
        if (!values.password) {
          toast({ status: "error", title: "Password is required", position: "top-right" });
          return;
        }
        await createUser({
          email: values.email,
          name: values.name,
          username: values.username,
          password: values.password,
          role: values.role,
          status: values.status,
        });
        toast({ status: "success", title: "User created", position: "top-right" });
      }
      onClose();
    } catch (err) {
      toast({ status: "error", title: "Save failed", description: extractErrorMessage(err), position: "top-right" });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{user ? "Edit user" : "Create user"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack as="form" id="user-form" onSubmit={handleSubmit(onSubmit)} spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Name</FormLabel>
              <Input {...register("name")} placeholder="Jane Doe" />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input {...register("username")} placeholder="janedoe" />
            </FormControl>
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" {...register("email", { required: "Email is required" })} placeholder="you@company.com" />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.password}>
              <FormLabel>{user ? "New password (optional)" : "Password"}</FormLabel>
              <PasswordInput
                {...register("password", {
                  minLength: user ? undefined : { value: 8, message: "Minimum 8 characters" },
                })}
                placeholder={user ? "Leave blank to keep current" : "At least 8 characters"}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Role</FormLabel>
              <Select {...register("role")}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </Select>
            </FormControl>
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <FormLabel mb={0}>Account status</FormLabel>
                <FormHelperText color="ink.400">
                  Disabled accounts cannot sign in.
                </FormHelperText>
              </Box>
              <Switch
                id="user-status"
                colorScheme="lime"
                size="lg"
                isChecked={statusValue !== false}
                onChange={(e) => setValue("status", e.target.checked, { shouldDirty: true })}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="user-form" isLoading={isSubmitting}>
              {user ? "Save" : "Create"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
