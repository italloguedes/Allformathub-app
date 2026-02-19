"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Download, Eye, FileText, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/file-dropzone";
import { useLocale } from "@/components/locale-provider";
import { formatBytes, sanitizeFilename } from "@/lib/utils";
import { getRuntimeMaxUploadBytes, getRuntimeMaxUploadMB } from "@/lib/upload-limits";

interface MergeEntry {
    id: string;
    file: File;
    name: string;
    size: number;
    extension: string;
    error: string | null;
}

interface UploadedFileData {
    path: string;
    extension: string;
    name?: string;
}

async function parseJsonSafely(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") || "";
    const bodyText = await response.text();

    if (!bodyText) return {};
    if (contentType.toLowerCase().includes("application/json")) {
        try {
            return JSON.parse(bodyText);
        } catch {
            return {};
        }
    }

    try {
        return JSON.parse(bodyText);
    } catch {
        return { error: bodyText };
    }
}

async function fetchWithRetry(
    input: RequestInfo | URL,
    init: RequestInit,
    retries = 2,
    delayMs = 400
): Promise<Response> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(input, init);
            if (response.status >= 500 && attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }
            return response;
        } catch (error) {
            lastError = error;
            if (attempt < retries) {
                await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
                continue;
            }
        }
    }
    throw lastError instanceof Error ? lastError : new Error("Network request failed");
}

