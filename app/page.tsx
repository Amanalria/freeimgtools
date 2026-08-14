"use client";

import React
import { Icon } from "@/components/common/Icon";, { useState, useEffect } from "react";
import Link from "next/link";
import { TOOLS_LIST } from "@/data/tools";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  const [currentCat, setCurrentCat] = useState("all");
  const [search, setSearch] = useState(");
  const [sortOrder, setSortOrder] = useState("popular");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Re-initialize lucide icons when tools grid changes
    if (typeof window !== "undefined" && (window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  });

  const filteredTools = TOOLS_LIST.filter(t => {
    if (currentCat !== "all" && t.category !== currentCat) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.name.toLowerCase().includes(s) && !t.desc.toLowerCase().includes(s)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === "popular") {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return 0;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const faqs = [
    { q: "Are my photos and PDF files uploaded to any server?", a: "No. FreeImgTools is engineered 100% on client-side technology using the HTML5 Canvas API, WebAssembly, and PDF-Lib. Your files are processed entirely inside your local device's memory and never leave your web browser." },
    { q: "How does target size compression (KB / MB) work?", a: "When you enter a target size (e.g. 50 KB or 1 MB), our intelligent binary search compression engine optimizes image quality and dimension factors iteratively in milliseconds until the output matches your exact target file boundary." },
    { q: "Is FreeImgTools completely free without watermarks?", a: "Yes, all 106 tools are 100% free with unlimited usage. No accounts, no email signups, and zero promotional watermarks stamped on your downloaded files." },
    { q: "Can I use FreeImgTools offline without an internet connection?", a: "Yes. Because all processing engines run in-browser through client JavaScript and Canvas, once the page loads you can disconnect your internet and process documents completely offline." }
  ];

  return (
    <>
      <Navbar currentCat={currentCat} onCatChange={setCurrentCat} onSearch={setSearch} />
      
      <div id="home-view">
        <section className="hero">
          <div className="container">
            <div className="badge" style={{ marginBottom: 18 }}>
              <Icon name="shield-check" size={12} />
              100% Client-Side &middot; Zero Server Uploads
            </div>
            <h1>Every tool you need.<br />Right in your <em>browser</em>.</h1>
            <p>106 image and PDF utilities that run entirely in your browser. No uploads, no accounts, no limits.</p>

            <div className="hero-search">
              <Icon name="search" size={16} className="search-icon" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search here..." />
            </div>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => setCurrentCat('image')}>
                <Icon name="image" size={14} /> Image Tools
              </button>
              <button className="btn-primary" onClick={() => setCurrentCat('pdf')} style={{ background: 'var(--c-success)' }}>
                <Icon name="file-text" size={14} /> PDF Tools
              </button>
              <Link href="/tool/pdf-signature" className="btn-ghost">
                <Icon name="pen-tool" size={14} /> E-Signature
              </Link>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="metrics">
            <div className="metric">
              <div className="metric-value">106</div>
              <div className="metric-label">Tools</div>
              <div className="metric-sub">53 Image + 53 PDF</div>
            </div>
            <div className="metric">
              <div className="metric-value" style={{ color: 'var(--c-success)' }}>100%</div>
              <div className="metric-label">Browser-side</div>
              <div className="metric-sub">No cloud processing</div>
            </div>
            <div className="metric">
              <div className="metric-value">0</div>
              <div className="metric-label">Uploads</div>
              <div className="metric-sub">Files never leave device</div>
            </div>
            <div className="metric">
              <div className="metric-value">&infin;</div>
              <div className="metric-label">Free forever</div>
              <div className="metric-sub">No signups or limits</div>
            </div>
          </div>
        </div>

        <main className="container">
          <div className="filter-bar">
            <div className="tab-group">
              <button onClick={() => setCurrentCat('all')} className={`tab-btn ${currentCat === 'all' ? 'active' : ''}`}>All</button>
              <button onClick={() => setCurrentCat('image')} className={`tab-btn ${currentCat === 'image' ? 'active' : ''}`}>Image</button>
              <button onClick={() => setCurrentCat('pdf')} className={`tab-btn ${currentCat === 'pdf' ? 'active' : ''}`}>PDF</button>
            </div>
            <select className="sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="az">Alphabetical (A &rarr; Z)</option>
            </select>
          </div>

          <div className="tools-grid">
            {filteredTools.map(tool => (
              <Link href={`/tool/${tool.slug}`} key={tool.slug} className="tool-card">
                <div>
                  <div className="card-top">
                    <div className={`card-icon ${tool.category}`}>
                      <Icon name={tool.icon} size={20} />
                    </div>
                    {tool.popular && <div className="badge-popular">Popular</div>}
                  </div>
                  <div className="card-title">{tool.name}</div>
                  <div className="card-desc">{tool.desc}</div>
                </div>
                <div className="card-footer">
                  <span>{tool.category === 'image' ? 'Image Tool' : 'PDF Tool'}</span>
                  <span className="arrow">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>

          <section className="faq-section" id="faq">
            <div className="faq-title">Frequently Asked Questions</div>
            <div className="faq-sub">Everything you need to know about FreeImgTools local browser processing.</div>

            <div className="faq-list">
              {faqs.map((faq, idx) => (
                <div key={idx} className={`faq-item ${openFaq === idx ? 'open' : ''}`}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                    <span>{faq.q}</span>
                    <Icon name="chevron-down" size={16} className="faq-icon" />
                  </button>
                  <div className="faq-answer">{faq.a}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="pre-footer">
            <h3>Ready to optimize your files securely?</h3>
            <p>Join thousands of designers, developers, and professionals who process images and PDFs with complete privacy.</p>
            <button className="btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Icon name="arrow-up" size={14} /> Explore All 106 Tools
            </button>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
