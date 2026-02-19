import fs from "fs";
import os from "os";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { convert } from "@/lib/converter";
import { sanitizeFilename } from "@/lib/utils";

export interface MergePdfInputFile {
    inputPath: string;
    inputFormat: string;
    fileName?: string;
}

export async function mergeFilesIntoPdf(
    files: MergePdfInputFile[],
    outputPath: string
): Promise<void> {
    if (!Array.isArray(files) || files.length === 0) {
        throw new Error("At least one file is required to merge into PDF");
    }

    const merged = await PDFDocument.create();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "merge-pdf-"));

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const sourcePdfPath = await ensurePdfSource(file, tempDir, i);
            const sourceBytes = fs.readFileSync(sourcePdfPath);
            const sourcePdf = await PDFDocument.load(sourceBytes);
            const pageIndices = sourcePdf.getPageIndices();
            const copiedPages = await merged.copyPages(sourcePdf, pageIndices);
            for (const page of copiedPages) {
                merged.addPage(page);
            }
        }

        const mergedBytes = await merged.save();
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, Buffer.from(mergedBytes));
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function ensurePdfSource(
    file: MergePdfInputFile,
    tempDir: string,
    index: number
): Promise<string> {
    const inputPath = file.inputPath;
    const inputFormat = (file.inputFormat || "").toLowerCase().replace(".", "");
    const fileName = file.fileName || path.basename(inputPath || `file-${index + 1}`);

    if (!inputPath || !inputFormat) {
        const placeholder = path.join(tempDir, `${index}-missing.pdf`);
        await createFallbackPdf(placeholder, fileName, inputFormat || "unknown", "Missing input data");
        return placeholder;
    }

    if (!fs.existsSync(inputPath)) {
        const placeholder = path.join(tempDir, `${index}-not-found.pdf`);
        await createFallbackPdf(placeholder, fileName, inputFormat, "Input file not found on server");
        return placeholder;
    }

    if (inputFormat === "pdf") {
        return inputPath;
    }

    const safeBase = sanitizeFilename(path.basename(fileName, path.extname(fileName)) || `file-${index + 1}`);
    const tempPdfPath = path.join(tempDir, `${index}-${safeBase}.pdf`);

    try {
        await convert(inputPath, tempPdfPath, inputFormat, "pdf");
        return tempPdfPath;
    } catch (error) {
        const reason = error instanceof Error ? error.message : "Unsupported format for direct PDF conversion";
        await createFallbackPdf(tempPdfPath, fileName, inputFormat, reason);
        return tempPdfPath;
    }
}

async function createFallbackPdf(
    outputPath: string,
    fileName: string,
    inputFormat: string,
    reason: string
): Promise<void> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let y = 780;
    const left = 50;
    const lineHeight = 20;

    page.drawText("File included as placeholder", {
        x: left,
        y,
        size: 20,
        font: bold,
        color: rgb(0.12, 0.12, 0.12),
    });
    y -= 40;

    page.drawText(`Name: ${fileName}`, {
        x: left,
        y,
        size: 12,
        font,
        color: rgb(0.15, 0.15, 0.15),
    });
    y -= lineHeight;

    page.drawText(`Format: .${inputFormat || "unknown"}`, {
        x: left,
        y,
        size: 12,
        font,
        color: rgb(0.15, 0.15, 0.15),
    });
    y -= lineHeight * 2;

    const wrapped = wrapText(reason, 72);
    for (const line of wrapped) {
        page.drawText(line, {
            x: left,
            y,
            size: 11,
            font,
            color: rgb(0.35, 0.1, 0.1),
        });
        y -= 16;
        if (y < 60) break;
    }

    const bytes = await pdf.save();
    fs.writeFileSync(outputPath, Buffer.from(bytes));
}

function wrapText(text: string, width: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return ["No details available"];

    const lines: string[] = [];
    let current = "";

    for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length > width && current) {
            lines.push(current);
            current = word;
            continue;
        }
        current = next;
    }
    if (current) lines.push(current);

    return lines;
}
