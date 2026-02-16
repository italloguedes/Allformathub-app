import { NextRequest, NextResponse } from "next/server";
import { conversionQueue } from "@/lib/queue";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const job = conversionQueue.getJob(id);

    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
        id: job.id,
        status: job.status,
        progress: job.progress,
        error: job.error,
        outputPath: job.status === "completed" ? job.outputPath : undefined,
        token: job.token,
    });
}
