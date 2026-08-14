import React from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Lock, Sparkles, ArrowRight, Zap, Globe } from "lucide-react";
import { AdSlot } from "@/components/common/AdSlot";

export const metadata = {
  title: "About PixelForge — 100% In-Browser Privacy & Speed",
  description: "Learn how PixelForge uses client-side WebAssembly, Canvas API, and zero-trust architecture to keep your documents and images completely private.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-glow border border-accent-primary/30 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Server Upload Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
          Privacy-First Image & PDF Engineering
        </h1>
        <p className="text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
          PixelForge was built to solve a critical issue with modern online converters: your confidential files should never be uploaded to unknown third-party servers.
        </p>
      </div>

      <AdSlot format="leaderboard" />

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-border bg-bg-secondary/70 backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary">100% Client-Side</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            All computation (compression, merging, resizing, watermark) executes inside your browser memory using hardware acceleration.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-border bg-bg-secondary/70 backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Zero Cloud Retention</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Since nothing is uploaded, there are zero server databases, zero logs, and zero risks of data exposure or data breaches.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-border bg-bg-secondary/70 backdrop-blur-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-text-primary">Zero Wait Queues</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            No uploading gigabytes over slow broadband. Processing starts instantly without waiting in server queues.
          </p>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="p-8 rounded-3xl border border-border bg-bg-secondary/80 space-y-6">
        <h2 className="text-2xl font-bold text-text-primary">Our Open Technology Stack</h2>
        <div className="space-y-4 text-xs text-text-muted leading-relaxed">
          <p>
            PixelForge utilizes cutting-edge web platform capabilities including:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong className="text-text-primary">HTML5 2D Canvas & WebGL:</strong> Real-time hardware-accelerated image manipulation and filtering.</li>
            <li><strong className="text-text-primary">pdf-lib (WebAssembly):</strong> Client-side PDF page composition, byte manipulation, and cryptographic protection.</li>
            <li><strong className="text-text-primary">JSZip:</strong> Multithreaded client-side archive packaging for instant bulk downloads.</li>
            <li><strong className="text-text-primary">Next.js 14 & Tailwind CSS:</strong> High-efficiency server-rendered shell with instant client hydration.</li>
          </ul>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center space-y-4 pt-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 py-4 px-8 rounded-2xl bg-accent-primary hover:bg-accent-glow text-white font-bold text-sm shadow-glow transition-all hover:scale-105"
        >
          <span>Explore All 100+ Free Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
