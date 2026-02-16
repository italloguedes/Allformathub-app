import fs from "fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function convertDocument(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string
): Promise<void> {
    const inExt = inputFormat.toLowerCase();
    const outExt = outputFormat.toLowerCase();

    // === Anything → PDF ===
    if (outExt === "pdf") {
        if (isTextBased(inExt)) {
            const content = fs.readFileSync(inputPath, "utf-8");
            const text = inExt === "html" ? htmlToText(content) : inExt === "md" ? htmlToText(markdownToHtml(content)) : content;
            await textToPdf(text, outputPath);
            return;
        }
        // Fallback for DOCX->PDF if libreoffice missing? No, strict error.
        throw new Error(
            `Conversion from .${inExt} to .pdf requires LibreOffice headless. Install it and ensure "libreoffice" is in your PATH.`
        );
    }

    // === PDF → DOCX (Text Extraction Fallback) ===
    if (inExt === "pdf" && outExt === "docx") {
        // Try simple text extraction and creation of docx
        const text = await extractPdfText(inputPath);
        await textToDocx(text, outputPath);
        return;
    }

    // === PDF → text formats ===
    if (inExt === "pdf") {
        if (isTextBased(outExt)) {
            const text = await extractPdfText(inputPath);
            let result: string;
            if (outExt === "html") {
                result = textToHtml(text);
            } else if (outExt === "md") {
                result = text; // Raw text as markdown
            } else {
                result = text;
            }
            fs.writeFileSync(outputPath, result, "utf-8");
            return;
        }
        throw new Error(
            `Conversion from .pdf to .${outExt} requires LibreOffice headless.`
        );
    }

    // === Text-based → DOCX ===
    if (isTextBased(inExt) && outExt === "docx") {
        const content = fs.readFileSync(inputPath, "utf-8");
        const text = inExt === "html" ? htmlToText(content) : inExt === "md" ? htmlToText(markdownToHtml(content)) : content;
        await textToDocx(text, outputPath);
        return;
    }

    // === Text-based ↔ Text-based ===
    if (isTextBased(inExt) && isTextBased(outExt)) {
        const content = fs.readFileSync(inputPath, "utf-8");
        let result: string;

        if (inExt === "md" && outExt === "html") {
            result = markdownToHtml(content);
        } else if (inExt === "html" && outExt === "md") {
            result = htmlToMarkdown(content);
        } else if (inExt === "html" && outExt === "txt") {
            result = htmlToText(content);
        } else if (inExt === "md" && outExt === "txt") {
            result = htmlToText(markdownToHtml(content));
        } else if (inExt === "txt" && outExt === "html") {
            result = textToHtml(content);
        } else if (inExt === "txt" && outExt === "md") {
            result = content;
        } else {
            result = content;
        }

        fs.writeFileSync(outputPath, result, "utf-8");
        return;
    }

    throw new Error(
        `Document conversion from .${inExt} to .${outExt} is not supported.`
    );
}

// --- Text to DOCX (Simple) ---
async function textToDocx(text: string, outputPath: string): Promise<void> {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: text.split("\n").map(line =>
                    new Paragraph({
                        children: [new TextRun(line)],
                        spacing: { after: 200 } // Add some spacing between paragraphs
                    })
                ),
            },
        ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
}

// --- PDF generation from text ---
async function textToPdf(text: string, outputPath: string): Promise<void> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    const margin = 50;
    const pageWidth = 595.28; // A4
    const pageHeight = 841.89;
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = fontSize * 1.4;

    const lines = wrapText(text, font, fontSize, maxWidth);
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    for (const line of lines) {
        if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
        }
        page.drawText(line, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
}

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, fontSize: number, maxWidth: number): string[] {
    const result: string[] = [];
    const paragraphs = text.split("\n");
    for (const paragraph of paragraphs) {
        if (paragraph.trim() === "") {
            result.push("");
            continue;
        }
        const words = paragraph.split(/\s+/);
        let current = "";
        for (const word of words) {
            const test = current ? `${current} ${word}` : word;
            try {
                if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
                    if (current) result.push(current);
                    current = word;
                } else {
                    current = test;
                }
            } catch {
                current = test;
            }
        }
        if (current) result.push(current);
    }
    return result;
}

// --- Extract text from PDF ---
async function extractPdfText(inputPath: string): Promise<string> {
    const bytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(bytes);
    const pages = pdfDoc.getPages();
    const textParts: string[] = [];

    for (const page of pages) {
        const rawContent = page.node.Contents();
        if (rawContent) {
            try {
                const ref = rawContent;
                const lookup = pdfDoc.context.lookup(ref);
                if (lookup && "getContents" in lookup) {
                    const decoded = (lookup as { getContents: () => Uint8Array }).getContents();
                    const str = new TextDecoder("latin1").decode(decoded);
                    const tjMatches = str.match(/\(([^)]*)\)\s*Tj/g);
                    if (tjMatches) {
                        for (const m of tjMatches) {
                            const inner = m.match(/\(([^)]*)\)/);
                            if (inner) textParts.push(inner[1]);
                        }
                    }
                    const tjArrays = str.match(/\[([^\]]*)\]\s*TJ/g);
                    if (tjArrays) {
                        for (const arr of tjArrays) {
                            const items = arr.match(/\(([^)]*)\)/g);
                            if (items) {
                                const line = items.map(i => {
                                    const m = i.match(/\(([^)]*)\)/);
                                    return m ? m[1] : "";
                                }).join("");
                                textParts.push(line);
                            }
                        }
                    }
                }
            } catch {
                // Ignore
            }
        }
        textParts.push("\n");
    }

    const extracted = textParts.join("\n").trim();
    if (!extracted || extracted.replace(/\n/g, "").trim().length === 0) {
        return "(PDF text extraction produced no text. The file may contain scanned images or complex formatting.)";
    }
    return extracted;
}

// --- Helpers ---
function isTextBased(ext: string): boolean {
    return ["txt", "html", "md"].includes(ext);
}

function markdownToHtml(md: string): string {
    let html = md;
    html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/`(.+?)`/g, "<code>$1</code>");
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");
    html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body><p>${html}</p></body></html>`;
    return html;
}

function htmlToMarkdown(html: string): string {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n");
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n");
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n");
    md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
    md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
    md = md.replace(/<code>(.*?)<\/code>/gi, "`$1`");
    md = md.replace(/<br\s*\/?>/gi, "\n");
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
    md = md.replace(/<[^>]+>/g, "");
    md = md.replace(/&amp;/g, "&");
    md = md.replace(/&lt;/g, "<");
    md = md.replace(/&gt;/g, ">");
    md = md.replace(/&nbsp;/g, " ");
    return md.trim();
}

function htmlToText(html: string): string {
    let text = html;
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n\n");
    text = text.replace(/<[^>]+>/g, "");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&nbsp;/g, " ");
    return text.trim();
}

function textToHtml(text: string): string {
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const paragraphs = escaped.split(/\n\n+/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("\n");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body>${paragraphs}</body></html>`;
}

export function isDocumentFormat(ext: string): boolean {
    return ["pdf", "docx", "txt", "rtf", "odt", "html", "md"].includes(ext.toLowerCase());
}
