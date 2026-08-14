"use client";

import React, { useState } from "react";
import { Download, Check, Copy, ExternalLink, Sparkles, FileArchive, RefreshCw, Eye } from "lucide-react";
import { formatBytes, cn } from "@/lib/utils";

interface ResultPreviewProps {
  originalFile?: File | null;
  resultUrl: string;
  resultBlob: Blob;
  filename: string;
  originalSize?: number;
  newSize: number;
  width?: number;
  height?: number;
  pageCount?: number;
  isPdf?: boolean;
  zipBlob?: Blob;
  onReset: () => void;
  className?: string;
}

export const ResultPreview: React.FC<ResultPreviewProps> = ({
  originalFile,
  resultUrl,
  resultBlob,
  filename,
  originalSize,
  newSize,
  width,
  height,
  pageCount,
  isPdf = false,
  zipBlob,
  onReset,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"result" | "original">("result");

  const originalUrl = originalFile ? URL.createObjectURL(originalFile) : null;
  const savingsPct =
    originalSize && originalSize > newSize
      ? Math.round(((originalSize - newSize) / originalSize) * 100)
      : null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleZipDownload = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pixelforge_bundle.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyBase64 = async () => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          navigator.clipboard.writeText(reader.result.toString());
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      };
      reader.readAsDataURL(resultBlob);
    } catch (e) {
      // safe fallback
    }
  };

  return (
    <div
      className={cn(
        "p-6 sm:p-8 rounded-3xl border border-border bg-bg-secondary/90 backdrop-blur-2xl space-y-6 shadow-card",
        className
      )}
    >
      {/* Header with status and savings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-lg font-bold text-text-primary">Processing Complete!</h3>
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">{filename}</p>
        </div>

        {savingsPct && savingsPct > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Reduced by {savingsPct}%</span>
          </div>
        ) : null}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {originalSize ? (
          <div className="p-3 rounded-2xl bg-bg-elevated/70 border border-border">
            <p className="text-[10px] uppercase font-bold text-text-muted">Original Size</p>
            <p className="text-sm font-bold font-mono text-text-primary mt-0.5">
              {formatBytes(originalSize)}
            </p>
          </div>
        ) : null}

        <div className="p-3 rounded-2xl bg-bg-elevated/70 border border-border">
          <p className="text-[10px] uppercase font-bold text-text-muted">Output Size</p>
          <p className="text-sm font-bold font-mono text-accent-glow mt-0.5">
            {formatBytes(newSize)}
          </p>
        </div>

        {width && height ? (
          <div className="p-3 rounded-2xl bg-bg-elevated/70 border border-border">
            <p className="text-[10px] uppercase font-bold text-text-muted">Dimensions</p>
            <p className="text-sm font-bold font-mono text-text-primary mt-0.5">
              {width} × {height}
            </p>
          </div>
        ) : null}

        {pageCount ? (
          <div className="p-3 rounded-2xl bg-bg-elevated/70 border border-border">
            <p className="text-[10px] uppercase font-bold text-text-muted">Pages</p>
            <p className="text-sm font-bold font-mono text-accent-secondary mt-0.5">
              {pageCount} {pageCount === 1 ? "Page" : "Pages"}
            </p>
          </div>
        ) : null}
      </div>

      {/* Preview Area */}
      <div className="rounded-2xl border border-border bg-bg-primary/90 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[250px] max-h-[480px]">
        {isPdf ? (
          <div className="w-full h-[360px] flex flex-col items-center justify-center space-y-4 text-center">
            <iframe
              src={resultUrl}
              className="w-full h-full rounded-xl border border-border"
              title="PDF Preview"
            />
          </div>
        ) : (
          <div className="relative max-h-[380px] flex items-center justify-center overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeTab === "result" ? resultUrl : originalUrl || resultUrl}
              alt="Processed Result"
              className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-accent-primary hover:bg-accent-glow text-white font-bold text-sm shadow-glow hover:shadow-indigo-500/40 transition-all hover:scale-[1.01]"
        >
          <Download className="w-4 h-4" />
          <span>Download File ({formatBytes(newSize)})</span>
        </button>

        {zipBlob && (
          <button
            type="button"
            onClick={handleZipDownload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-bg-elevated hover:bg-bg-secondary text-accent-secondary border border-emerald-500/30 font-semibold text-xs transition-all"
          >
            <FileArchive className="w-4 h-4" />
            <span>Download All in ZIP</span>
          </button>
        )}

        {!isPdf && (
          <button
            type="button"
            onClick={handleCopyBase64}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-bg-elevated hover:bg-bg-secondary text-text-muted hover:text-text-primary border border-border text-xs font-mono transition-all"
            title="Copy as Base64 Data URI"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Base64"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-bg-elevated hover:bg-bg-secondary text-text-muted hover:text-text-primary border border-border text-xs transition-all"
          title="Process Another File"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New File</span>
        </button>
      </div>
    </div>
  );
};
