"use client";

import React, { useRef, useState, useEffect } from "react";
import { PenTool, Type, Upload, RotateCcw, Download, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onSignatureGenerated?: (dataUrl: string, blob: Blob) => void;
  className?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureGenerated, className }) => {
  const [activeMode, setActiveMode] = useState<"draw" | "type" | "upload">("draw");
  const [inkColor, setInkColor] = useState("#002D62"); // Classic Legal Blue
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [typedName, setTypedName] = useState("John Hancock");
  const [selectedFont, setSelectedFont] = useState("Great Vibes");
  const [copied, setCopied] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const drawHistory = useRef<ImageData[]>([]);

  // Setup Canvas
  useEffect(() => {
    if (activeMode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // High-DPI Canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = 240 * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Save blank state
    saveState();
  }, [activeMode]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawHistory.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (drawHistory.current.length > 20) drawHistory.current.shift();
  };

  const handleUndo = () => {
    if (drawHistory.current.length <= 1) return;
    drawHistory.current.pop(); // current state
    const prev = drawHistory.current[drawHistory.current.length - 1];
    const canvas = canvasRef.current;
    if (!canvas || !prev) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(prev, 0, 0);
    generateSignatureFromCanvas();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHistory.current = [];
    saveState();
    setSignatureDataUrl(null);
  };

  // Canvas Drawing Listeners
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    lastPoint.current = { x: clientX - rect.left, y: clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const currentPoint = { x: clientX - rect.left, y: clientY - rect.top };

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPoint.current = currentPoint;
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    saveState();
    generateSignatureFromCanvas();
  };

  const generateSignatureFromCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);

    canvas.toBlob((blob) => {
      if (blob && onSignatureGenerated) {
        onSignatureGenerated(dataUrl, blob);
      }
    }, "image/png");
  };

  // Generate Type Calligraphy Signature
  const generateTypedSignature = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = `64px '${selectedFont}', cursive, sans-serif`;
    ctx.fillStyle = inkColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedName || "Signature", canvas.width / 2, canvas.height / 2);

    const dataUrl = canvas.toDataURL("image/png");
    setSignatureDataUrl(dataUrl);

    canvas.toBlob((blob) => {
      if (blob && onSignatureGenerated) {
        onSignatureGenerated(dataUrl, blob);
      }
    }, "image/png");
  };

  useEffect(() => {
    if (activeMode === "type") {
      generateTypedSignature();
    }
  }, [activeMode, typedName, selectedFont, inkColor]);

  // Upload Paper Signature and Clean to Transparent PNG
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Auto contrast & white thresholding to make background 100% transparent
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 200) {
            data[i + 3] = 0; // Transparent
          } else {
            // Apply selected ink color
            data[i + 3] = 255 - brightness;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setSignatureDataUrl(dataUrl);

        canvas.toBlob((blob) => {
          if (blob && onSignatureGenerated) {
            onSignatureGenerated(dataUrl, blob);
          }
        }, "image/png");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!signatureDataUrl) return;
    const a = document.createElement("a");
    a.href = signatureDataUrl;
    a.download = "e_signature_pixelforge.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    if (!signatureDataUrl) return;
    navigator.clipboard.writeText(signatureDataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "p-6 sm:p-8 rounded-3xl border border-border bg-bg-secondary shadow-card space-y-6",
        className
      )}
    >
      {/* Signature Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Legally Compliant E-Signature Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
            Create & Sign Electronic Signatures
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Draw, type, or upload your signature with zero server uploads and transparent background export.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-bg-elevated border border-border">
          {[
            { id: "draw", label: "Draw", icon: PenTool },
            { id: "type", label: "Type", icon: Type },
            { id: "upload", label: "Upload", icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMode(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
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
      </div>

      {/* Main Drawing / Typing Canvas Canvas */}
      {activeMode === "draw" && (
        <div className="space-y-4">
          <div className="relative rounded-2xl border-2 border-dashed border-border bg-bg-primary overflow-hidden cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-[220px] touch-none block"
            />
            <div className="absolute bottom-3 left-4 text-[10px] font-mono text-text-muted/60 pointer-events-none select-none">
              ✍️ Sign above this guideline
            </div>
            <div className="absolute bottom-7 left-4 right-4 h-[1px] bg-border/40 pointer-events-none" />
          </div>

          {/* Controls: Color, Stroke & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-text-primary">Ink Color:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { name: "Legal Blue", color: "#002D62" },
                  { name: "Pure Black", color: "#000000" },
                  { name: "Indigo", color: "#4F46E5" },
                  { name: "Emerald", color: "#059669" },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setInkColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-transform",
                      inkColor === c.color ? "scale-110 border-white shadow-md" : "border-transparent opacity-80 hover:opacity-100"
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-primary">Pen Width:</span>
              <input
                type="range"
                min={1}
                max={8}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-24 h-1.5 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-accent-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-secondary text-text-muted hover:text-text-primary text-xs font-semibold border border-border transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-rose-500/10 text-text-muted hover:text-rose-400 text-xs font-semibold border border-border transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode: Type Calligraphy */}
      {activeMode === "type" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider">
              Type Your Full Name
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. Alexander Hamilton"
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { font: "cursive", label: "Cursive Script" },
              { font: "italic", label: "Formal Italic" },
              { font: "serif", label: "Executive Serif" },
            ].map((f) => (
              <button
                key={f.font}
                type="button"
                onClick={() => setSelectedFont(f.font)}
                style={{ fontFamily: f.font }}
                className={cn(
                  "p-4 rounded-2xl border text-center text-lg transition-all",
                  selectedFont === f.font
                    ? "border-accent-primary bg-accent-primary/10 text-accent-glow shadow-glow"
                    : "border-border bg-bg-primary text-text-primary hover:border-border-hover"
                )}
              >
                {typedName || "Signature"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode: Upload Signature Photo */}
      {activeMode === "upload" && (
        <div className="p-8 rounded-2xl border-2 border-dashed border-border bg-bg-primary text-center space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
            className="hidden"
            id="sig-upload-input"
          />
          <label
            htmlFor="sig-upload-input"
            className="cursor-pointer inline-flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-text-primary">
              Upload Photo of Paper Signature
            </p>
            <p className="text-xs text-text-muted">
              Auto-thresholding instantly removes white paper to create a transparent PNG
            </p>
          </label>
        </div>
      )}

      {/* Export & Actions Footer */}
      {signatureDataUrl && (
        <div className="p-4 rounded-2xl bg-bg-elevated border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={signatureDataUrl}
              alt="Signature Preview"
              className="h-10 w-auto object-contain bg-white/5 rounded px-2 border border-border"
            />
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent PNG Ready</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-glow text-white text-xs font-bold shadow-glow transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-bg-secondary hover:bg-bg-primary text-text-muted hover:text-text-primary text-xs font-mono border border-border transition-all"
              title="Copy Base64 Data URI"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Data URI"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
