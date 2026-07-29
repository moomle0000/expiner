import { Box, Icon, type IconProps } from "@chakra-ui/react";
import type { FileCategory } from "@/types/api";
import {
  FiFileText,
  FiImage,
  FiMusic,
  FiVideo,
  FiPackage,
  FiCpu,
  FiFile,
} from "react-icons/fi";

const META: Record<FileCategory | "unknown", { icon: any; color: string }> = {
  image: { icon: FiImage, color: "accent.cyan" },
  document: { icon: FiFileText, color: "accent.lime" },
  video: { icon: FiVideo, color: "accent.magenta" },
  audio: { icon: FiMusic, color: "accent.amber" },
  archive: { icon: FiPackage, color: "brand.300" },
  executable: { icon: FiCpu, color: "accent.magenta" },
  other: { icon: FiFile, color: "ink.300" },
  unknown: { icon: FiFile, color: "ink.300" },
};

export function fileCategoryOf(mimeOrType?: string): FileCategory | "unknown" {
  if (!mimeOrType) return "unknown";
  if (mimeOrType.startsWith("image")) return "image";
  if (mimeOrType.startsWith("video")) return "video";
  if (mimeOrType.startsWith("audio")) return "audio";
  if (/(pdf|msword|officedocument|text|json|xml|csv)/.test(mimeOrType)) return "document";
  if (/(zip|rar|tar|gz|7z|archive)/.test(mimeOrType)) return "archive";
  if (/(x-msdownload|x-msdos-program|executable|exe)/.test(mimeOrType)) return "executable";
  return "other";
}

export function FileIcon({ mime, ...rest }: { mime?: string } & IconProps) {
  const cat = fileCategoryOf(mime);
  const { icon, color } = META[cat];
  return (
    <Box color={color} display="inline-flex" alignItems="center" justifyContent="center">
      <Icon as={icon} {...rest} />
    </Box>
  );
}
