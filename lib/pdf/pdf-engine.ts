import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  PageSizes,
} from "pdf-lib";

export interface ProcessedPdfResult {
  blob: Blob;
  url: string;
  filename: string;
  pageCount: number;
  originalSize: number;
  newSize: number;
}

export async function processPdfTool(
  files: File[],
  slug: string,
  settings: Record<string, any>,
  extraText?: string
): Promise<ProcessedPdfResult> {
  if (slug === "text-to-pdf") {
    const textContent = extraText || (settings.rawText as string) || "PixelForge Sample Document";
    const fontSize = Number(settings.fontSize) || 12;
    const lineSpacing = Number(settings.lineSpacing) || 1.5;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = PageSizes.A4;
    const margin = 50;
    const maxLineWidth = width - margin * 2;
    const lineHeight = fontSize * lineSpacing;

    let page = pdfDoc.addPage(PageSizes.A4);
    let y = height - margin;

    const lines = textContent.split("\n");
    for (const rawLine of lines) {
      // Basic word wrap
      const words = rawLine.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxLineWidth && currentLine) {
          if (y - lineHeight < margin) {
            page = pdfDoc.addPage(PageSizes.A4);
            y = height - margin;
          }
          page.drawText(currentLine, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.15),
          });
          y -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (y - lineHeight < margin) {
          page = pdfDoc.addPage(PageSizes.A4);
          y = height - margin;
        }
        page.drawText(currentLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.15),
        });
        y -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: "document_pixelforge.pdf",
      pageCount: pdfDoc.getPageCount(),
      originalSize: textContent.length,
      newSize: blob.size,
    };
  }

  if (slug === "jpg-to-pdf") {
    if (!files || files.length === 0) throw new Error("Please select one or more images.");

    const pdfDoc = await PDFDocument.create();
    let totalOriginalSize = 0;

    for (const f of files) {
      totalOriginalSize += f.size;
      const arrayBuffer = await f.arrayBuffer();
      let img;

      if (f.type === "image/png") {
        img = await pdfDoc.embedPng(arrayBuffer);
      } else {
        img = await pdfDoc.embedJpg(arrayBuffer);
      }

      const imgDims = img.scale(1.0);
      const pageSizePref = settings.pageSize || "A4";

      let page;
      if (pageSizePref === "Fit") {
        page = pdfDoc.addPage([imgDims.width, imgDims.height]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: imgDims.width,
          height: imgDims.height,
        });
      } else {
        const [pw, ph] = pageSizePref === "Letter" ? PageSizes.Letter : PageSizes.A4;
        page = pdfDoc.addPage([pw, ph]);

        // Fit inside page preserving aspect ratio
        const scaleFactor = Math.min((pw - 60) / imgDims.width, (ph - 60) / imgDims.height, 1);
        const dw = imgDims.width * scaleFactor;
        const dh = imgDims.height * scaleFactor;
        const dx = (pw - dw) / 2;
        const dy = (ph - dh) / 2;

        page.drawImage(img, {
          x: dx,
          y: dy,
          width: dw,
          height: dh,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: "images_to_pdf.pdf",
      pageCount: pdfDoc.getPageCount(),
      originalSize: totalOriginalSize,
      newSize: blob.size,
    };
  }

  if (!files || files.length === 0) {
    throw new Error("No PDF file provided.");
  }

  // PDF Merger
  if (slug === "merge-pdf") {
    const mergedDoc = await PDFDocument.create();
    let totalOriginalSize = 0;

    for (const f of files) {
      totalOriginalSize += f.size;
      const fileBuffer = await f.arrayBuffer();
      const doc = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    const pdfBytes = await mergedDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const outName = (settings.outputName as string) || "merged_document.pdf";
    return {
      blob,
      url,
      filename: outName.endsWith(".pdf") ? outName : `${outName}.pdf`,
      pageCount: mergedDoc.getPageCount(),
      originalSize: totalOriginalSize,
      newSize: blob.size,
    };
  }

  // Single PDF Operations
  const primaryFile = files[0];
  const fileBuffer = await primaryFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const totalPages = pdfDoc.getPageCount();

  if (slug === "split-pdf" || slug === "extract-pdf-pages") {
    const rangeStr = (settings.pageRange || settings.pages || "1").toString().trim();
    const targetDoc = await PDFDocument.create();

    const selectedIndices: number[] = parsePageRange(rangeStr, totalPages);
    if (selectedIndices.length === 0) {
      throw new Error(`Invalid page range "${rangeStr}". Document has ${totalPages} pages.`);
    }

    const copied = await targetDoc.copyPages(pdfDoc, selectedIndices);
    copied.forEach((p) => targetDoc.addPage(p));

    const pdfBytes = await targetDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: `extracted_pages_${rangeStr.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`,
      pageCount: targetDoc.getPageCount(),
      originalSize: primaryFile.size,
      newSize: blob.size,
    };
  }

  if (slug === "delete-pdf-pages") {
    const deleteStr = (settings.pagesToDelete || "1").toString().trim();
    const deleteIndices = new Set(parsePageRange(deleteStr, totalPages));

    const targetDoc = await PDFDocument.create();
    const keepIndices = [];
    for (let i = 0; i < totalPages; i++) {
      if (!deleteIndices.has(i)) {
        keepIndices.push(i);
      }
    }

    if (keepIndices.length === 0) {
      throw new Error("Cannot delete all pages in document.");
    }

    const copied = await targetDoc.copyPages(pdfDoc, keepIndices);
    copied.forEach((p) => targetDoc.addPage(p));

    const pdfBytes = await targetDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: `cleaned_${primaryFile.name}`,
      pageCount: targetDoc.getPageCount(),
      originalSize: primaryFile.size,
      newSize: blob.size,
    };
  }

  if (slug === "rotate-pdf") {
    const angle = Number(settings.rotationAngle) || 90;
    const pages = pdfDoc.getPages();

    for (const p of pages) {
      const currentRot = p.getRotation().angle;
      p.setRotation(degrees((currentRot + angle) % 360));
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: `rotated_${primaryFile.name}`,
      pageCount: totalPages,
      originalSize: primaryFile.size,
      newSize: blob.size,
    };
  }

  if (slug === "add-page-numbers-pdf") {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = Number(settings.fontSize) || 10;
    const startFrom = Number(settings.startFrom) || 1;
    const format = settings.format || "Page {n} of {total}";
    const pos = settings.position || "bottom-center";

    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const pageIndex = i + 1;
      if (pageIndex < startFrom) continue;

      const page = pages[i];
      const { width, height } = page.getSize();
      const text = format
        .replace("{n}", String(pageIndex))
        .replace("{total}", String(totalPages));

      const textWidth = font.widthOfTextAtSize(text, fontSize);

      let x = (width - textWidth) / 2;
      let y = 25;

      if (pos === "bottom-right") x = width - textWidth - 35;
      else if (pos === "top-center") y = height - 30;
      else if (pos === "top-right") {
        x = width - textWidth - 35;
        y = height - 30;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.4),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: `numbered_${primaryFile.name}`,
      pageCount: totalPages,
      originalSize: primaryFile.size,
      newSize: blob.size,
    };
  }

  if (slug === "add-watermark-pdf") {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const text = (settings.watermarkText as string) || "CONFIDENTIAL";
    const opacity = (Number(settings.opacity) || 25) / 100;
    const fontSize = Number(settings.fontSize) || 48;

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      page.drawText(text, {
        x: width / 2 - textWidth / 3,
        y: height / 2,
        size: fontSize,
        font,
        color: rgb(0.6, 0.6, 0.7),
        opacity,
        rotate: degrees(45),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      filename: `watermarked_${primaryFile.name}`,
      pageCount: totalPages,
      originalSize: primaryFile.size,
      newSize: blob.size,
    };
  }

  // Default / Compress PDF
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename: `optimized_${primaryFile.name}`,
    pageCount: totalPages,
    originalSize: primaryFile.size,
    newSize: blob.size,
  };
}

function parsePageRange(rangeStr: string, totalPages: number): number[] {
  const indices: number[] = [];
  const parts = rangeStr.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          indices.push(i - 1);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        indices.push(p - 1);
      }
    }
  }

  return Array.from(new Set(indices));
}
