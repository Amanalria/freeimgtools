import React from "react";
import Link from "next/link";
import { Image as ImageIcon, FileText, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";
import { ToolItem } from "@/data/tools";

interface CategorySectionProps {
  imageTools: ToolItem[];
  pdfTools: ToolItem[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({ imageTools, pdfTools }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-12">
      {/* Image Suite Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-3">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>53+ Image Processing Tools</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Ultimate Image Editing & Conversion Suite
            </h2>
            <p className="text-sm text-text-muted mt-1 max-w-xl">
              Compress, upscale, resize, watermark, crop, and convert image formats with pixel precision.
            </p>
          </div>

          <Link
            href="/image"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View all 53+ Image Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {imageTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* PDF Suite Section */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>53+ PDF Manipulation Tools</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Enterprise-Grade PDF Document Studio
            </h2>
            <p className="text-sm text-text-muted mt-1 max-w-xl">
              Merge, split, compress, protect, rotate, paginate, and watermark PDFs without cloud exposure.
            </p>
          </div>

          <Link
            href="/pdf"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View all 53+ PDF Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pdfTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
};
