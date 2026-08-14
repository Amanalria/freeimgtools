"use client";

import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@/components/common/Icon";

export function SignatureStudio({ onComplete }: { onComplete: (dataUrl: string) => void }) {
  const [mode, setMode] = useState<'draw'|'type'|'upload'>('draw');
  const [ink, setInk] = useState('#0A1628');
  const [typedName, setTypedName] = useState('Alexander Hamilton');
  const [font, setFont] = useState('Great Vibes');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const cvs = canvasRef.current;
      const ctx = cvs.getContext('2d');
      if (ctx) {
        const rect = cvs.getBoundingClientRect();
        cvs.width = rect.width * 2;
        cvs.height = 220 * 2;
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, rect.width, 220);
      }
    }
  }, [mode]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setLastPos(getPos(e));
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const currentPos = getPos(e);
    
    ctx.strokeStyle = ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();
    setLastPos(currentPos);
  };

  const handleStop = () => setIsDrawing(false);

  const clearCanvas = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (ctx) {
      const rect = cvs.getBoundingClientRect();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, 220);
    }
  };

  const handleDone = () => {
    if (mode === 'draw' && canvasRef.current) {
      onComplete(canvasRef.current.toDataURL('image/png'));
    } else if (mode === 'type') {
      const cvs = document.createElement('canvas');
      cvs.width = 800; cvs.height = 280;
      const ctx = cvs.getContext('2d')!;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 800, 280);
      ctx.font = `56px '${font}', cursive`;
      ctx.fillStyle = ink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName || 'Signature', 400, 140);
      onComplete(cvs.toDataURL('image/png'));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      onComplete(ev.target?.result as string);
    };
    r.readAsDataURL(file);
  };

  return (
    <div id="w-signature-stage" style={{ marginBottom: 16 }}>
      <div className="tab-group" style={{ marginBottom: 16, width: 'fit-content' }}>
        <button onClick={() => setMode('draw')} className={`tab-btn ${mode === 'draw' ? 'active' : ''}`}>
          <Icon name="pen-tool" size={12} style={{ display: 'inline', marginRight: 4 }} />Draw
        </button>
        <button onClick={() => setMode('type')} className={`tab-btn ${mode === 'type' ? 'active' : ''}`}>
          <Icon name="type" size={12} style={{ display: 'inline', marginRight: 4 }} />Type
        </button>
        <button onClick={() => setMode('upload')} className={`tab-btn ${mode === 'upload' ? 'active' : ''}`}>
          <Icon name="upload" size={12} style={{ display: 'inline', marginRight: 4 }} />Upload
        </button>
      </div>

      {mode === 'draw' && (
        <div id="sig-draw-pane">
          <div className="sig-canvas-wrap">
            <canvas 
              id="stage-sig-canvas"
              ref={canvasRef}
              onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleStop} onMouseLeave={handleStop}
              onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleStop}
            ></canvas>
            <div className="sig-guideline"></div>
            <div className="sig-hint">Sign above the line</div>
          </div>
          <div className="sig-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-fg-1)' }}>Ink:</span>
              {['#0A1628', '#1E40AF', '#15803D', '#7C3AED'].map(c => (
                <button key={c} onClick={() => setInk(c)} className={`ink-swatch ${ink === c ? 'active' : ''}`} style={{ background: c }}></button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }} onClick={clearCanvas}>Clear</button>
            </div>
          </div>
        </div>
      )}

      {mode === 'type' && (
        <div id="sig-type-pane">
          <input 
            type="text" 
            value={typedName} 
            onChange={e => setTypedName(e.target.value)} 
            className="input-field" 
            style={{ marginBottom: 12 }} 
            placeholder="Type your name..."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {['Great Vibes', 'Dancing Script', 'Pacifico'].map(f => (
              <div key={f} className={`font-card ${font === f ? 'active' : ''}`} onClick={() => setFont(f)}>
                <div className="preview" style={{ fontFamily: `'${f}', cursive` }}>{typedName || 'Signature'}</div>
                <div className="label">{f}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'upload' && (
        <div id="sig-upload-pane">
          <div className="dropzone" onClick={() => document.getElementById('sig-img-upload')?.click()}>
            <input type="file" id="sig-img-upload" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            <div className="dropzone-icon"><Icon name="upload" size={20} /></div>
            <div className="dropzone-title">Upload photo of paper signature</div>
            <div className="dropzone-sub">Background is automatically made transparent</div>
          </div>
        </div>
      )}

      <button className="btn-primary" style={{ width: '100%', marginTop: 24, padding: '14px', fontSize: 16 }} onClick={handleDone}>
        Use This Signature
      </button>
    </div>
  );
}
