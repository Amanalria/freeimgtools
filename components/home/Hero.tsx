"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ShieldCheck, ArrowRight, Zap, Image as ImageIcon, FileText } from "lucide-react";
import { TOOLS_DATA } from "@/data/tools";

export const Hero: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const words = ["Image Tools", "PDF Tools", "Design Tools", "Converter Suite"];

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Word cycler
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  // Particle Grid Background (Canvas, lightweight)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight * 0.75);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight * 0.75;
    };

    window.addEventListener("resize", handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const count = Math.min(50, Math.floor(width / 30));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p1.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Filtered tools for instant autocomplete
  const filteredTools = searchQuery.trim()
    ? TOOLS_DATA.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags?.some((tag: any) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <section className="relative min-h-[620px] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
      {/* Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
      />

      {/* Radial Gradient Glow Accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent-primary/15 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Privacy Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-glow text-xs font-semibold tracking-wide shadow-glow">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% In-Browser Execution • Zero Server Uploads</span>
        </div>

        {/* Dynamic Rotating Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary">
          All-in-One{" "}
          <span className="relative inline-block min-w-[280px] text-left sm:text-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWordIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-accent-glow via-indigo-400 to-emerald-400 bg-clip-text text-transparent"
              >
                {words[currentWordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          Compress, convert, resize, crop, and manipulate images & PDF documents at lightning speed directly inside your browser. No registration, no queues, no watermark.
        </p>

        {/* Instant Search Bar */}
        <div className="relative max-w-xl mx-auto w-full pt-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-accent-primary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ tools (e.g. compress image, merge pdf, webp)..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-bg-secondary/90 backdrop-blur-xl border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 shadow-card transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {filteredTools.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-bg-secondary/95 backdrop-blur-2xl border border-border shadow-2xl z-50 text-left space-y-1">
              {filteredTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-bg-elevated text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent-primary" />
                    <div>
                      <p className="font-bold text-text-primary">{tool.name}</p>
                      <p className="text-[11px] text-text-muted truncate max-w-md">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Category Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono">
          <Link
            href="/image"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary hover:bg-bg-elevated text-indigo-400 border border-indigo-500/30 transition-all hover:scale-105"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Image Tools (53+)</span>
          </Link>
          <Link
            href="/pdf"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary hover:bg-bg-elevated text-emerald-400 border border-emerald-500/30 transition-all hover:scale-105"
          >
            <FileText className="w-4 h-4" />
            <span>PDF Tools (53+)</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
