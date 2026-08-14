import React from "react";
import * as LucideIcons from "lucide-react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  // Convert kebab-case (e.g. "file-down") to PascalCase (e.g. "FileDown")
  const componentName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const LucideIcon = (LucideIcons as any)[componentName];

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon width={size} height={size} {...props} />;
}
