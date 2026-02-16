import { convertImage, isImageFormat } from "./converters/image";
import { convertDocument, isDocumentFormat } from "./converters/document";
import { convertAudio, isAudioFormat } from "./converters/audio";
import { convertVideo, isVideoFormat } from "./converters/video";
import { convertArchive, isArchiveFormat } from "./converters/archive";
import { detectCategory } from "./formats";

export async function convert(
    inputPath: string,
    outputPath: string,
    inputFormat: string,
    outputFormat: string
): Promise<void> {
    const inExt = inputFormat.toLowerCase().replace(".", "");
    const outExt = outputFormat.toLowerCase().replace(".", "");
    const inCategory = detectCategory(inExt);

    if (!inCategory) {
        throw new Error(`Unknown input format: .${inExt}`);
    }

    // Cross-category: PDF → Image
    if (inExt === "pdf" && isImageFormat(outExt)) {
        await convertImage(inputPath, outputPath, outExt);
        return;
    }

    // Cross-category: Image → PDF
    if (inCategory === "image" && outExt === "pdf") {
        await convertImage(inputPath, outputPath, outExt);
        return;
    }

    // Cross-category: PDF → document formats (DOCX included)
    if (inExt === "pdf" && isDocumentFormat(outExt)) {
        await convertDocument(inputPath, outputPath, inExt, outExt);
        return;
    }

    // Cross-category: Video → Audio (MP4 -> MP3 etc)
    if (inCategory === "video" && isAudioFormat(outExt)) {
        await convertAudio(inputPath, outputPath, outExt);
        return;
    }

    // Cross-category: Spreadsheet → PDF/DOCX
    if (inCategory === "spreadsheet" && (outExt === "pdf" || outExt === "docx")) {
        // CSV → PDF/DOCX: read as text, generate doc
        if (inExt === "csv") {
            await convertDocument(inputPath, outputPath, "txt", outExt);
            return;
        }
        throw new Error(
            `Spreadsheet conversion from .${inExt} to .${outExt} requires LibreOffice headless.`
        );
    }

    // Cross-category: Document → PDF/Image
    if (inCategory === "document" && outExt === "pdf") {
        await convertDocument(inputPath, outputPath, inExt, outExt);
        return;
    }

    // Same category routing
    switch (inCategory) {
        case "image":
            await convertImage(inputPath, outputPath, outExt);
            break;
        case "document":
            await convertDocument(inputPath, outputPath, inExt, outExt);
            break;
        case "spreadsheet":
            if (inExt === "csv" && outExt === "csv") {
                throw new Error("Input and output format are the same");
            }
            throw new Error(
                `Spreadsheet conversion from .${inExt} to .${outExt} requires LibreOffice headless.`
            );
        case "audio":
            await convertAudio(inputPath, outputPath, outExt);
            break;
        case "video":
            await convertVideo(inputPath, outputPath, outExt);
            break;
        case "archive":
            await convertArchive(inputPath, outputPath, outExt);
            break;
        default:
            throw new Error(`Conversion not supported for category: ${inCategory}`);
    }
}
