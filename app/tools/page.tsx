"use client";

import React, { useState, useMemo } from "react";
import { Search, Layers, Image as ImageIcon, FileText, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { TOOLS_DATA, ToolCategory } from "@/data/tools";
import { AdSlot } from "@/components/common/AdSlot";
import { cn } from "@/lib/utils";

export default function ToolsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | ToolCategory>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "new" | "alphabetical">("popular");

  // Get distinct subcategories
  const subCategories = useMemo(() => {
    const subs = new Set<string>();
    TOOLS_DATA.forEach((tool) => {
      if (selectedCategory === "all" || tool.category === selectedCategory) {
        subs.add(tool.subCategory);
      }
    });
    return Array.from(subs);
  }, [selectedCategory]);

  // Filter & sort tools
  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchesSearch =
        !searchQuery.trim() ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "all" || tool.category === selectedCategory;

      const matchesSub =
        selectedSubCategory === "all" || tool.subCategory === selectedSubCategory;

      return matchesSearch && matchesCat && matchesSub;
    }).sort((a, b) => {
      if (sortBy === "popular") {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return 0;
      }
      if (sortBy === "new") {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      }
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedSubCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Explore All Tools ({filteredTools.length})
        </h1>
        <p className="text-sm text-text-muted max-w-2xl">
          Browse through our comprehensive directory of 100% private in-browser image optimization and PDF manipulation tools.
        </p>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 sm:p-6 rounded-3xl border border-border bg-bg-secondary/70 backdrop-blur-xl space-y-4 shadow-card">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Instant Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, action (e.g. compress, merge, webp)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-elevated border border-border text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-bg-elevated border border-border overflow-x-auto">
            {[
              { id: "all", label: "All Tools", icon: Layers },
              { id: "image", label: "Image Tools", icon: ImageIcon },
              { id: "pdf", label: "PDF Tools", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id as any);
                    setSelectedSubCategory("all");
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
                    isSelected
                      ? "bg-accent-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-text-muted flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="new">Sort: Newly Added</option>
              <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Subcategory Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-border/40 pb-1">
          <button
            onClick={() => setSelectedSubCategory("all")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all",
              selectedSubCategory === "all"
                ? "bg-accent-primary/20 text-accent-glow border border-accent-primary/40"
                : "text-text-muted hover:text-text-primary bg-bg-elevated/60"
            )}
          >
            All Subcategories
          </button>
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubCategory(sub)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all",
                selectedSubCategory === sub
                  ? "bg-accent-primary/20 text-accent-glow border border-accent-primary/40"
                  : "text-text-muted hover:text-text-primary bg-bg-elevated/60"
              )}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Grid */}
      <ToolGrid tools={filteredTools} />

      {/* Bottom AdSlot */}
      <AdSlot format="leaderboard" />
    </div>
  );
}
