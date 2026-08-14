"use client";

import React from "react";
import { Sliders, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { SettingField } from "@/data/tools";
import { cn } from "@/lib/utils";

interface ToolSettingsPanelProps {
  settingsSchema: SettingField[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  onReset: () => void;
  className?: string;
}

export const ToolSettingsPanel: React.FC<ToolSettingsPanelProps> = ({
  settingsSchema,
  values,
  onChange,
  onReset,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl border border-border bg-bg-secondary/90 backdrop-blur-xl space-y-6 shadow-card",
        className
      )}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent-primary" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Tool Settings
          </h3>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors font-mono"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Dynamic Fields */}
      <div className="space-y-5">
        {settingsSchema.map((field) => {
          const val = values[field.id] !== undefined ? values[field.id] : field.defaultValue;

          if (field.type === "slider") {
            return (
              <div key={field.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-text-primary">{field.label}</label>
                  <span className="font-mono text-accent-glow font-bold">
                    {val}
                    {field.unit || ""}
                  </span>
                </div>
                <input
                  type="range"
                  min={field.min ?? 0}
                  max={field.max ?? 100}
                  step={field.step ?? 1}
                  value={val}
                  onChange={(e) => onChange(field.id, Number(e.target.value))}
                  className="w-full h-1.5 bg-bg-elevated rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                {field.description && (
                  <p className="text-[11px] text-text-muted">{field.description}</p>
                )}
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-xs font-semibold text-text-primary">{field.label}</label>
                <select
                  value={val}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  {field.options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value} className="bg-bg-secondary text-text-primary">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {field.description && (
                  <p className="text-[11px] text-text-muted">{field.description}</p>
                )}
              </div>
            );
          }

          if (field.type === "switch") {
            return (
              <div key={field.id} className="flex items-center justify-between py-1">
                <div>
                  <label className="text-xs font-semibold text-text-primary block cursor-pointer">
                    {field.label}
                  </label>
                  {field.description && (
                    <p className="text-[11px] text-text-muted mt-0.5">{field.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onChange(field.id, !val)}
                  className={cn(
                    "w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out",
                    val ? "bg-accent-primary justify-end" : "bg-bg-elevated border border-border justify-start"
                  )}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            );
          }

          if (field.type === "number") {
            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-xs font-semibold text-text-primary">{field.label}</label>
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={val}
                  onChange={(e) => onChange(field.id, Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary"
                />
                {field.description && (
                  <p className="text-[11px] text-text-muted">{field.description}</p>
                )}
              </div>
            );
          }

          if (field.type === "text") {
            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-xs font-semibold text-text-primary">{field.label}</label>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => onChange(field.id, e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-bg-elevated border border-border text-xs text-text-primary focus:outline-none focus:border-accent-primary"
                />
                {field.description && (
                  <p className="text-[11px] text-text-muted">{field.description}</p>
                )}
              </div>
            );
          }

          if (field.type === "color") {
            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-xs font-semibold text-text-primary">{field.label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={val}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer p-0"
                  />
                  <span className="font-mono text-xs text-text-primary uppercase bg-bg-elevated px-3 py-2 rounded-xl border border-border flex-1">
                    {val}
                  </span>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Client-Side Processing Badge */}
      <div className="pt-4 border-t border-border/80 flex items-center justify-between text-[11px] text-text-muted">
        <span className="flex items-center gap-1 text-accent-secondary">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Browser RAM Execution</span>
        </span>
        <span className="font-mono text-[10px] bg-bg-elevated px-2 py-0.5 rounded border border-border">
          V8 Engine
        </span>
      </div>
    </div>
  );
};
