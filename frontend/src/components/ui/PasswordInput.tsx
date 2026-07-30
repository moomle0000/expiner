import { forwardRef, type ComponentProps } from "react";
import { Input, InputGroup, InputRightElement, IconButton } from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useState } from "react";

type Props = ComponentProps<typeof Input>;

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false);
  return (
    <InputGroup>
      <Input ref={ref} type={show ? "text" : "password"} {...props} />
      <InputRightElement>
        <IconButton
          aria-label={show ? "Hide password" : "Show password"}
          icon={show ? <ViewOffIcon /> : <ViewIcon />}
          variant="ghost"
          size="sm"
          onClick={() => setShow((s) => !s)}
        />
      </InputRightElement>
    </InputGroup>
  );
});
