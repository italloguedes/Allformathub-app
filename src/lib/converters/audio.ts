import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

let ffmpegPath: string;
try {
    ffmpegPath = require("ffmpeg-static") as string;
} catch {
    ffmpegPath = "ffmpeg";
}

const CODEC_MAP: Record<string, { codec: string; extraArgs: string[] }> = {
    mp3: { codec: "libmp3lame", extraArgs: ["-q:a", "2"] },
    wav: { codec: "pcm_s16le", extraArgs: [] },
    ogg: { codec: "libvorbis", extraArgs: ["-q:a", "4"] },
    flac: { codec: "flac", extraArgs: [] },
    m4a: { codec: "aac", extraArgs: ["-b:a", "192k"] },
};

export async function convertAudio(
    inputPath: string,
    outputPath: string,
    targetFormat: string
): Promise<void> {
    const ext = targetFormat.toLowerCase();
    const config = CODEC_MAP[ext];
    if (!config) {
        throw new Error(`Unsupported audio format: ${ext}`);
    }

    const args = [
        "-i", inputPath,
        "-vn",
        "-acodec", config.codec,
        ...config.extraArgs,
        "-y",
        outputPath,
    ];

    try {
        await execFileAsync(ffmpegPath || "ffmpeg", args, { timeout: 300000 });
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("ENOENT")) {
            throw new Error(
                "ffmpeg not found. Install ffmpeg and ensure it is in your PATH, or install ffmpeg-static."
            );
        }
        throw new Error(`Audio conversion failed: ${msg}`);
    }
}

export function isAudioFormat(ext: string): boolean {
    return ["mp3", "wav", "ogg", "flac", "m4a"].includes(ext.toLowerCase());
}
