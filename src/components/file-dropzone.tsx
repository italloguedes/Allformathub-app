"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useLocale } from "./locale-provider";

export interface UploadedFile {
    id: string;
    name: string;
    originalName: string;
    size: number;
    type: string;
    extension: string;
    category: string | null;
    formatLabel: string;
    token: string;
    path: string;
}

interface FileDropzoneProps {
    onFilesUploaded: (files: UploadedFile[]) => void;
    disabled?: boolean;
}

export function FileDropzone({ onFilesUploaded, disabled }: FileDropzoneProps) {
    const { t } = useLocale();
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFiles = useCallback(
        async (fileList: FileList) => {
            if (disabled || uploading) return;
            setError(null);
            setUploading(true);
            setProgress(0);

            const formData = new FormData();
            for (let i = 0; i < fileList.length; i++) {
                formData.append("files", fileList[i]);
            }

            try {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        setProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });

                const response = await new Promise<{ files: UploadedFile[] }>(
                    (resolve, reject) => {
                        xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve(JSON.parse(xhr.responseText));
                            } else {
                                try {
                                    const err = JSON.parse(xhr.responseText);
                                    reject(new Error(err.error || "Upload failed"));
                                } catch {
                                    reject(new Error("Upload failed"));
                                }
                            }
                        };
                        xhr.onerror = () => reject(new Error("Network error"));
                        xhr.open("POST", "/api/upload");
                        xhr.send(formData);
                    }
                );

                const successFiles = response.files.filter(
                    (f: UploadedFile & { error?: string }) => !("error" in f && f.error)
                );
                if (successFiles.length > 0) {
                    onFilesUploaded(successFiles);
                }

                const errorFiles = response.files.filter(
                    (f: UploadedFile & { error?: string }) => "error" in f && f.error
                );
                if (errorFiles.length > 0) {
                    setError(
                        `${t.rejected(errorFiles.length)}: ${(errorFiles[0] as UploadedFile & { error: string }).error}`
                    );
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
                setUploading(false);
                setProgress(0);
            }
        },
        [disabled, uploading, onFilesUploaded, t]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            if (e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles]
    );

    const handleClick = useCallback(() => {
        if (disabled || uploading) return;
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = () => {
            if (input.files && input.files.length > 0) {
                handleFiles(input.files);
            }
        };
        input.click();
    }, [disabled, uploading, handleFiles]);

    return (
        <div className="w-full">
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-200 ease-out
          ${isDragOver
                        ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900"
                        : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-900/50"
                    }
          ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative w-10 h-10">
                            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-200 dark:text-neutral-800" />
                                <circle
                                    cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2"
                                    className="text-neutral-900 dark:text-neutral-100 transition-all"
                                    strokeDasharray={`${2 * Math.PI * 16}`}
                                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                                {progress}%
                            </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {t.uploading}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <Upload className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {t.dropFiles}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                                {t.dropFilesHint}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    <X className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
