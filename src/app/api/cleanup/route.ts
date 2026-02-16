import { NextResponse } from "next/server";
import { cleanupExpiredFiles } from "@/lib/storage";

export async function POST() {
    try {
        const cleaned = cleanupExpiredFiles();
        return NextResponse.json({
            cleaned,
            message: `Removed ${cleaned} expired file group(s)`,
        });
    } catch (error) {
        console.error("Cleanup error:", error);
        return NextResponse.json(
            { error: "Cleanup failed" },
            { status: 500 }
        );
    }
}
