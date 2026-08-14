"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Search } from "lucide-react";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { TOOLS_DATA } from "@/data/tools";
import { AdSlot } from "@/components/common/AdSlot";

export default function ImageToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const imageTools = TOOLS_DATA.filter((t) => t.category === "image");

  const filtered = imageTools.filter((t) =>
    !searchQuery.trim() ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Category Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
          <ImageIcon className="w-4 h-4" />
          <span>Image Tools Suite</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
          High-Performance Image Tools
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-2xl">
          Compress, resize, convert, watermark, and manipulate images with 100% browser-native precision. No cloud uploads, no quality loss.
        </p>

        {/* Search */}
        <div className="max-w-md pt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search image tools..."
            className="w-full px-4 py-3 rounded-2xl bg-bg-secondary border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      <ToolGrid tools={filtered} emptyMessage="No image tools matched your search." />
      <AdSlot format="leaderboard" />
    </div>
  );
}
