# ⚡ PixelForge — Premium All-In-One Image & PDF Tools Platform

> **"Every Tool You Need. Zero Uploads Required."**

PixelForge is a production-ready, ultra-fast web application offering 100+ professional image processing and PDF document tools. Built on a zero-trust, 100% client-side architecture where every compression, conversion, merge, and edit runs entirely inside the user's browser memory using WebAssembly, the HTML5 Canvas API, and `pdf-lib`.

---

## 🎨 Minimalist Premium Design System

- **Background Base**: `#0A0A0F` (Deep Space Dark)
- **Card Surfaces**: `#111118` with subtle rotating conic gradient mesh on hover
- **Modals & Elevated Elements**: `#16161F`
- **Primary Interactive Accent**: `#6366F1` (Indigo Glow)
- **Secondary Status Accent**: `#10B981` (Emerald PDF Accent)
- **Typography**: Inter (Body) & Geist Sans (Headings) + Monospace metrics
- **Animations**: Silky Framer Motion layout transitions & reduced-motion awareness

---

## 🚀 Key Architectural Features

1. **100% In-Browser Privacy**: Zero bytes are sent to any remote server. GDPR, HIPAA, and privacy compliant by design.
2. **Dynamic 100+ Tool Registry (`/data/tools.ts`)**: Every tool has a dedicated page (`/tools/[slug]`) with SEO metadata, JSON-LD schemas (`SoftwareApplication`, `BreadcrumbList`, `FAQPage`), responsive dropzone, dynamic settings panel, and real-time processing engine.
3. **Hardware Accelerated Processing**:
   - **Image Engine (`/lib/tools/image-engine.ts`)**: Canvas API pipeline with format conversion, quality compression, resizing with aspect locks, rounded corners, watermarks, meme generators, QR code generation, and multi-file ZIP generation.
   - **PDF Engine (`/lib/pdf/pdf-engine.ts`)**: `pdf-lib` pipeline supporting PDF merge, split by page range, page extraction, deletion, 90°/180° rotation, Bates page numbering, text watermarks, images-to-PDF, and text-to-PDF.
4. **AdSense & Monetization Ready (`/components/common/AdSlot.tsx`)**: Lazy-loaded, zero Cumulative Layout Shift (CLS) fixed-height containers with non-blocking scripts.
5. **Full SEO Suite**: Auto-generated dynamic `/sitemap.xml`, `/robots.txt`, and OpenGraph/Twitter Cards.

---

## 📁 Directory Structure

```text
freeimgtool/
├── app/
│   ├── layout.tsx              # Root layout with SEO, AdSense & navbar/footer
│   ├── page.tsx                # Homepage (Hero, Stats, Category suites, FAQs)
│   ├── globals.css             # Design tokens, custom scrollbars, dark theme
│   ├── tools/
│   │   ├── page.tsx            # All tools catalog with search & filters
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic individual tool workstation
│   ├── image/
│   │   └── page.tsx            # Image Tools category hub
│   ├── pdf/
│   │   └── page.tsx            # PDF Tools category hub
│   ├── about/
│   │   └── page.tsx            # Architecture & zero-upload philosophy
│   ├── sitemap.ts              # Dynamic sitemap generator
│   └── robots.ts               # Robots.txt generator
├── components/
│   ├── common/
│   │   ├── CategoryBadge.tsx   # Indigo & Emerald badges
│   │   └── AdSlot.tsx          # CLS-free lazy-loaded ad wrapper
│   ├── layout/
│   │   ├── Navbar.tsx          # Sticky glassmorphic navbar
│   │   └── Footer.tsx          # Categorized links & privacy badges
│   ├── home/
│   │   ├── Hero.tsx            # Animated word cycler + particle canvas
│   │   ├── Stats.tsx           # Performance & privacy counters
│   │   └── CategorySection.tsx # Deep-dive Image & PDF grids
│   └── tools/
│       ├── ToolCard.tsx        # Signature conic gradient mesh hover card
│       ├── ToolGrid.tsx        # Responsive 4-col masonry grid
│       ├── FileDropzone.tsx    # Drag-drop, paste & validation dropzone
│       ├── ToolSettingsPanel.tsx# Dynamic schema-driven settings drawer
│       ├── ProgressBar.tsx     # Animated execution progress
│       └── ResultPreview.tsx   # Before/after metrics, download & ZIP
├── data/
│   └── tools.ts                # Master tools registry (100+ tools with schemas)
├── lib/
│   ├── tools/
│   │   └── image-engine.ts     # Client-side Canvas & WebP/ZIP processor
│   ├── pdf/
│   │   └── pdf-engine.ts       # Client-side pdf-lib processor
│   ├── seo/
│   │   └── metadata.ts         # Metadata & JSON-LD helper
│   └── utils.ts                # Tailwind merge & byte formatters
├── tailwind.config.ts          # PixelForge color palette & keyframes
├── tsconfig.json               # TypeScript strict configuration
├── next.config.js              # Standalone deployment configuration
└── package.json
```

---

## 🛠️ Getting Started Locally

### 1. Install Dependencies
```bash
npm install --no-bin-links
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Build for Production (Standalone / Vercel)
```bash
npm run build
npm start
```

---

## 🔒 Privacy Guarantee
All files are processed strictly in browser volatile RAM. No data is stored, cached, or uploaded across any network.
