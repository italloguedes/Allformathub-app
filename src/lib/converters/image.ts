import sharp from "sharp";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { createCanvas } from "@napi-rs/canvas";

const FORMAT_MAP: Record<string, keyof sharp.FormatEnum> = {
    jpg: "jpeg",
    jpeg: "jpeg",
    png: "png",
    webp: "webp",
    bmp: "png", // sharp doesn't output bmp directly
    tiff: "tiff",
    avif: "avif",
};

export async function convertImage(
    inputPath: string,
    outputPath: string,
    targetFormat: string
): Promise<void> {
    const ext = targetFormat.toLowerCase();

    // Image → PDF
    if (ext === "pdf") {
        await imageToPdf(inputPath, outputPath);
        return;
    }

    // PDF → Image (first page preview style)
    if (inputPath.toLowerCase().endsWith(".pdf")) {
        await pdfToImage(inputPath, outputPath, ext);
        return;
    }

    let pipeline = sharp(inputPath);

    if (ext === "ico") {
        pipeline = pipeline.resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
        await pipeline.png().toFile(outputPath);
        return;
    }

    if (ext === "bmp") {
        await pipeline.png().toFile(outputPath);
        return;
    }

    const sharpFormat = FORMAT_MAP[ext];
    if (!sharpFormat) {
        throw new Error(`Unsupported image format: ${ext}`);
    }

    await pipeline.toFormat(sharpFormat).toFile(outputPath);
}

async function imageToPdf(inputPath: string, outputPath: string): Promise<void> {
    const pngBuffer = await sharp(inputPath).png().toBuffer();
    const metadata = await sharp(inputPath).metadata();

    const imgWidth = metadata.width || 595;
    const imgHeight = metadata.height || 842;

    const margin = 40;
    const maxW = 595 - margin * 2;
    const maxH = 842 - margin * 2;

    let scale = 1;
    if (imgWidth > maxW || imgHeight > maxH) {
        scale = Math.min(maxW / imgWidth, maxH / imgHeight);
    }
    const w = imgWidth * scale;
    const h = imgHeight * scale;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const pngImage = await pdfDoc.embedPng(pngBuffer);
    page.drawImage(pngImage, {
        x: (595 - w) / 2,
        y: (842 - h) / 2,
        width: w,
        height: h,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
}

async function pdfToImage(inputPath: string, outputPath: string, targetFormat: string): Promise<void> {
    const ext = targetFormat.toLowerCase();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const workerPath = path.join(
        process.cwd(),
        "node_modules",
        "pdfjs-dist",
        "legacy",
        "build",
        "pdf.worker.mjs"
    );
    if (fs.existsSync(workerPath)) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
    }

    const pdfBytes = fs.readFileSync(inputPath);
    const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(pdfBytes),
        isEvalSupported: false,
        useSystemFonts: true,
    });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });

    const width = Math.max(1, Math.ceil(viewport.width));
    const height = Math.max(1, Math.ceil(viewport.height));
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    await page.render({
        canvas: null,
        canvasContext: ctx as unknown as CanvasRenderingContext2D,
        viewport,
    }).promise;

    const buffer = canvas.toBuffer("image/png");

    const pipeline = sharp(buffer);

    if (ext === "bmp") {
        await pipeline.png().toFile(outputPath);
        return;
    }

    if (ext === "ico") {
        await pipeline
            .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(outputPath);
        return;
    }

    const sharpFormat = FORMAT_MAP[ext];
    if (!sharpFormat) {
        // Safe fallback to PNG
        await pipeline.png().toFile(outputPath);
        return;
    }

    await pipeline.toFormat(sharpFormat).toFile(outputPath);
}

export function isImageFormat(ext: string): boolean {
    const imageFormats = ["jpg", "jpeg", "png", "webp", "svg", "bmp", "tiff", "ico", "avif"];
    return imageFormats.includes(ext.toLowerCase());
}
