import path from "path";

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "100", 10) * 1024 * 1024;

const BLOCKED_EXTENSIONS = new Set([
    "exe", "bat", "cmd", "com", "msi", "scr", "pif",
    "vbs", "vbe", "js", "jse", "wsf", "wsh", "ps1",
    "sh", "csh", "ksh", "dll", "sys", "drv",
]);

const ALLOWED_MIME_PREFIXES = [
    "image/", "audio/", "video/", "text/",
    "application/pdf",
    "application/zip",
    "application/gzip",
    "application/x-tar",
    "application/vnd.openxmlformats",
    "application/vnd.oasis.opendocument",
    "application/rtf",
    "application/octet-stream",
];

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export function validateFileSize(size: number): ValidationResult {
    if (size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File exceeds maximum size of ${process.env.MAX_FILE_SIZE_MB || 100}MB`,
        };
    }
    return { valid: true };
}

export function validateMimeType(mimeType: string): ValidationResult {
    const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) =>
        mimeType.startsWith(prefix)
    );
    if (!isAllowed) {
        return {
            valid: false,
            error: `File type "${mimeType}" is not supported`,
        };
    }
    return { valid: true };
}

export function validateExtension(filename: string): ValidationResult {
    const ext = path.extname(filename).toLowerCase().replace(".", "");
    if (BLOCKED_EXTENSIONS.has(ext)) {
        return {
            valid: false,
            error: `File extension ".${ext}" is blocked for security reasons`,
        };
    }
    return { valid: true };
}

export function validateFile(
    filename: string,
    size: number,
    mimeType: string
): ValidationResult {
    const checks = [
        validateFileSize(size),
        validateMimeType(mimeType),
        validateExtension(filename),
    ];
    for (const check of checks) {
        if (!check.valid) return check;
    }
    return { valid: true };
}

export function getMaxFileSizeMB(): number {
    return parseInt(process.env.MAX_FILE_SIZE_MB || "100", 10);
}
