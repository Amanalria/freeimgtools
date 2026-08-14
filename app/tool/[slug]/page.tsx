"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/common/Icon";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TOOLS_LIST } from "@/data/tools";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SignatureStudio } from "@/components/tools/SignatureStudio";
import * as pdfLib from "pdf-lib";

export default function WorkstationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tool = TOOLS_LIST.find((t: any) => t.slug === slug);

  const [file, setFile] = useState<File | null>(null);
  const [textPayload, setTextPayload] = useState("");
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url: string; filename: string; type: 'img' | 'pdf'; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tool) {
      router.push("/");
      return;
    }
    // Initialize default settings
    const initialSettings: Record<string, any> = {};
    if (tool.settings) {
      tool.settings.forEach((s: any) => {
        initialSettings[s.id] = s.val || s.defaultValue || "";
      });
    }
    setSettings(initialSettings);
    setFile(null);
    setResult(null);

    // Initialize lucide
    if (typeof window !== "undefined" && (window as any).lucide) {
      setTimeout(() => (window as any).lucide.createIcons(), 100);
    }
  }, [tool, slug, router]);

  if (!tool) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateSetting = (id: string, val: any) => {
    setSettings(prev => ({ ...prev, [id]: val }));
  };

  const processTool = async () => {
    if (tool.isSignature && !file) {
      alert("Please generate or upload a signature first.");
      return;
    }

    if (!file && !tool.isText && tool.slug !== 'qr-code-generator') {
      alert('Please select a file to process.');
      return;
    }

    setProcessing(true);
    setProgress(30);

    try {
      if (tool.slug === 'qr-code-generator') {
        const payload = textPayload || 'https://freeimgtools.com';
        const size = Number(settings.size) || 512;
        const QRCode = (window as any).QRCode;
        if (!QRCode) throw new Error("QRCode library not loaded");
        
        const dataUri = await QRCode.toDataURL(payload, { width: size, margin: 2 });
        const res = await fetch(dataUri);
        const blob = await res.blob();
        setResult({ url: URL.createObjectURL(blob), filename: 'qrcode.png', type: 'img', size: blob.size });
      }
      else if (tool.slug === 'text-to-pdf') {
        const payload = textPayload || 'FreeImgTools Generated Document';
        const doc = await pdfLib.PDFDocument.create();
        const page = doc.addPage([595, 842]);
        const font = await doc.embedFont(pdfLib.StandardFonts.Helvetica);
        page.drawText(payload, { x: 50, y: 780, size: settings.fontSize || 12, font, color: pdfLib.rgb(0.1, 0.1, 0.1) });
        const bytes = await doc.save();
        const blob = new Blob([bytes as any], { type: 'application/pdf' });
        setResult({ url: URL.createObjectURL(blob), filename: 'document.pdf', type: 'pdf', size: blob.size });
      } 
      else if (tool.category === 'image' && file) {
        setProgress(60);
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise(r => { img.onload = r; });

        const cvs = document.createElement('canvas');
        const ctx = cvs.getContext('2d')!;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        let fmt = 'image/png';
        let quality = 0.85;
        let processedBlob: Blob | null = null;

        if (tool.slug === 'compress-image') {
          const mode = settings.mode || 'targetSize';
          fmt = settings.format || 'image/webp';
          if (mode === 'targetSize') {
            const targetBytes = (Number(settings.targetKb) || 100) * 1024;
            let low = 0.05, high = 0.95;
            cvs.width = w; cvs.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            for (let iter = 0; iter < 5; iter++) {
              let mid = (low + high) / 2;
              let b: Blob = await new Promise(r => cvs.toBlob(res => r(res as Blob), fmt, mid));
              if (b) {
                processedBlob = b;
                if (b.size > targetBytes) high = mid;
                else low = mid;
              }
            }
          } else {
            quality = (Number(settings.quality) || 80) / 100;
          }
        }
        
        w = Number(settings.width) || w;
        h = Number(settings.height) || h;

        // Generic format conversions
        if (tool.slug.includes('to-jpg') || tool.slug.includes('to-jpeg')) fmt = 'image/jpeg';
        if (tool.slug.includes('to-png')) fmt = 'image/png';
        if (tool.slug.includes('to-webp')) fmt = 'image/webp';
        if (tool.slug.includes('to-gif')) fmt = 'image/gif';

        // Generic CSS Filters
        let filters = [];
        if (settings.blur || tool.slug === 'blur-image') filters.push(`blur(${settings.radius || settings.blur || 10}px)`);
        if (settings.grayscale || tool.slug === 'grayscale-converter') filters.push(`grayscale(${settings.grayscale || 100}%)`);
        if (settings.sepia) filters.push(`sepia(${settings.sepia}%)`);
        if (settings.invert || tool.slug === 'invert-colors') filters.push(`invert(${settings.invert || 100}%)`);
        if (settings.brightness) filters.push(`brightness(${settings.brightness}%)`);
        if (settings.contrast) filters.push(`contrast(${settings.contrast}%)`);
        if (settings.hueRotate) filters.push(`hue-rotate(${settings.hueRotate}deg)`);
        if (settings.saturate) filters.push(`saturate(${settings.saturate}%)`);

        if (filters.length > 0) {
          ctx.filter = filters.join(' ');
        }

        cvs.width = w; cvs.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        if (tool.slug === 'watermark-image') {
          const txt = settings.text || '© FreeImgTools';
          const sz = Number(settings.fontSize) || 36;
          const op = (Number(settings.opacity) || 70) / 100;
          ctx.globalAlpha = op;
          ctx.font = `bold ${sz}px sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(txt, w - (txt.length * sz * 0.55) - 20, h - 24);
        }

        if (!processedBlob) {
          processedBlob = await new Promise(r => cvs.toBlob(res => r(res as Blob), fmt, quality));
        }

        if (processedBlob) {
          setResult({ 
            url: URL.createObjectURL(processedBlob), 
            filename: `freeimgtools_${file.name.split('.')[0]}.${fmt.split('/')[1] || 'png'}`, 
            type: 'img', 
            size: processedBlob.size 
          });
        }
      } 
      else if (tool.category === 'pdf' && file) {
        setProgress(70);
        const buf = await file.arrayBuffer();
        const doc = await pdfLib.PDFDocument.load(buf);
        
        if (tool.slug === 'rotate-pdf') {
          const angle = Number(settings.angle) || 90;
          doc.getPages().forEach(p => p.setRotation(pdfLib.degrees(angle)));
        } else if (tool.slug === 'add-watermark-pdf') {
          const wm = settings.watermark || 'CONFIDENTIAL';
          const font = await doc.embedFont(pdfLib.StandardFonts.HelveticaBold);
          doc.getPages().forEach(p => {
            const { width, height } = p.getSize();
            p.drawText(wm, { x: width / 4, y: height / 2, size: 48, font, color: pdfLib.rgb(0.6, 0.6, 0.7), opacity: (Number(settings.opacity)||25)/100, rotate: pdfLib.degrees(45) });
          });
        }
        const bytes = await doc.save();
        const blob = new Blob([bytes as any], { type: 'application/pdf' });
        setResult({ url: URL.createObjectURL(blob), filename: `freeimgtools_${file.name}`, type: 'pdf', size: blob.size });
      } else {
        alert("Tool not fully implemented yet!");
      }
    } catch (err: any) {
      alert('Processing error: ' + err.message);
    } finally {
      setProgress(100);
      setTimeout(() => setProcessing(false), 300);
    }
  };

  return (
    <>
      <Navbar currentCat={tool.category} />
      
      <div id="workstation-view" className="container workstation-container" style={{ display: 'block' }}>
        <div className="workstation-nav">
          <Link href="/#/" className="back-link">
            <Icon name="arrow-left" size={14} />
            <span>Back to All Tools</span>
          </Link>
          <div className="badge">{tool.category === 'image' ? 'Image Tool' : 'PDF Tool'}</div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>{tool.name}</h1>
          <p style={{ fontSize: 14, color: 'var(--c-fg-2)', marginTop: 4 }}>{tool.desc}</p>
        </div>

        <div className="modal-grid">
          <div className="stage-card">
            {!tool.isSignature && (
              <div id="w-dropzone-wrap">
                {!file ? (
                  <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                    <div className="dropzone-icon"><Icon name="upload" size={20} /></div>
                    <div className="dropzone-title">Select or drop a file</div>
                    <div className="dropzone-sub">PNG, JPG, WebP, SVG, PDF, TXT</div>
                  </div>
                ) : (
                  <div className="file-tag" style={{ display: 'flex' }}>
                    <div className="file-tag-info">
                      <Icon name="file" size={16} color="var(--c-accent)" />
                      <div>
                        <div className="file-tag-name">{file.name}</div>
                        <div className="file-tag-size">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <button className="file-tag-remove" onClick={clearFile}>
                      <Icon name="trash-2" size={14} />
                    </button>
                  </div>
                )}

                {(tool.isText || tool.slug === 'qr-code-generator') && (
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-fg-1)', display: 'block', marginBottom: 4 }}>Text / URL input</label>
                    <textarea 
                      rows={3} 
                      className="input-field" 
                      style={{ fontFamily: 'var(--mono)', fontSize: 12 }} 
                      placeholder="Enter text or URL..."
                      value={textPayload}
                      onChange={(e) => setTextPayload(e.target.value)}
                    ></textarea>
                  </div>
                )}
              </div>
            )}

            {tool.isSignature && !result && (
              <SignatureStudio onComplete={(dataUrl) => {
                fetch(dataUrl).then(res => res.blob()).then(blob => {
                  setResult({ url: URL.createObjectURL(blob), filename: 'signature.png', type: 'img', size: blob.size });
                });
              }} />
            )}

            {processing && (
              <div className="progress-bar-wrap" style={{ display: 'block' }}>
                <div className="progress-bar-header">
                  <span className="progress-bar-label">
                    <Icon name="loader" size={14} className="animate-spin" />
                    Processing in browser memory...
                  </span>
                  <span className="progress-bar-pct">{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {result && !processing && (
              <div className="result-panel" style={{ display: 'block' }}>
                <div className="result-header">
                  <span className="result-success">
                    <Icon name="check-circle" size={15} /> Ready for Download
                  </span>
                  {file && file.size > result.size && (
                    <span className="result-savings">
                      −{Math.round(((file.size - result.size) / file.size) * 100)}%
                    </span>
                  )}
                </div>
                <div className="result-preview">
                  {result.type === 'img' ? (
                    <img src={result.url} alt="Result" style={{ display: 'block', maxHeight: 220, width: 'auto', margin: '0 auto' }} />
                  ) : (
                    <iframe src={result.url} style={{ display: 'block', width: '100%', height: 220, border: 'none' }}></iframe>
                  )}
                </div>
                <div className="result-actions">
                  <a href={result.url} download={result.filename} className="btn-primary" style={{ flex: 1, textDecoration: 'none' }}>
                    <Icon name="download" size={14} /> Download ({(result.size / 1024).toFixed(1)} KB)
                  </a>
                </div>
              </div>
            )}

            {!tool.isSignature && (
              <button className="btn-primary" style={{ width: '100%', marginTop: 16, padding: 12, fontSize: 14 }} onClick={processTool} disabled={processing}>
                <Icon name="play" size={14} /> {processing ? 'Processing...' : 'Process Now'}
              </button>
            )}
          </div>

          <aside className="settings-panel">
            <div className="settings-header">
              <span className="settings-title"><Icon name="sliders" size={13} /> Settings</span>
              <span className="settings-privacy"><Icon name="shield-check" size={12} /> Local RAM</span>
            </div>
            
            {tool.settings && tool.settings.map((s: any) => (
              <div className="setting-group" key={s.id}>
                {s.type === 'range' ? (
                  <>
                    <div className="setting-label">
                      <span>{s.label}</span>
                      <span className="setting-val">{settings[s.id]}</span>
                    </div>
                    <input 
                      type="range" 
                      className="setting-range" 
                      min={s.min} max={s.max} 
                      value={settings[s.id]} 
                      onChange={(e) => updateSetting(s.id, e.target.value)} 
                    />
                  </>
                ) : s.type === 'select' ? (
                  <>
                    <div className="setting-label"><span>{s.label}</span></div>
                    <select className="setting-select" value={settings[s.id]} onChange={(e) => updateSetting(s.id, e.target.value)}>
                      {s.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <div className="setting-label"><span>{s.label}</span></div>
                    <input 
                      type={s.type === 'number' ? 'number' : 'text'} 
                      className="setting-input" 
                      value={settings[s.id]} 
                      onChange={(e) => updateSetting(s.id, e.target.value)} 
                    />
                  </>
                )}
              </div>
            ))}
            {(!tool.settings || tool.settings.length === 0) && (
              <div style={{ fontSize: 12, color: 'var(--c-fg-3)', textAlign: 'center', padding: '20px 0' }}>
                No configuration needed.<br/>Automatic processing.
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}
