"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/common/Icon";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 10 }}>
              <div className="logo-mark" style={{ width: 26, height: 26 }}>
                <Icon name="hexagon" size={14} />
              </div>
              <div className="logo-text" style={{ fontSize: 15 }}>FreeImg<span>Tools</span></div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--c-fg-2)', lineHeight: 1.6, maxWidth: 280 }}>
              FreeImgTools provides 106 fast, private, and unlimited image and PDF tools running 100% client-side with zero server uploads.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Image Tools</div>
            <ul className="footer-links">
              <li><Link href="/tool/compress-image">Image Compressor</Link></li>
              <li><Link href="/tool/webp-converter">WebP Converter</Link></li>
              <li><Link href="/tool/resize-image">Image Resizer</Link></li>
              <li><Link href="/tool/crop-image">Image Cropper</Link></li>
              <li><Link href="/tool/watermark-image">Watermark Image</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">PDF Tools</div>
            <ul className="footer-links">
              <li><Link href="/tool/merge-pdf">Merge PDF</Link></li>
              <li><Link href="/tool/split-pdf">Split PDF</Link></li>
              <li><Link href="/tool/compress-pdf">Compress PDF</Link></li>
              <li><Link href="/tool/rotate-pdf">Rotate PDF</Link></li>
              <li><Link href="/tool/pdf-signature">E-Signature Studio</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Privacy & Info</div>
            <ul className="footer-links">
              <li><Link href="/#faq">Privacy FAQ</Link></li>
              <li><Link href="/">All 106 Tools</Link></li>
              <li><span style={{ fontSize: 12, color: 'var(--c-success)', fontWeight: 600 }}>&bull; 100% In-Browser</span></li>
              <li><span style={{ fontSize: 12, color: 'var(--c-fg-3)' }}>Zero Cloud Storage</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} FreeImgTools. All rights reserved. Open Architecture.</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span>Zero Server Uploads</span>
            <span>&middot;</span>
            <span>Client-Side Processing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