export default function MergePdfWorkspace() {
    const { t } = useLocale();
    const [entries, setEntries] = useState<MergeEntry[]>([]);
    const [previewId, setPreviewId] = useState<string | null>(null);
    const [outputName, setOutputName] = useState("merged-files.pdf");
    const [isMerging, setIsMerging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mergedUrl, setMergedUrl] = useState<string | null>(null);
    const [mergedName, setMergedName] = useState("merged-files.pdf");

    const handleFilesSelected = useCallback((uploadedFiles: File[]) => {
        const maxUploadBytes = getRuntimeMaxUploadBytes();
        const maxUploadMb = getRuntimeMaxUploadMB();

        const nextEntries = uploadedFiles.map((f) => {
            const extension = f.name.split(".").pop()?.toLowerCase() || "";
            const tooLarge = f.size > maxUploadBytes;
            return {
                id: Math.random().toString(36).slice(2, 10),
                file: f,
                name: f.name,
                size: f.size,
                extension,
                error: tooLarge
                    ? `File exceeds upload limit of ${maxUploadMb}MB (${formatBytes(f.size)} selected)`
                    : null,
            };
        });

        setEntries((prev) => {
            const merged = [...prev, ...nextEntries];
            if (!previewId && merged.length > 0) {
                setPreviewId(merged[0].id);
            }
            return merged;
        });
    }, [previewId]);

    const validEntries = entries.filter((e) => !e.error);
    const canMerge = validEntries.length > 1;
    const selected = entries.find((e) => e.id === previewId) || entries[0] || null;

    const previewUrl = useMemo(() => {
        if (!selected) return null;
        return URL.createObjectURL(selected.file);
    }, [selected]);

    const moveEntry = useCallback((id: string, direction: -1 | 1) => {
        setEntries((prev) => {
            const index = prev.findIndex((e) => e.id === id);
            if (index < 0) return prev;
            const nextIndex = index + direction;
            if (nextIndex < 0 || nextIndex >= prev.length) return prev;
            const next = [...prev];
            const [item] = next.splice(index, 1);
            next.splice(nextIndex, 0, item);
            return next;
        });
    }, []);

    const removeEntry = useCallback((id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setPreviewId((prev) => (prev === id ? null : prev));
    }, []);

    const uploadFileForServer = useCallback(async (entry: MergeEntry): Promise<UploadedFileData> => {
        const upload = new FormData();
        upload.append("files", entry.file);
        const uploadRes = await fetchWithRetry("/api/upload", {
            method: "POST",
            body: upload,
        });
        const uploadBody = await parseJsonSafely(uploadRes) as {
            error?: string;
            files?: Array<{
                path?: string;
                extension?: string;
                name?: string;
                error?: string;
            }>;
        };
        if (!uploadRes.ok) {
            throw new Error(uploadBody?.error || `Upload failed (${uploadRes.status})`);
        }

        const uploaded = uploadBody?.files?.[0];
        if (!uploaded || uploaded.error || !uploaded.path || !uploaded.extension) {
            throw new Error(uploaded?.error || "Invalid upload response");
        }

        return { path: uploaded.path, extension: uploaded.extension, name: uploaded.name };
    }, []);

    const mergeNow = useCallback(() => {
        void (async () => {
            if (!canMerge) return;

            setError(null);
            setIsMerging(true);
            if (mergedUrl) {
                URL.revokeObjectURL(mergedUrl);
                setMergedUrl(null);
            }

            try {
                const orderedValid = entries.filter((e) => !e.error);
                const uploaded: UploadedFileData[] = [];
                for (const entry of orderedValid) {
                    uploaded.push(await uploadFileForServer(entry));
                }

                const safeBase = sanitizeFilename(outputName.trim() || "merged-files");
                const normalizedName = safeBase.toLowerCase().endsWith(".pdf") ? safeBase : `${safeBase}.pdf`;

                const res = await fetch("/api/merge-pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        outputName: normalizedName,
                        files: uploaded.map((u, index) => ({
                            inputPath: u.path,
                            inputFormat: u.extension,
                            fileName: entries.filter((e) => !e.error)[index]?.name || u.name || `file-${index + 1}`,
                        })),
                    }),
                });

                if (!res.ok) {
                    const body = await parseJsonSafely(res) as { error?: string };
                    throw new Error(body?.error || "Failed to merge files into PDF");
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setMergedUrl(url);
                setMergedName(normalizedName);
            } catch (e) {
                setError(e instanceof Error ? e.message : t.failed);
            } finally {
                setIsMerging(false);
            }
        })();
    }, [canMerge, entries, mergedUrl, outputName, t.failed, uploadFileForServer]);

    const downloadMerged = useCallback(() => {
        if (!mergedUrl) return;
        const a = document.createElement("a");
        a.href = mergedUrl;
        a.download = mergedName;
        a.click();
    }, [mergedName, mergedUrl]);

    const mimeType = selected?.file.type || "";
    const isImage = mimeType.startsWith("image/");
    const isAudio = mimeType.startsWith("audio/");
    const isVideo = mimeType.startsWith("video/");
    const isPdf = mimeType === "application/pdf" || selected?.extension === "pdf";

    return (
        <div className="max-w-screen-xl mx-auto space-y-6">
            <FileDropzone onFilesSelected={handleFilesSelected} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                            {t.outputPdfName}
                        </label>
                        <input
                            value={outputName}
                            onChange={(e) => setOutputName(e.target.value)}
                            className="w-full h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 text-sm bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                            placeholder="merged-files.pdf"
                        />
                    </div>

                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
                        {entries.length === 0 && (
                            <div className="p-4 text-sm text-neutral-500 dark:text-neutral-500">
                                {t.supportedFormatsHint}
                            </div>
                        )}
                        {entries.map((entry, index) => (
                            <div key={entry.id} className="p-3 flex items-center gap-2">
                                <button
                                    onClick={() => setPreviewId(entry.id)}
                                    className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                                    title={t.preview}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-800 dark:text-neutral-200 truncate">
                                        {index + 1}. {entry.name}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                        {entry.extension.toUpperCase()} - {formatBytes(entry.size)}
                                    </p>
                                    {entry.error && (
                                        <p className="text-xs text-red-500 dark:text-red-400">{entry.error}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => moveEntry(entry.id, -1)}
                                    disabled={index === 0}
                                    className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={t.moveUp}
                                >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => moveEntry(entry.id, 1)}
                                    disabled={index === entries.length - 1}
                                    className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={t.moveDown}
                                >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => removeEntry(entry.id)}
                                    className="px-2 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    x
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={mergeNow}
                            disabled={!canMerge || isMerging}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isMerging ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {isMerging ? t.merging : t.mergeToPdf}
                        </button>
                        {mergedUrl && (
                            <button
                                onClick={downloadMerged}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-green-300 dark:border-green-900 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                            >
                                <Download className="h-4 w-4" />
                                {t.downloadMergedPdf}
                            </button>
                        )}
                    </div>

                    {!canMerge && entries.length > 0 && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">{t.mergeRequireTwo}</p>
                    )}
                    {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
                </div>

                <div>
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">{t.preview}</p>
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 min-h-[420px] p-3 flex items-center justify-center">
                        {!selected || !previewUrl ? (
                            <p className="text-sm text-neutral-500 dark:text-neutral-500">{t.noPreview}</p>
                        ) : isImage ? (
                            <img src={previewUrl} alt={selected.name} className="max-h-[420px] max-w-full object-contain rounded" />
                        ) : isAudio ? (
                            <audio controls className="w-full">
                                <source src={previewUrl} type={mimeType} />
                            </audio>
                        ) : isVideo ? (
                            <video controls className="max-h-[420px] max-w-full rounded">
                                <source src={previewUrl} type={mimeType} />
                            </video>
                        ) : isPdf ? (
                            <iframe src={previewUrl} className="w-full h-[440px] rounded bg-white" title={selected.name} />
                        ) : (
                            <div className="text-center">
                                <FileText className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                                <p className="text-sm text-neutral-500 dark:text-neutral-500">{t.noPreview}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
