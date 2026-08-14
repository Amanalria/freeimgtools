"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  slotId?: string;
  format?: "leaderboard" | "rectangle" | "sidebar" | "responsive";
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = "default-slot",
  format = "leaderboard",
  className,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && adsenseId && typeof window !== "undefined") {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Safe fail
      }
    }
  }, [isVisible, adsenseId]);

  const dimensions = {
    leaderboard: "w-full max-w-[728px] h-[90px]",
    rectangle: "w-[300px] h-[250px]",
    sidebar: "w-[300px] h-[600px]",
    responsive: "w-full min-h-[90px]",
  }[format];

  return (
    <div
      ref={adRef}
      className={cn(
        "my-6 mx-auto flex flex-col items-center justify-center rounded-xl border border-border/60 bg-bg-secondary/40 text-center overflow-hidden transition-all",
        dimensions,
        className
      )}
    >
      {isVisible ? (
        adsenseId ? (
          <ins
            className="adsbygoogle block"
            style={{ display: "block" }}
            data-ad-client={adsenseId}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-text-muted/60 text-xs select-none">
            <span className="font-mono text-[10px] tracking-widest uppercase border border-border px-2 py-0.5 rounded bg-bg-elevated/80 mb-1">
              Sponsored Advertisement
            </span>
            <span>Non-Intrusive & Fast • PixelForge Ad Placeholder</span>
          </div>
        )
      ) : null}
    </div>
  );
};
