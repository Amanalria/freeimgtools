"use client";

import React, { useCallback, useState, useEffect } from "react";
import { UploadCloud, File as FileIcon, X, AlertCircle, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { formatBytes, cn } from "@/lib/utils";

interface FileDropzoneProps {
  acceptedTypes: string[];
  maxSizeMB: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  customInputPlaceholder?: string;
  extraTextValue?: string;
  onExtraTextChange?: (text: string) => void;
  showTextInput?: boolean;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  acceptedTypes,
  maxSizeMB,
  multiple = false,
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  customInputPlaceholder = "Enter text or URL here...",
  extraTextValue = "",
  onExtraTextChange,
  showTextInput = false,
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files);
        validateAndAddFiles(pastedFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const validateAndAddFiles = (files: File[]) => {
    setErrorMessage(null);
    const valid: File[] = [];

    for (const f of files) {
      if (f.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`"${f.name}" exceeds max limit of ${maxSizeMB}MB.`);
        continue;
      }
      valid.push(f);
    }

    if (valid.length > 0) {
      onFilesSelected(multiple ? [...selectedFiles, ...valid] : [valid[0]]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Optional Raw Text / URL Input */}
      {showTextInput && (
        <div className="p-4 rounded-2xl border border-border bg-bg-secondary/80 space-y-2">
          <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
            Input Text / URL Payload
          </label>
          <textarea
            value={extraTextValue}
            onChange={(e) => onExtraTextChange && onExtraTextChange(e.target.value)}
            placeholder={customInputPlaceholder}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-text-primary text-sm font-mono focus:outline-none focus:border-accent-primary transition-all resize-y"
          />
        </div>
      )}

      {/* Main Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
          isDragOver
            ? "border-accent-primary bg-accent-primary/10 shadow-glow scale-[1.005]"
            : "border-border/80 bg-bg-secondary/50 hover:border-accent-primary/50 hover:bg-bg-secondary"
        )}
      >
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />

        <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center text-accent-glow mb-4 pointer-events-none">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h4 className="text-base sm:text-lg font-bold text-text-primary text-center">
          {multiple ? "Drop Multiple Files Here" : "Drag & Drop File Here"}
        </h4>
        <p className="text-xs sm:text-sm text-text-muted text-center mt-1">
          or <span className="text-accent-glow underline font-semibold">browse from device</span> / paste from clipboard
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[11px] font-mono text-text-muted/80">
          <span className="px-2 py-0.5 rounded bg-bg-elevated border border-border">
            Max: {maxSizeMB}MB
          </span>
          <span className="px-2 py-0.5 rounded bg-bg-elevated border border-border">
            100% In-Browser Privacy
          </span>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted px-1">
            <span>Selected Files ({selectedFiles.length})</span>
            <span>Total: {formatBytes(selectedFiles.reduce((acc, f) => acc + f.size, 0))}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border/80 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-glow flex-shrink-0">
                    <FileIcon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-text-primary truncate">{file.name}</p>
                    <p className="text-[10px] text-text-muted font-mono">{formatBytes(file.size)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(idx)}
                  className="p-1 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  aria-label="Remove File"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
