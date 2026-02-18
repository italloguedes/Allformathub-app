import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export class FFmpegClient {
    private ffmpeg: FFmpeg | null = null;
    private loaded = false;
    private queue: Promise<void> = Promise.resolve();

    async load(onProgress?: (progress: number) => void) {
        if (this.loaded) return;

        this.ffmpeg = new FFmpeg();

        if (onProgress) {
            this.ffmpeg.on("progress", ({ progress }) => {
                onProgress(progress * 100);
            });
        }

        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

        await this.ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });

        this.loaded = true;
    }

    async transcode(
        file: File,
        targetFormat: string,
        onProgress?: (progress: number) => void
    ): Promise<Blob> {
        return this.enqueue(async () => {
            if (!this.loaded || !this.ffmpeg) {
                await this.load(onProgress);
            }

            const ffmpeg = this.ffmpeg!;
            const extension = file.name.includes(".")
                ? file.name.substring(file.name.lastIndexOf("."))
                : "";
            const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            const inputName = `input-${jobId}${extension}`;
            const outputName = `output-${jobId}.${targetFormat}`;

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            try {
                await ffmpeg.exec(["-i", inputName, outputName]);
                const data = await ffmpeg.readFile(outputName);
                const bytes =
                    data instanceof Uint8Array
                        ? data
                        : new TextEncoder().encode(String(data));
                return new Blob([bytes], { type: this.getMimeType(targetFormat) });
            } finally {
                // Best-effort cleanup in ffmpeg virtual FS.
                try {
                    await ffmpeg.deleteFile(inputName);
                } catch {
                    // ignore cleanup errors
                }
                try {
                    await ffmpeg.deleteFile(outputName);
                } catch {
                    // ignore cleanup errors
                }
            }
        });
    }

    private enqueue<T>(task: () => Promise<T>): Promise<T> {
        const run = this.queue.then(task, task);
        this.queue = run.then(
            () => undefined,
            () => undefined
        );
        return run;
    }

    private getMimeType(format: string): string {
        const ext = format.toLowerCase();
        const map: Record<string, string> = {
            mp3: "audio/mpeg",
            wav: "audio/wav",
            ogg: "audio/ogg",
            flac: "audio/flac",
            m4a: "audio/mp4",
            mp4: "video/mp4",
            webm: "video/webm",
            mov: "video/quicktime",
            avi: "video/x-msvideo",
            mkv: "video/x-matroska",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
            bmp: "image/bmp",
            tiff: "image/tiff",
        };
        return map[ext] || "application/octet-stream";
    }
}

export const ffmpegClient = new FFmpegClient();
