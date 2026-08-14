import JSZip from "jszip";
import QRCode from "qrcode";

export interface ProcessedImageResult {
  blob: Blob;
  url: string;
  filename: string;
  width: number;
  height: number;
  originalSize: number;
  newSize: number;
  format: string;
  zipBlob?: Blob;
}

export async function processImageTool(
  file: File | null,
  slug: string,
  settings: Record<string, any>,
  extraPayload?: string
): Promise<ProcessedImageResult> {
  // Special Tool: QR Code Generator (no file upload required)
  if (slug === "qr-code-generator") {
    const text = (settings.qrText as string) || extraPayload || "https://pixelforge.tools";
    const fgColor = (settings.fgColor as string) || "#0A0A0F";
    const bgColor = (settings.bgColor as string) || "#ffffff";
    const size = Number(settings.size) || 512;

    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: "qrcode.png",
      width: size,
      height: size,
      originalSize: 0,
      newSize: blob.size,
      format: "image/png",
    };
  }

  // Special Tool: Base64 to Image
  if (slug === "base64-to-image") {
    const base64Str = extraPayload || (settings.base64Input as string) || "";
    let cleanStr = base64Str.trim();
    if (!cleanStr.startsWith("data:")) {
      cleanStr = `data:image/png;base64,${cleanStr}`;
    }
    const res = await fetch(cleanStr);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const img = await loadImageFromUrl(url);

    return {
      blob,
      url,
      filename: "decoded_image.png",
      width: img.naturalWidth || 800,
      height: img.naturalHeight || 600,
      originalSize: base64Str.length,
      newSize: blob.size,
      format: blob.type || "image/png",
    };
  }

  if (!file) {
    throw new Error("No image file provided.");
  }

  const originalSize = file.size;
  const originalUrl = URL.createObjectURL(file);
  const img = await loadImageFromUrl(originalUrl);
  URL.revokeObjectURL(originalUrl);

  const origWidth = img.naturalWidth;
  const origHeight = img.naturalHeight;

  // Special Tool: Favicon Generator (generate multi-size bundle + ZIP)
  if (slug === "favicon-generator") {
    const zip = new JSZip();
    const sizes = [16, 32, 48, 64, 180, 192, 512];
    let primaryBlob: Blob | null = null;
    let primaryUrl = "";

    for (const sz of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = sz;
      canvas.height = sz;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, sz, sz);

      const b = await new Promise<Blob>((resolve) =>
        canvas.toBlob((res) => resolve(res!), "image/png")
      );

      const filename = sz === 180 ? "apple-touch-icon.png" : `favicon-${sz}x${sz}.png`;
      zip.file(filename, b);

      if (sz === 32) {
        primaryBlob = b;
        primaryUrl = URL.createObjectURL(b);
      }
    }

    const manifestJson = JSON.stringify(
      {
        name: "PixelForge App",
        icons: [
          { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        theme_color: "#0A0A0F",
        background_color: "#0A0A0F",
        display: "standalone",
      },
      null,
      2
    );
    zip.file("site.webmanifest", manifestJson);

    const zipBlob = await zip.generateAsync({ type: "blob" });

    return {
      blob: primaryBlob || zipBlob,
      url: primaryUrl || URL.createObjectURL(zipBlob),
      filename: "favicons.zip",
      width: 32,
      height: 32,
      originalSize,
      newSize: zipBlob.size,
      format: "application/zip",
      zipBlob,
    };
  }

  // Generic Canvas Image Pipeline
  let targetWidth = origWidth;
  let targetHeight = origHeight;
  let outputFormat = file.type || "image/png";
  let quality = 0.85;

  // Process settings depending on tool
  if (slug === "compress-image" || slug === "bulk-compress-image") {
    const q = Number(settings.quality) || 80;
    quality = Math.max(0.1, Math.min(1.0, q / 100));

    if (settings.format && settings.format !== "original") {
      outputFormat = settings.format;
    } else if (file.type === "image/png" && quality < 0.9) {
      outputFormat = "image/webp";
    }

    if (settings.maxWidth && origWidth > Number(settings.maxWidth)) {
      const ratio = Number(settings.maxWidth) / origWidth;
      targetWidth = Math.round(Number(settings.maxWidth));
      targetHeight = Math.round(origHeight * ratio);
    }
  } else if (slug === "webp-converter") {
    outputFormat = "image/webp";
    quality = (Number(settings.quality) || 85) / 100;
  } else if (slug === "avif-converter") {
    outputFormat = "image/avif";
    quality = (Number(settings.quality) || 80) / 100;
  } else if (slug === "jpg-to-png") {
    outputFormat = "image/png";
  } else if (slug === "png-to-jpg") {
    outputFormat = "image/jpeg";
    quality = (Number(settings.quality) || 90) / 100;
  } else if (slug === "resize-image" || slug === "bulk-resize-image") {
    const w = Number(settings.width) || origWidth;
    const h = Number(settings.height) || origHeight;
    const maintain = settings.maintainAspect !== false;

    if (maintain) {
      if (w !== origWidth) {
        const r = w / origWidth;
        targetWidth = w;
        targetHeight = Math.round(origHeight * r);
      } else if (h !== origHeight) {
        const r = h / origHeight;
        targetHeight = h;
        targetWidth = Math.round(origWidth * r);
      }
    } else {
      targetWidth = w;
      targetHeight = h;
    }
  } else if (slug === "social-media-resizer") {
    const preset = settings.platform || "ig-post";
    const dimensionsMap: Record<string, [number, number]> = {
      "ig-post": [1080, 1080],
      "ig-portrait": [1080, 1350],
      "ig-story": [1080, 1920],
      "yt-banner": [2560, 1440],
      "x-header": [1500, 500],
      "li-banner": [1584, 396],
    };
    const [sw, sh] = dimensionsMap[preset] || [1080, 1080];
    targetWidth = sw;
    targetHeight = sh;
    outputFormat = "image/jpeg";
  } else if (slug === "thumbnail-generator") {
    targetWidth = 1280;
    targetHeight = 720;
    outputFormat = "image/jpeg";
  }

  // Create Canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D canvas context.");

  // Handle Rotations
  const rotation = Number(settings.rotation || settings.rotationAngle || 0);
  const flipH = !!settings.flipH;
  const flipV = !!settings.flipV;

  if (rotation === 90 || rotation === 270) {
    canvas.width = targetHeight;
    canvas.height = targetWidth;
  } else {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Background fill for PNG to JPG or pad
  if (outputFormat === "image/jpeg" || settings.bgColor) {
    ctx.fillStyle = settings.bgColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();

  // Transforms: rotate & flip
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // CSS / Canvas Filter application
  let filterStr = "";
  if (slug === "brightness-contrast") {
    const b = settings.brightness ?? 100;
    const c = settings.contrast ?? 100;
    filterStr += `brightness(${b}%) contrast(${c}%) `;
  } else if (slug === "saturation-hue") {
    const s = settings.saturation ?? 100;
    const h = settings.hue ?? 0;
    filterStr += `saturate(${s}%) hue-rotate(${h}deg) `;
  } else if (slug === "grayscale-converter") {
    const g = settings.grayscale ?? 100;
    const sep = settings.sepia ?? 0;
    filterStr += `grayscale(${g}%) sepia(${sep}%) `;
  } else if (slug === "invert-colors") {
    const inv = settings.invert ?? 100;
    filterStr += `invert(${inv}%) `;
  } else if (slug === "blur-image") {
    const r = settings.radius ?? 10;
    filterStr += `blur(${r}px) `;
  }

  if (filterStr) {
    ctx.filter = filterStr.trim();
  }

  // Draw scaled image
  ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
  ctx.restore();

  // Post-processing overlays (Rounded corners, Border, Watermark, Meme)
  if (slug === "rounded-corners") {
    const rad = Number(settings.radius) || 40;
    const isCircle = !!settings.makeCircle;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.beginPath();
    if (isCircle) {
      const minDim = Math.min(canvas.width, canvas.height);
      ctx.arc(canvas.width / 2, canvas.height / 2, minDim / 2, 0, Math.PI * 2);
    } else {
      roundRect(ctx, 0, 0, canvas.width, canvas.height, rad);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
    outputFormat = "image/png";
  }

  if (slug === "add-border") {
    const bWidth = Number(settings.borderWidth) || 20;
    const bColor = (settings.borderColor as string) || "#6366F1";
    ctx.lineWidth = bWidth * 2;
    ctx.strokeStyle = bColor;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  if (slug === "watermark-image") {
    const text = (settings.text as string) || "© PixelForge";
    const fontSize = Number(settings.fontSize) || 36;
    const opacity = (Number(settings.opacity) || 70) / 100;
    const color = (settings.color as string) || "#ffffff";
    const pos = settings.position || "bottom-right";

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 6;

    const metrics = ctx.measureText(text);
    let x = canvas.width - metrics.width - 30;
    let y = canvas.height - 30;

    if (pos === "bottom-left") {
      x = 30;
      y = canvas.height - 30;
    } else if (pos === "center") {
      x = (canvas.width - metrics.width) / 2;
      y = canvas.height / 2;
    } else if (pos === "top-right") {
      x = canvas.width - metrics.width - 30;
      y = fontSize + 30;
    }

    ctx.fillText(text, x, y);
    ctx.restore();
  }

  if (slug === "meme-generator") {
    const topText = (settings.topText as string || "").toUpperCase();
    const bottomText = (settings.bottomText as string || "").toUpperCase();
    const fontSize = Number(settings.fontSize) || Math.max(28, Math.round(canvas.width / 15));
    const textColor = (settings.textColor as string) || "#ffffff";

    ctx.save();
    ctx.font = `900 ${fontSize}px Impact, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(3, fontSize / 12);
    ctx.textAlign = "center";

    if (topText) {
      ctx.strokeText(topText, canvas.width / 2, fontSize + 15);
      ctx.fillText(topText, canvas.width / 2, fontSize + 15);
    }
    if (bottomText) {
      ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 25);
      ctx.fillText(bottomText, canvas.width / 2, canvas.height - 25);
    }
    ctx.restore();
  }

  // Generate output blob
  const finalBlob = await new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas conversion to Blob failed"));
        },
        outputFormat,
        quality
      );
    } catch (e) {
      reject(e);
    }
  });

  const finalUrl = URL.createObjectURL(finalBlob);

  const ext = outputFormat.split("/")[1] || "png";
  const nameBase = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
  const filename = `${nameBase}_pixelforge.${ext}`;

  return {
    blob: finalBlob,
    url: finalUrl,
    filename,
    width: canvas.width,
    height: canvas.height,
    originalSize,
    newSize: finalBlob.size,
    format: outputFormat,
  };
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Failed to load image file."));
    img.src = url;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
