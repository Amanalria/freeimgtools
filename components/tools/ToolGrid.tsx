"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolCard } from "./ToolCard";
import { ToolItem } from "@/data/tools";

interface ToolGridProps {
  tools: ToolItem[];
  emptyMessage?: string;
}

export const ToolGrid: React.FC<ToolGridProps> = ({
  tools,
  emptyMessage = "No tools found matching your criteria.",
}) => {
  if (!tools || tools.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-bg-secondary/40">
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {tools.map((tool) => (
          <motion.div
            key={tool.slug}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ToolCard tool={tool} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
