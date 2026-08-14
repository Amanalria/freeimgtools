"use client";

import React, { useState, useEffect, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Play,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
} from "lucide-react";
import { getToolBySlug, getRelatedTools, ToolItem } from "@/data/tools";
import { processImageTool, ProcessedImageResult } from "@/lib/tools/image-engine";
import { processPdfTool, ProcessedPdfResult } from "@/lib/pdf/pdf-engine";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { ToolSettingsPanel } from "@/components/tools/ToolSettingsPanel";
import { ProgressBar } from "@/components/tools/ProgressBar";
import { ResultPreview } from "@/components/tools/ResultPreview";
import { ToolCard } from "@/components/tools/ToolCard";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { AdSlot } from "@/components/common/AdSlot";

export default function DynamicToolPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const tool = useMemo(() => getToolBySlug(slug), [slug]);
  const relatedTools = useMemo(() => getRelatedTools(slug, 3), [slug]);

  // Selected files & processing state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extraText, setExtraText] = useState<string>("");
  const [settingsValues, setSettingsValues] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | ProcessedPdfResult | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Initialize and load saved settings from localStorage
  useEffect(() => {
    if (!tool) return;

    const initialSettings: Record<string, any> = {};
    tool.settings.forEach((s) => {
      initialSettings[s.id] = s.defaultValue;
    });

    try {
      const saved = localStorage.getItem(`pixelforge_settings_${tool.slug}`);
      if (saved) {
        setSettingsValues({ ...initialSettings, ...JSON.parse(saved) });
      } else {
        setSettingsValues(initialSettings);
      }

      // Record in recent history
      const history = JSON.parse(localStorage.getItem("pixelforge_history") || "[]");
      const updated = [tool.slug, ...history.filter((s: string) => s !== tool.slug)].slice(0, 10);
      localStorage.setItem("pixelforge_history", JSON.stringify(updated));
    } catch (e) {
      setSettingsValues(initialSettings);
    }
  }, [tool]);

  if (!tool) {
    notFound();
  }

  const handleSettingChange = (id: string, val: any) => {
    const updated = { ...settingsValues, [id]: val };
    setSettingsValues(updated);
    try {
      localStorage.setItem(`pixelforge_settings_${tool.slug}`, JSON.stringify(updated));
    } catch (e) {
      // safe fallback
    }
  };

  const handleResetSettings = () => {
    const defaultSettings: Record<string, any> = {};
    tool.settings.forEach((s) => {
      defaultSettings[s.id] = s.defaultValue;
    });
    setSettingsValues(defaultSettings);
    try {
      localStorage.removeItem(`pixelforge_settings_${tool.slug}`);
    } catch (e) {
      // safe fallback
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setErrorMsg(null);
    setResult(null);
  };

  const handleRemoveFile = (index: number) => {
    const next = [...selectedFiles];
    next.splice(index, 1);
    setSelectedFiles(next);
    if (next.length === 0) setResult(null);
  };

  const handleRunProcessing = async () => {
    setErrorMsg(null);
    setIsProcessing(true);
    setProgress(15);

    try {
      // Simulated progress ticks
      const timer = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 100);

      let res: ProcessedImageResult | ProcessedPdfResult;

      if (tool.category === "image") {
        const primaryFile = selectedFiles.length > 0 ? selectedFiles[0] : null;
        res = await processImageTool(primaryFile, tool.slug, settingsValues, extraText);
      } else {
        res = await processPdfTool(selectedFiles, tool.slug, settingsValues, extraText);
      }

      clearInterval(timer);
      setProgress(100);
      setTimeout(() => {
        setResult(res);
        setIsProcessing(false);
      }, 250);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err?.message || "An unexpected error occurred while processing.");
    }
  };

  const isMultipleFilesAllowed =
    tool.slug.startsWith("bulk-") || tool.slug === "merge-pdf" || tool.slug === "jpg-to-pdf";

  const showTextInput =
    tool.slug === "qr-code-generator" ||
    tool.slug === "base64-to-image" ||
    tool.slug === "text-to-pdf";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono text-text-muted">
        <Link href="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={tool.category === "image" ? "/image" : "/pdf"}
          className="hover:text-text-primary transition-colors uppercase"
        >
          {tool.category} Tools
        </Link>
        <span>/</span>
        <span className="text-accent-glow">{tool.name}</span>
      </nav>

      {/* Tool Header */}
      <div className="space-y-4 max-w-3xl">
        <CategoryBadge category={tool.category} />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
          {tool.title || tool.name}
        </h1>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Top Banner AdSlot */}
      <AdSlot format="leaderboard" />

      {/* Main Interactive Workstation (Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Dropzone & Live Result */}
        <div className="lg:col-span-2 space-y-6">
          {!result && (
            <div className="p-6 sm:p-8 rounded-3xl border border-border bg-bg-secondary/70 backdrop-blur-xl space-y-6 shadow-card">
              <FileDropzone
                acceptedTypes={tool.acceptedFileTypes}
                maxSizeMB={tool.maxFileSizeMB}
                multiple={isMultipleFilesAllowed}
                onFilesSelected={handleFilesSelected}
                selectedFiles={selectedFiles}
                onRemoveFile={handleRemoveFile}
                showTextInput={showTextInput}
                extraTextValue={extraText}
                onExtraTextChange={setExtraText}
                customInputPlaceholder={
                  tool.slug === "qr-code-generator"
                    ? "Enter target URL (e.g. https://pixelforge.tools)"
                    : tool.slug === "base64-to-image"
                    ? "Paste raw Base64 string or data:image/... data URI here"
                    : "Type or paste your notes to generate PDF document..."
                }
              />

              {/* Action Button */}
              <button
                type="button"
                onClick={handleRunProcessing}
                disabled={isProcessing || (selectedFiles.length === 0 && !showTextInput)}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-accent-primary hover:bg-accent-glow disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm shadow-glow transition-all hover:scale-[1.01]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Process & Convert Now</span>
              </button>
            </div>
          )}

          {/* Progress Bar while working */}
          {isProcessing && <ProgressBar progress={progress} />}

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Output Preview */}
          {result && (
            <ResultPreview
              originalFile={selectedFiles[0]}
              resultUrl={result.url}
              resultBlob={result.blob}
              filename={result.filename}
              originalSize={result.originalSize}
              newSize={result.newSize}
              width={"width" in result ? result.width : undefined}
              height={"height" in result ? result.height : undefined}
              pageCount={"pageCount" in result ? result.pageCount : undefined}
              isPdf={tool.category === "pdf"}
              zipBlob={"zipBlob" in result ? result.zipBlob : undefined}
              onReset={() => {
                setResult(null);
                setSelectedFiles([]);
              }}
            />
          )}

          {/* AdSlot below result */}
          <AdSlot format="leaderboard" />
        </div>

        {/* Right 1 Col: Tool Settings Sidebar */}
        <div className="space-y-6">
          <ToolSettingsPanel
            settingsSchema={tool.settings}
            values={settingsValues}
            onChange={handleSettingChange}
            onReset={handleResetSettings}
          />
        </div>
      </div>

      {/* How it Works Section */}
      <section className="p-8 rounded-3xl border border-border bg-bg-secondary/50 space-y-6">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-glow" />
          <span>How {tool.name} Works (3 Simple Steps)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tool.howItWorks.map((step, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-bg-elevated/60 border border-border space-y-2">
              <span className="w-7 h-7 rounded-lg bg-accent-primary/20 text-accent-glow font-mono font-bold text-xs flex items-center justify-center border border-accent-primary/30">
                0{idx + 1}
              </span>
              <p className="text-xs text-text-muted leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tool FAQs (Accordion) */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="space-y-4 max-w-4xl">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent-glow" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-2">
            {tool.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-bg-secondary/70 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-sm font-semibold text-text-primary">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted transition-transform ${
                        isOpen ? "rotate-180 text-accent-glow" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-text-muted leading-relaxed border-t border-border/40 pt-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Tools Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent-glow" />
            <span>Related Tools You Might Need</span>
          </h2>
          <Link
            href="/tools"
            className="text-xs font-mono text-accent-glow hover:underline flex items-center gap-1"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedTools.map((rt) => (
            <ToolCard key={rt.slug} tool={rt} />
          ))}
        </div>
      </section>
    </div>
  );
}
