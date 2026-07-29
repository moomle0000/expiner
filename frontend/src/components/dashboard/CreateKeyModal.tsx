import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useApiKeys } from "@/hooks/useApiKeys";
import { extractErrorMessage } from "@/lib/api";
import type { ApiKeyCreated } from "@/types/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (k: ApiKeyCreated) => void;
}

interface FormValues {
  name: string;
}

export function CreateKeyModal({ isOpen, onClose, onCreated }: Props) {
  const { create } = useApiKeys("me");
  const toast = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const k = await create(values.name.trim());
      toast({ status: "success", title: "Key minted", position: "top-right" });
      reset();
      onCreated?.(k);
    } catch (err) {
      toast({ status: "error", title: "Failed to mint key", description: extractErrorMessage(err), position: "top-right" });
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Mint API key</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack as="form" id="key-form" onSubmit={handleSubmit(onSubmit)} spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Key name</FormLabel>
              <Input
                autoFocus
                placeholder="e.g. my-server"
                {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 chars" } })}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="key-form" isLoading={isSubmitting}>
              Mint key
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
