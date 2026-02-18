import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { validateFile } from "@/lib/security";
import { sanitizeFilename, generateId } from "@/lib/utils";
import { getStoragePath, writeFile, generateToken } from "@/lib/storage";
import { detectCategory, getFormatInfo } from "@/lib/formats";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        const results = [];

        for (const file of files) {
            const validation = validateFile(file.name, file.size, file.type);
            if (!validation.valid) {
                results.push({
                    name: file.name,
                    error: validation.error,
                });
                continue;
            }

            const fileId = generateId();
            const safeName = sanitizeFilename(file.name);
            const ext = path.extname(safeName).replace(".", "").toLowerCase();
            const storagePath = getStoragePath(fileId, safeName);

            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(storagePath, buffer);

            const category = detectCategory(ext);
            const formatInfo = getFormatInfo(ext);
            const token = generateToken();

            results.push({
                id: fileId,
                name: safeName,
                originalName: file.name,
                size: file.size,
                type: file.type,
                extension: ext,
                category: category,
                formatLabel: formatInfo?.label || ext.toUpperCase(),
                token,
                path: storagePath,
            });
        }

        return NextResponse.json({ files: results });
    } catch (error) {
        console.error("Upload error:", error);
        const message = error instanceof Error ? error.message : "Unknown upload error";
        const status =
            message.toLowerCase().includes("size") ||
            message.toLowerCase().includes("large") ||
            message.toLowerCase().includes("limit")
                ? 413
                : 500;
        return NextResponse.json(
            { error: `Upload failed: ${message}` },
            { status }
        );
    }
}
