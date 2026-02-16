import archiver from "archiver";
import fs from "fs";
import path from "path";

export async function createArchive(
    inputPaths: string[],
    outputPath: string,
    format: "zip" | "tar"
): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver(format, {
            zlib: { level: 9 },
        });

        output.on("close", resolve);
        archive.on("error", reject);

        archive.pipe(output);

        for (const filePath of inputPaths) {
            archive.file(filePath, { name: path.basename(filePath) });
        }

        archive.finalize();
    });
}

export async function convertArchive(
    inputPath: string,
    outputPath: string,
    targetFormat: string
): Promise<void> {
    const ext = targetFormat.toLowerCase();

    if (ext === "zip" || ext === "tar") {
        await createArchive([inputPath], outputPath, ext as "zip" | "tar");
        return;
    }

    if (ext === "gz") {
        // gzip the input file
        const { createGzip } = await import("zlib");
        return new Promise((resolve, reject) => {
            const input = fs.createReadStream(inputPath);
            const output = fs.createWriteStream(outputPath);
            const gzip = createGzip();
            input.pipe(gzip).pipe(output);
            output.on("close", resolve);
            output.on("error", reject);
        });
    }

    throw new Error(`Unsupported archive format: ${ext}`);
}

export function isArchiveFormat(ext: string): boolean {
    return ["zip", "tar", "gz"].includes(ext.toLowerCase());
}
