import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

let ffmpegPath: string;
try {
    ffmpegPath = require("ffmpeg-static") as string;
} catch {
    ffmpegPath = "ffmpeg";
}

const VIDEO_CODEC_MAP: Record<string, { vcodec: string; acodec: string; extraArgs: string[] }> = {
    mp4: { vcodec: "libx264", acodec: "aac", extraArgs: ["-preset", "fast", "-crf", "23"] },
    webm: { vcodec: "libvpx-vp9", acodec: "libopus", extraArgs: ["-crf", "30", "-b:v", "0"] },
    mov: { vcodec: "libx264", acodec: "aac", extraArgs: ["-preset", "fast"] },
    avi: { vcodec: "mpeg4", acodec: "mp3", extraArgs: ["-q:v", "5"] },
    mkv: { vcodec: "libx264", acodec: "aac", extraArgs: ["-preset", "fast", "-crf", "23"] },
};

export async function convertVideo(
    inputPath: string,
    outputPath: string,
    targetFormat: string
): Promise<void> {
    const ext = targetFormat.toLowerCase();
    const config = VIDEO_CODEC_MAP[ext];
    if (!config) {
        throw new Error(`Unsupported video format: ${ext}`);
    }

    const args = [
        "-i", inputPath,
        "-vcodec", config.vcodec,
        "-acodec", config.acodec,
        ...config.extraArgs,
        "-y",
        outputPath,
    ];

    try {
        await execFileAsync(ffmpegPath || "ffmpeg", args, { timeout: 600000 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("ENOENT")) {
            throw new Error(
                "ffmpeg not found. Install ffmpeg and ensure it is in your PATH, or install ffmpeg-static."
            );
        }
        throw new Error(`Video conversion failed: ${msg}`);
    }
}

export function isVideoFormat(ext: string): boolean {
    return ["mp4", "webm", "mov", "avi", "mkv"].includes(ext.toLowerCase());
}
