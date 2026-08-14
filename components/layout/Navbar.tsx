"use client";

import React
import { Icon } from "@/components/common/Icon";, { useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
  currentCat?: string;
  onCatChange?: (cat: string) => void;
  onSearch?: (q: string) => void;
}

export function Navbar({ currentCat = "all", onCatChange, onSearch }: NavbarProps) {
  useEffect(() => {
    // Check local storage for theme
    if (typeof document !== "undefined") {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      document.documentElement.className = savedTheme;
    }
  }, []);

  const toggleTheme = () => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      document.documentElement.className = newTheme;
      localStorage.setItem('theme', newTheme);
      // Recreate icons if lucide is available to update colors/moon vs sun
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <div className="logo-mark"><Icon name="hexagon" size={16} /></div>
          <div className="logo-text">FreeImg<span>Tools</span></div>
        </Link>

        <nav className="nav-links">
          <button onClick={() => onCatChange?.('all')} className={`nav-link ${currentCat === 'all' ? 'active' : ''}`}>
            All<span className="desktop-tab-text"> Tools</span>
          </button>
          <button onClick={() => onCatChange?.('image')} className={`nav-link ${currentCat === 'image' ? 'active' : ''}`}>
            Image<span className="desktop-tab-text"> Tools</span>
          </button>
          <button onClick={() => onCatChange?.('pdf')} className={`nav-link ${currentCat === 'pdf' ? 'active' : ''}`}>
            PDF<span className="desktop-tab-text"> Tools</span>
          </button>
        </nav>

        <div className="header-actions">
          <div className="search-box">
            <Icon name="search" size={13} className="search-icon" />
            <input type="text" onChange={(e) => onSearch?.(e.target.value)} placeholder="Search here..." />
          </div>

          <Link href="/tool/pdf-signature" className="btn-primary header-esign" style={{ textDecoration: 'none' }}>
            <Icon name="pen-tool" size={12} /> E-Sign
          </Link>

          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <Icon name="moon" size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
