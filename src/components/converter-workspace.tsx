"use client";

import { useState, useCallback, useEffect } from "react";
import { FileDropzone } from "@/components/file-dropzone";
import { FormatSelector } from "@/components/format-selector";
import { formatBytes } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { ffmpegClient } from "@/lib/ffmpeg-client";
import {
    ArrowRight,
    Check,
    Download,
    FileIcon,
    Loader2,
    Trash2,
    Archive,
    AlertCircle,
} from "lucide-react";

interface FileEntry {
    id: string;
    file: File;
    name: string;
    size: number;
    extension: string;
    formatLabel: string;
    targetFormat: string | null;
    status: "idle" | "converting" | "completed" | "failed";
    progress: number;
    error: string | null;
    resultUrl: string | null;
}

export default function ConverterWorkspace() {
    const { t } = useLocale();
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

    useEffect(() => {
        // Preload ffmpeg on mount
        ffmpegClient.load().then(() => setFfmpegLoaded(true)).catch(console.error);
    }, []);

    const handleFilesSelected = useCallback((uploadedFiles: File[]) => {
        const newEntries: FileEntry[] = uploadedFiles.map((f) => {
            const name = f.name;
            const extension = name.split('.').pop()?.toLowerCase() || "";
            return {
                id: Math.random().toString(36).substring(7),
                file: f,
                name: name,
                size: f.size,
                extension: extension,
                formatLabel: extension.toUpperCase(),
                targetFormat: null,
                status: "idle",
                progress: 0,
                error: null,
                resultUrl: null,
            };
        });
        setFiles((prev) => [...prev, ...newEntries]);
    }, []);

    const updateFileEntry = useCallback(
        (fileId: string, updates: Partial<FileEntry>) => {
            setFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
            );
        },
        []
    );

    const removeFile = useCallback((fileId: string) => {
        setFiles((prev) => {
            const file = prev.find(f => f.id === fileId);
            if (file?.resultUrl) {
                URL.revokeObjectURL(file.resultUrl);
            }
            return prev.filter((f) => f.id !== fileId);
        });
    }, []);

    const convertFile = useCallback(
        async (entry: FileEntry) => {
            if (!entry.targetFormat) return;

            updateFileEntry(entry.id, {
                status: "converting",
                progress: 0,
                error: null,
            });

            try {
                const blob = await ffmpegClient.transcode(
                    entry.file,
                    entry.targetFormat,
                    (progress) => updateFileEntry(entry.id, { progress })
                );

                const url = URL.createObjectURL(blob);

                updateFileEntry(entry.id, {
                    status: "completed",
                    progress: 100,
                    resultUrl: url,
                });
            } catch (err) {
                console.error("Conversion error:", err);
                updateFileEntry(entry.id, {
                    status: "failed",
                    error: err instanceof Error ? err.message : "Conversion failed",
                });
            }
        },
        [updateFileEntry]
    );

    const convertAll = useCallback(() => {
        files.forEach((entry) => {
            if (entry.status === "idle" && entry.targetFormat) {
                convertFile(entry);
            }
        });
    }, [files, convertFile]);

    const downloadFile = useCallback((entry: FileEntry) => {
        if (entry.resultUrl) {
            const a = document.createElement("a");
            a.href = entry.resultUrl;
            const originalName = entry.name.substring(0, entry.name.lastIndexOf("."));
            a.download = `${originalName}.${entry.targetFormat}`;
            a.click();
        }
    }, []);

    const downloadAll = useCallback(() => {
        const completed = files.filter((f) => f.status === "completed");
        completed.forEach((f) => downloadFile(f));
    }, [files, downloadFile]);

    const hasIdleFiles = files.some((f) => f.status === "idle" && f.targetFormat);
    const hasCompletedFiles = files.some((f) => f.status === "completed");
    const completedCount = files.filter((f) => f.status === "completed").length;

    return (
        <div className="max-w-screen-lg mx-auto space-y-6">
            <FileDropzone onFilesSelected={handleFilesSelected} />

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-500 dark:text-neutral-500">
                            {t.filesQueued(files.length)}
                        </p>
                        <div className="flex items-center gap-2">
                            {hasCompletedFiles && (
                                <button
                                    onClick={downloadAll}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                >
                                    <Archive className="h-3.5 w-3.5" />
                                    {t.downloadAll(completedCount)}
                                </button>
                            )}
                            {hasIdleFiles && (
                                <button
                                    onClick={convertAll}
                                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                                >
                                    {t.convertAll}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950">
                        {files.map((entry) => (
                            <div key={entry.id} className="px-4 py-3.5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                                            <FileIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                                {entry.name}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                                {entry.formatLabel} — {formatBytes(entry.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-neutral-300 dark:text-neutral-700 flex-shrink-0" />

                                    <div className="w-52 flex-shrink-0">
                                        {entry.status === "idle" ? (
                                            <FormatSelector
                                                inputExtension={entry.extension}
                                                selectedFormat={entry.targetFormat}
                                                onFormatSelect={(format) =>
                                                    updateFileEntry(entry.id, {
                                                        targetFormat: format,
                                                    })
                                                }
                                            />
                                        ) : (
                                            <span className="text-sm font-mono font-medium text-neutral-600 dark:text-neutral-400">
                                                .{entry.targetFormat?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {entry.status === "idle" && entry.targetFormat && (
                                            <button
                                                onClick={() => convertFile(entry)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                                            >
                                                {t.convert}
                                            </button>
                                        )}
                                        {entry.status === "converting" && (
                                            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span className="text-xs">{t.processing}</span>
                                            </div>
                                        )}
                                        {entry.status === "completed" && (
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                    <Check className="h-3.5 w-3.5" />
                                                    {t.done}
                                                </div>
                                                <button
                                                    onClick={() => downloadFile(entry)}
                                                    className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                        {entry.status === "failed" && (
                                            <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span className="max-w-[120px] truncate" title={entry.error || undefined}>
                                                    {entry.error || t.failed}
                                                </span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeFile(entry.id)}
                                            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-600"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {entry.status === "converting" && (
                                    <div className="mt-2 h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.max(entry.progress, 5)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {files.length === 0 && (
                <div className="text-center py-6">
                    <p className="text-sm text-neutral-500 dark:text-neutral-500">
                        {t.supportedFormatsHint}
                    </p>
                </div>
            )}
        </div>
    );
}
