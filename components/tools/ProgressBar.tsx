"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
  progress: number;
  statusText?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  statusText = "Processing client-side in browser memory...",
}) => {
  return (
    <div className="p-6 rounded-3xl border border-border bg-bg-secondary/90 backdrop-blur-md space-y-3 shadow-card">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-text-primary font-semibold">
          <Loader2 className="w-4 h-4 text-accent-primary animate-spin" />
          <span>{statusText}</span>
        </div>
        <span className="font-mono text-accent-glow font-bold">{Math.round(progress)}%</span>
      </div>

      <div className="w-full h-2 rounded-full bg-bg-elevated overflow-hidden border border-border">
        <div
          className="h-full bg-gradient-to-r from-accent-primary to-accent-glow rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
