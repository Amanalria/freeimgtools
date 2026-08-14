import React from "react";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: "image" | "pdf" | string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className,
}) => {
  const isImage = category === "image";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono uppercase tracking-wider transition-all",
        isImage
          ? "bg-white text-blue-600 border border-blue-200 shadow-sm dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
          : "bg-white text-emerald-600 border border-emerald-200 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full animate-pulse",
          isImage ? "bg-blue-500 dark:bg-blue-400" : "bg-emerald-500 dark:bg-emerald-400"
        )}
      />
      {category}
    </span>
  );
};
