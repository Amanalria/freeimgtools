"use client";

import React from "react";
import { Zap, ShieldCheck, Cpu, Infinity as InfinityIcon } from "lucide-react";

export const Stats: React.FC = () => {
  const stats = [
    {
      icon: Zap,
      value: "100+",
      label: "Free Dedicated Tools",
      sub: "Image & PDF suites combined",
      color: "text-accent-glow",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Browser-Only Privacy",
      sub: "Zero files sent to cloud",
      color: "text-emerald-400",
    },
    {
      icon: Cpu,
      value: "0ms",
      label: "Server Queue Wait",
      sub: "Hardware-accelerated V8/Wasm",
      color: "text-indigo-400",
    },
    {
      icon: InfinityIcon,
      value: "Unlimited",
      label: "Free Usage Forever",
      sub: "No subscriptions or limits",
      color: "text-purple-400",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-border bg-bg-secondary/60 backdrop-blur-md flex flex-col items-center sm:items-start text-center sm:text-left space-y-2 hover:border-border-hover transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-text-primary mb-1">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${stat.color}`}>
                {stat.value}
              </p>
              <div>
                <p className="text-xs font-bold text-text-primary uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-[11px] text-text-muted mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
