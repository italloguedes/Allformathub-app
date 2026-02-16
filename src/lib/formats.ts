export type FormatCategory = "image" | "document" | "spreadsheet" | "audio" | "video" | "archive";

export interface FormatInfo {
    extension: string;
    label: string;
    mimeType: string;
    category: FormatCategory;
}

export const FORMAT_REGISTRY: FormatInfo[] = [
    // Images
    { extension: "jpg", label: "JPEG", mimeType: "image/jpeg", category: "image" },
    { extension: "jpeg", label: "JPEG", mimeType: "image/jpeg", category: "image" },
    { extension: "png", label: "PNG", mimeType: "image/png", category: "image" },
    { extension: "webp", label: "WebP", mimeType: "image/webp", category: "image" },
    { extension: "svg", label: "SVG", mimeType: "image/svg+xml", category: "image" },
    { extension: "bmp", label: "BMP", mimeType: "image/bmp", category: "image" },
    { extension: "tiff", label: "TIFF", mimeType: "image/tiff", category: "image" },
    { extension: "ico", label: "ICO", mimeType: "image/x-icon", category: "image" },
    { extension: "avif", label: "AVIF", mimeType: "image/avif", category: "image" },

    // Documents
    { extension: "pdf", label: "PDF", mimeType: "application/pdf", category: "document" },
    { extension: "txt", label: "Plain Text", mimeType: "text/plain", category: "document" },
    { extension: "html", label: "HTML", mimeType: "text/html", category: "document" },
    { extension: "md", label: "Markdown", mimeType: "text/markdown", category: "document" },
    { extension: "docx", label: "DOCX", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", category: "document" },
    { extension: "rtf", label: "RTF", mimeType: "application/rtf", category: "document" },
    { extension: "odt", label: "ODT", mimeType: "application/vnd.oasis.opendocument.text", category: "document" },

    // Spreadsheets
    { extension: "csv", label: "CSV", mimeType: "text/csv", category: "spreadsheet" },
    { extension: "xlsx", label: "Excel", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", category: "spreadsheet" },
    { extension: "ods", label: "ODS", mimeType: "application/vnd.oasis.opendocument.spreadsheet", category: "spreadsheet" },

    // Audio
    { extension: "mp3", label: "MP3", mimeType: "audio/mpeg", category: "audio" },
    { extension: "wav", label: "WAV", mimeType: "audio/wav", category: "audio" },
    { extension: "ogg", label: "OGG", mimeType: "audio/ogg", category: "audio" },
    { extension: "flac", label: "FLAC", mimeType: "audio/flac", category: "audio" },
    { extension: "m4a", label: "M4A", mimeType: "audio/mp4", category: "audio" },

    // Video
    { extension: "mp4", label: "MP4", mimeType: "video/mp4", category: "video" },
    { extension: "webm", label: "WebM", mimeType: "video/webm", category: "video" },
    { extension: "mov", label: "MOV", mimeType: "video/quicktime", category: "video" },
    { extension: "avi", label: "AVI", mimeType: "video/x-msvideo", category: "video" },
    { extension: "mkv", label: "MKV", mimeType: "video/x-matroska", category: "video" },

    // Archives
    { extension: "zip", label: "ZIP", mimeType: "application/zip", category: "archive" },
    { extension: "tar", label: "TAR", mimeType: "application/x-tar", category: "archive" },
    { extension: "gz", label: "GZIP", mimeType: "application/gzip", category: "archive" },
];

const EXTENSION_CONVERSION_MAP: Record<string, string[]> = {
    // Images
    jpg: ["png", "webp", "bmp", "tiff", "ico", "avif", "pdf"],
    jpeg: ["png", "webp", "bmp", "tiff", "ico", "avif", "pdf"],
    png: ["jpg", "webp", "bmp", "tiff", "ico", "avif", "pdf"],
    webp: ["jpg", "png", "bmp", "tiff", "ico", "avif", "pdf"],
    bmp: ["jpg", "png", "webp", "tiff", "ico", "avif", "pdf"],
    tiff: ["jpg", "png", "webp", "bmp", "ico", "avif", "pdf"],
    ico: ["jpg", "png", "webp", "bmp", "tiff", "avif", "pdf"],
    avif: ["jpg", "png", "webp", "bmp", "tiff", "ico", "pdf"],
    svg: ["jpg", "png", "webp", "bmp", "tiff", "avif", "pdf"],

    // Documents - PDF can go to ANY image format + doc formats
    pdf: ["txt", "html", "md", "docx", "rtf", "odt", "jpg", "png", "webp", "tiff", "bmp"],
    txt: ["html", "md", "pdf", "docx"],
    html: ["txt", "md", "pdf", "docx"],
    md: ["txt", "html", "pdf", "docx"],
    docx: ["pdf", "txt", "html", "md"],
    rtf: ["pdf", "txt", "html", "md", "docx"],
    odt: ["pdf", "txt", "html", "md", "docx"],

    // Spreadsheets
    csv: ["xlsx", "pdf", "docx"],
    xlsx: ["csv", "pdf"],
    ods: ["csv", "pdf"],

    // Audio
    mp3: ["wav", "ogg", "flac", "m4a"],
    wav: ["mp3", "ogg", "flac", "m4a"],
    ogg: ["mp3", "wav", "flac", "m4a"],
    flac: ["mp3", "wav", "ogg", "m4a"],
    m4a: ["mp3", "wav", "ogg", "flac"],

    // Video
    mp4: ["webm", "mov", "avi", "mkv", "mp3"], // Video to Audio
    webm: ["mp4", "mov", "avi", "mkv", "mp3"],
    mov: ["mp4", "webm", "avi", "mkv", "mp3"],
    avi: ["mp4", "webm", "mov", "mkv", "mp3"],
    mkv: ["mp4", "webm", "mov", "avi", "mp3"],

    // Archives
    zip: ["tar", "gz"],
    tar: ["zip", "gz"],
    gz: ["zip", "tar"],
};

export function detectCategory(extension: string): FormatCategory | null {
    const ext = extension.toLowerCase().replace(".", "");
    const format = FORMAT_REGISTRY.find((f) => f.extension === ext);
    return format?.category ?? null;
}

export function getValidOutputFormats(inputExtension: string): FormatInfo[] {
    const ext = inputExtension.toLowerCase().replace(".", "");
    const validExtensions = EXTENSION_CONVERSION_MAP[ext] || [];
    if (validExtensions.length === 0) return [];
    return FORMAT_REGISTRY.filter(
        (f) => validExtensions.includes(f.extension) && f.extension !== ext
    ).filter(
        (f, i, arr) => arr.findIndex((a) => a.extension === f.extension) === i
    );
}

export function getFormatInfo(extension: string): FormatInfo | undefined {
    const ext = extension.toLowerCase().replace(".", "");
    return FORMAT_REGISTRY.find((f) => f.extension === ext);
}

export function getCategoryLabel(category: FormatCategory): string {
    const labels: Record<FormatCategory, string> = {
        image: "Image",
        document: "Document",
        spreadsheet: "Spreadsheet",
        audio: "Audio",
        video: "Video",
        archive: "Archive",
    };
    return labels[category];
}
