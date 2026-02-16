import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_DIR = process.env.STORAGE_DIR || "./storage/temp";
const CLEANUP_MINUTES = parseInt(process.env.CLEANUP_INTERVAL_MINUTES || "30", 10);

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function getStoragePath(fileId: string, filename: string): string {
    const dir = path.join(STORAGE_DIR, fileId);
    ensureDir(dir);
    return path.join(dir, filename);
}

export function getOutputPath(fileId: string, filename: string): string {
    const dir = path.join(STORAGE_DIR, fileId, "output");
    ensureDir(dir);
    return path.join(dir, filename);
}

export async function writeFile(filePath: string, data: Buffer): Promise<void> {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, data);
}

export async function readFile(filePath: string): Promise<Buffer> {
    return fs.readFileSync(filePath);
}

export function fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
}

export function deleteDir(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
}

export function generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

export function cleanupExpiredFiles(): number {
    ensureDir(STORAGE_DIR);
    const now = Date.now();
    const cutoff = CLEANUP_MINUTES * 60 * 1000;
    let cleaned = 0;

    const entries = fs.readdirSync(STORAGE_DIR, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const dirPath = path.join(STORAGE_DIR, entry.name);
            const stat = fs.statSync(dirPath);
            if (now - stat.mtimeMs > cutoff) {
                deleteDir(dirPath);
                cleaned++;
            }
        }
    }
    return cleaned;
}
