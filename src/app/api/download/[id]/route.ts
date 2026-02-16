import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { conversionQueue } from "@/lib/queue";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const job = conversionQueue.getJob(id);
    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.token !== token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    if (job.status !== "completed") {
        return NextResponse.json(
            { error: "Conversion not yet completed" },
            { status: 400 }
        );
    }

    if (!fs.existsSync(job.outputPath)) {
        return NextResponse.json(
            { error: "Output file not found — it may have been cleaned up" },
            { status: 404 }
        );
    }

    const fileBuffer = fs.readFileSync(job.outputPath);
    const fileName = path.basename(job.outputPath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Length": fileBuffer.length.toString(),
        },
    });
}
