import { useToast } from "@chakra-ui/react";
import { extractErrorMessage } from "@/lib/api";

export function useToastError() {
  const toast = useToast();
  return (err: unknown, title = "Error") => {
    toast({
      title,
      description: extractErrorMessage(err),
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
  };
}
