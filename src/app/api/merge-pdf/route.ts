import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { mergeFilesIntoPdf, type MergePdfInputFile } from "@/lib/merge-pdf";
import { getOutputPath } from "@/lib/storage";
import { generateId, sanitizeFilename } from "@/lib/utils";

export const runtime = "nodejs";

interface MergePdfRequestBody {
    files?: MergePdfInputFile[];
    outputName?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as MergePdfRequestBody;
        const files = body.files;

        if (!Array.isArray(files) || files.length === 0) {
            return NextResponse.json(
                { error: "Missing required field: files" },
                { status: 400 }
            );
        }

        const mergeId = generateId();
        const requestedName = body.outputName || "merged-files.pdf";
        const baseName = sanitizeFilename(
            path.basename(requestedName, path.extname(requestedName)) || "merged-files"
        );
        const outputPath = getOutputPath(mergeId, `${baseName}.pdf`);

        await mergeFilesIntoPdf(files, outputPath);

        const fileBuffer = fs.readFileSync(outputPath);
        const fileName = path.basename(outputPath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${fileName}"`,
                "Content-Length": fileBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("Merge PDF error:", error);
        const message = error instanceof Error ? error.message : "Failed to merge files into PDF";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
