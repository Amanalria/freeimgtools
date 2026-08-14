"use client";

import React from "react";
import Link from "next/link";
import {
  FileDown,
  Layers,
  ShieldCheck,
  Zap,
  Sparkles,
  Repeat,
  Image as ImageIcon,
  Code,
  FileCode,
  Maximize2,
  Scaling,
  FolderArchive,
  Crop,
  Grid,
  Tv,
  Sun,
  Palette,
  EyeOff,
  Moon,
  Sliders,
  RotateCw,
  Stamp,
  Square,
  Box,
  Smile,
  Pipette,
  QrCode,
  Globe,
  Share2,
  Combine,
  Split,
  FileCheck,
  Trash2,
  Hash,
  Lock,
  FileSpreadsheet,
  FileText,
  Minimize,
  ArrowRight,
} from "lucide-react";
import { ToolItem } from "@/data/tools";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  FileDown,
  Layers,
  ShieldCheck,
  Zap,
  Sparkles,
  Repeat,
  Image: ImageIcon,
  Code,
  FileCode,
  Maximize2,
  Scaling,
  FolderArchive,
  Crop,
  Grid,
  Tv,
  Sun,
  Palette,
  EyeOff,
  Moon,
  Sliders,
  RotateCw,
  Stamp,
  Square,
  Box,
  Smile,
  Pipette,
  QrCode,
  Globe,
  Share2,
  Combine,
  Split,
  FileCheck,
  Trash2,
  Hash,
  Lock,
  FileSpreadsheet,
  FileText,
  Minimize,
};

interface ToolCardProps {
  tool: ToolItem;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, className }) => {
  const IconComponent = iconMap[tool.icon] || Sparkles;
  const isImage = tool.category === "image";

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group relative flex flex-col justify-between p-6 rounded-2xl border border-border bg-bg-secondary/70 backdrop-blur-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-border-hover hover:shadow-card",
        className
      )}
    >
      {/* Signature Animated Gradient Mesh Backdrop */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
          isImage
            ? "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent"
            : "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent"
        )}
      />

      {/* Top row: Icon & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110",
              isImage
                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500/50 group-hover:shadow-glow"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/50 group-hover:shadow-glow-emerald"
            )}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.isPopular && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent-primary/20 text-accent-glow border border-accent-primary/30">
                Popular
              </span>
            )}
            {tool.isNew && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                New
              </span>
            )}
          </div>
        </div>

        {/* Title and description */}
        <h3 className="text-base font-bold text-text-primary tracking-tight group-hover:text-white transition-colors">
          {tool.name}
        </h3>
        <p className="mt-2 text-xs text-text-muted leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Bottom Footer / Action indicator */}
      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-mono">
        <span
          className={cn(
            "text-[11px] uppercase tracking-wider font-semibold",
            isImage ? "text-indigo-400/80" : "text-emerald-400/80"
          )}
        >
          {tool.subCategory}
        </span>

        <span className="flex items-center gap-1 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all">
          <span>Open</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};
