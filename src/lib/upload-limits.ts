const BYTES_IN_MB = 1024 * 1024;
const DEFAULT_LOCAL_MAX_MB = 100;
const DEFAULT_VERCEL_MAX_MB = 4;

function parsePositiveNumber(raw: string | undefined): number | null {
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return null;
    return value;
}

export function getRuntimeMaxUploadMB(): number {
    const explicitPublic = parsePositiveNumber(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB);
    if (explicitPublic) return explicitPublic;

    const explicitServer = parsePositiveNumber(process.env.MAX_FILE_SIZE_MB);
    if (explicitServer) return explicitServer;

    const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL_ENV;
    if (isVercel) return DEFAULT_VERCEL_MAX_MB;

    const isBrowser = typeof window !== "undefined";
    if (isBrowser && process.env.NODE_ENV !== "development") {
        return DEFAULT_VERCEL_MAX_MB;
    }

    return DEFAULT_LOCAL_MAX_MB;
}

export function getRuntimeMaxUploadBytes(): number {
    return Math.floor(getRuntimeMaxUploadMB() * BYTES_IN_MB);
}
