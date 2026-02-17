import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export class FFmpegClient {
    private ffmpeg: FFmpeg | null = null;
    private loaded = false;

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
        if (!this.loaded || !this.ffmpeg) {
            await this.load(onProgress);
        }

        const ffmpeg = this.ffmpeg!;
        const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
        const outputName = "output." + targetFormat;

        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // Basic transcoding command
        // You can add more complex flags here based on the target format
        const args = ["-i", inputName, outputName];

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(outputName);
        return new Blob([data], { type: `video/${targetFormat}` });
    }
}

export const ffmpegClient = new FFmpegClient();
