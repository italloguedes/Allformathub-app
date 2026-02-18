import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { conversionQueue, type ConversionJob } from "@/lib/queue";
import { convert } from "@/lib/converter";
import { getOutputPath, generateToken } from "@/lib/storage";
import { generateId, sanitizeFilename } from "@/lib/utils";

export const runtime = "nodejs";

// Initialize the processor
conversionQueue.setProcessor(async (job: ConversionJob) => {
    await convert(job.inputPath, job.outputPath, job.inputFormat, job.outputFormat);
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileId, fileName, inputPath, inputFormat, outputFormat, token } = body;

        if (!fileId || !inputPath || !inputFormat || !outputFormat) {
            return NextResponse.json(
                { error: "Missing required fields: fileId, inputPath, inputFormat, outputFormat" },
                { status: 400 }
            );
        }

        const jobId = generateId();
        const baseName = path.basename(fileName || "file", path.extname(fileName || "file"));
        const outputFileName = sanitizeFilename(`${baseName}.${outputFormat}`);
        const outputPath = getOutputPath(fileId, outputFileName);
        const jobToken = generateToken();

        const job: ConversionJob = {
            id: jobId,
            fileId,
            inputPath,
            outputPath,
            inputFormat: inputFormat.replace(".", ""),
            outputFormat: outputFormat.replace(".", ""),
            status: "queued",
            progress: 0,
            token: jobToken,
            createdAt: Date.now(),
        };

        conversionQueue.addJob(job);

        return NextResponse.json({
            jobId,
            status: "queued",
            token: jobToken,
        });
    } catch (error) {
        console.error("Conversion error:", error);
        return NextResponse.json(
            { error: "Failed to queue conversion" },
            { status: 500 }
        );
    }
}
