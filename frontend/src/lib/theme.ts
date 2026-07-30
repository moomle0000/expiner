import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `"Space Grotesk", "Inter", system-ui, -apple-system, sans-serif`,
    body: `"Inter", system-ui, -apple-system, sans-serif`,
    mono: `"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace`,
  },
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#bae3ff",
      200: "#7cc4fa",
      300: "#47a3f3",
      400: "#2186eb",
      500: "#0967d2",
      600: "#0552b5",
      700: "#03449e",
      800: "#01337d",
      900: "#002159",
    },
    ink: {
      50: "#f5f7fb",
      100: "#e4e8f0",
      200: "#c8cfdb",
      300: "#9aa5b8",
      400: "#6b7691",
      500: "#475067",
      600: "#2f3645",
      700: "#1c2230",
      800: "#11151f",
      900: "#080a12",
    },
    accent: {
      lime: "#c4f542",
      magenta: "#ff3ea5",
      cyan: "#3ee9ff",
      amber: "#ffb547",
    },
  },
  styles: {
    global: {
      "html, body, #__next": {
        height: "100%",
        background: "ink.900",
        color: "ink.100",
      },
      body: {
        fontFeatureSettings: '"ss01", "cv11"',
      },
      "*::selection": {
        background: "accent.lime",
        color: "ink.900",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: "lg",
        letterSpacing: "0.01em",
      },
      variants: {
        solid: {
          bg: "accent.lime",
          color: "ink.900",
          _hover: { bg: "#d4ff5a", _disabled: { bg: "accent.lime" } },
          _active: { bg: "#b6e636" },
        },
        ghost: {
          color: "ink.200",
          _hover: { bg: "whiteAlpha.100" },
        },
        outline: {
          borderColor: "whiteAlpha.200",
          color: "ink.100",
          _hover: { bg: "whiteAlpha.50", borderColor: "whiteAlpha.400" },
        },
        danger: {
          bg: "accent.magenta",
          color: "white",
          _hover: { bg: "#ff5cb6" },
        },
      },
      defaultProps: { variant: "solid" },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "ink.800",
            borderColor: "whiteAlpha.200",
            color: "ink.50",
            _hover: { borderColor: "whiteAlpha.400" },
            _focusVisible: {
              borderColor: "accent.lime",
              boxShadow: "0 0 0 1px var(--chakra-colors-accent-lime)",
            },
            _placeholder: { color: "ink.400" },
          },
        },
      },
      defaultProps: { variant: "outline" },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "ink.800",
          borderColor: "whiteAlpha.200",
          color: "ink.50",
          _hover: { borderColor: "whiteAlpha.400" },
          _focusVisible: {
            borderColor: "accent.lime",
            boxShadow: "0 0 0 1px var(--chakra-colors-accent-lime)",
          },
          _placeholder: { color: "ink.400" },
        },
      },
      defaultProps: { variant: "outline" },
    },
    Select: {
      variants: {
        outline: {
          field: {
            bg: "ink.800",
            borderColor: "whiteAlpha.200",
            color: "ink.50",
            _hover: { borderColor: "whiteAlpha.400" },
            _focusVisible: {
              borderColor: "accent.lime",
              boxShadow: "0 0 0 1px var(--chakra-colors-accent-lime)",
            },
          },
          icon: { color: "ink.300" },
        },
      },
      defaultProps: { variant: "outline" },
    },
    Modal: {
      baseStyle: {
        dialog: { bg: "ink.800", color: "ink.100" },
        overlay: { backdropFilter: "blur(6px)" },
        header: { borderBottomWidth: "1px", borderColor: "whiteAlpha.100" },
        footer: { borderTopWidth: "1px", borderColor: "whiteAlpha.100" },
      },
    },
    Menu: {
      baseStyle: {
        list: { bg: "ink.800", borderColor: "whiteAlpha.200" },
        item: { bg: "ink.800", _hover: { bg: "whiteAlpha.100" }, _focus: { bg: "whiteAlpha.100" } },
      },
    },
    Table: {
      variants: {
        simple: {
          th: { color: "ink.300", borderColor: "whiteAlpha.100", textTransform: "uppercase", fontSize: "xs", letterSpacing: "0.08em" },
          td: { borderColor: "whiteAlpha.50", color: "ink.100" },
        },
      },
    },
    Badge: {
      baseStyle: { textTransform: "none", fontWeight: 600, borderRadius: "md" },
    },
    Tooltip: {
      baseStyle: { bg: "ink.700", color: "ink.50", borderRadius: "md", fontSize: "xs" },
    },
  },
});

export default theme;
