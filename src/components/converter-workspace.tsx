"use client";

import { useState, useCallback } from "react";
import { FileDropzone, type UploadedFile } from "@/components/file-dropzone";
import { FormatSelector } from "@/components/format-selector";
import { formatBytes } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import {
    ArrowRight,
    Check,
    Download,
    FileIcon,
    Loader2,
    Trash2,
    X,
    Archive,
    AlertCircle,
} from "lucide-react";

interface FileEntry {
    file: UploadedFile;
    targetFormat: string | null;
    jobId: string | null;
    jobToken: string | null;
    status: "idle" | "converting" | "completed" | "failed";
    progress: number;
    error: string | null;
}

export default function ConverterWorkspace() {
    const { t } = useLocale();
    const [files, setFiles] = useState<FileEntry[]>([]);

    const handleFilesUploaded = useCallback((uploaded: UploadedFile[]) => {
        const entries: FileEntry[] = uploaded.map((f) => ({
            file: f,
            targetFormat: null,
            jobId: null,
            jobToken: null,
            status: "idle" as const,
            progress: 0,
            error: null,
        }));
        setFiles((prev) => [...prev, ...entries]);
    }, []);

    const updateFileEntry = useCallback(
        (fileId: string, updates: Partial<FileEntry>) => {
            setFiles((prev) =>
                prev.map((f) => (f.file.id === fileId ? { ...f, ...updates } : f))
            );
        },
        []
    );

    const removeFile = useCallback((fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.file.id !== fileId));
    }, []);

    const convertFile = useCallback(
        async (entry: FileEntry) => {
            if (!entry.targetFormat) return;

            updateFileEntry(entry.file.id, {
                status: "converting",
                progress: 0,
                error: null,
            });

            try {
                const res = await fetch("/api/convert", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileId: entry.file.id,
                        fileName: entry.file.name,
                        inputPath: entry.file.path,
                        inputFormat: entry.file.extension,
                        outputFormat: entry.targetFormat,
                        token: entry.file.token,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Conversion failed");

                updateFileEntry(entry.file.id, {
                    jobId: data.jobId,
                    jobToken: data.token,
                });

                const poll = async () => {
                    const statusRes = await fetch(`/api/status/${data.jobId}`);
                    const statusData = await statusRes.json();

                    if (statusData.status === "completed") {
                        updateFileEntry(entry.file.id, {
                            status: "completed",
                            progress: 100,
                            jobToken: statusData.token,
                        });
                    } else if (statusData.status === "failed") {
                        updateFileEntry(entry.file.id, {
                            status: "failed",
                            error: statusData.error || "Conversion failed",
                        });
                    } else {
                        updateFileEntry(entry.file.id, {
                            progress: statusData.progress || 0,
                        });
                        setTimeout(poll, 500);
                    }
                };

                setTimeout(poll, 300);
            } catch (err) {
                updateFileEntry(entry.file.id, {
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
        if (entry.jobId && entry.jobToken) {
            const url = `/api/download/${entry.jobId}?token=${entry.jobToken}`;
            const a = document.createElement("a");
            a.href = url;
            a.download = "";
            a.click();
        }
    }, []);

    const downloadAllAsZip = useCallback(async () => {
        const completed = files.filter((f) => f.status === "completed");
        if (completed.length === 0) return;
        if (completed.length === 1) {
            downloadFile(completed[0]);
            return;
        }
        completed.forEach((f) => downloadFile(f));
    }, [files, downloadFile]);

    const hasIdleFiles = files.some((f) => f.status === "idle" && f.targetFormat);
    const hasCompletedFiles = files.some((f) => f.status === "completed");
    const completedCount = files.filter((f) => f.status === "completed").length;

    return (
        <div className="max-w-screen-lg mx-auto space-y-6">
            <FileDropzone onFilesUploaded={handleFilesUploaded} />

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-500 dark:text-neutral-500">
                            {t.filesQueued(files.length)}
                        </p>
                        <div className="flex items-center gap-2">
                            {hasCompletedFiles && (
                                <button
                                    onClick={downloadAllAsZip}
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
                            <div key={entry.file.id} className="px-4 py-3.5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                                            <FileIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                                {entry.file.originalName}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                                {entry.file.formatLabel} — {formatBytes(entry.file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-neutral-300 dark:text-neutral-700 flex-shrink-0" />

                                    <div className="w-52 flex-shrink-0">
                                        {entry.status === "idle" ? (
                                            <FormatSelector
                                                inputExtension={entry.file.extension}
                                                selectedFormat={entry.targetFormat}
                                                onFormatSelect={(format) =>
                                                    updateFileEntry(entry.file.id, {
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
                                            onClick={() => removeFile(entry.file.id)}
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
