import { IconButton, useToast, Tooltip } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";

export interface CopyButtonProps {
  value: string;
  label?: string;
  size?: "xs" | "sm" | "md";
  variant?: "ghost" | "outline" | "solid";
}

export function CopyButton({ value, label = "Copy", size = "xs", variant = "ghost" }: CopyButtonProps) {
  const toast = useToast();
  return (
    <Tooltip label={label} hasArrow>
      <IconButton
        aria-label={label}
        icon={<CopyIcon />}
        size={size}
        variant={variant}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            toast({ status: "success", title: "Copied", duration: 1500, position: "top-right" });
          } catch {
            toast({ status: "error", title: "Copy failed", position: "top-right" });
          }
        }}
      />
    </Tooltip>
  );
}
