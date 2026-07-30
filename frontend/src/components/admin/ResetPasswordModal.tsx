import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUsers } from "@/hooks/useUsers";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { extractErrorMessage } from "@/lib/api";
import type { User } from "@/types/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface FormValues {
  newPassword: string;
}

export function ResetPasswordModal({ isOpen, onClose, user }: Props) {
  const { resetPassword } = useUsers();
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { newPassword: "" },
  });
  const [done, setDone] = useState(false);

  async function onSubmit(values: FormValues) {
    if (!user) return;
    try {
      await resetPassword(user._id, values.newPassword);
      setDone(true);
      toast({ status: "success", title: "Password reset", position: "top-right" });
      reset();
    } catch (err) {
      toast({ status: "error", title: "Reset failed", description: extractErrorMessage(err), position: "top-right" });
    }
  }

  function close() {
    setDone(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reset password</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {done ? (
            <VStack spacing={3} py={2}>
              <Text fontSize="3xl">🔑</Text>
              <Text fontWeight={600}>Password updated</Text>
              <Text color="ink.300" fontSize="sm" textAlign="center">
                {user?.email} can now sign in with the new password.
              </Text>
            </VStack>
          ) : (
            <VStack as="form" id="reset-form" onSubmit={handleSubmit(onSubmit)} spacing={4} align="stretch">
              <Text fontSize="sm" color="ink.300">
                Set a new password for <strong>{user?.email}</strong>.
              </Text>
              <FormControl isInvalid={!!errors.newPassword}>
                <FormLabel>New password</FormLabel>
                <PasswordInput
                  autoFocus
                  {...register("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })}
                />
                <FormErrorMessage>{errors.newPassword?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          {done ? (
            <Button onClick={close}>Done</Button>
          ) : (
            <HStack>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" form="reset-form" isLoading={isSubmitting}>
                Reset password
              </Button>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
