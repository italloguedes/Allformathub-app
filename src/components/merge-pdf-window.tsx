"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowDown, ArrowUp, Eye, FileText, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

export interface MergeWindowFileEntry {
    id: string;
    name: string;
    size: number;
    extension: string;
    file: File;
}

interface MergePdfWindowProps {
    open: boolean;
    files: MergeWindowFileEntry[];
    outputName: string;
    onOutputNameChange: (value: string) => void;
    onMoveUp: (fileId: string) => void;
    onMoveDown: (fileId: string) => void;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    error: string | null;
}

export function MergePdfWindow({
    open,
    files,
    outputName,
    onOutputNameChange,
    onMoveUp,
    onMoveDown,
    onClose,
    onConfirm,
    isSubmitting,
    error,
}: MergePdfWindowProps) {
    const { t } = useLocale();
    const [previewFileId, setPreviewFileId] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setPreviewFileId(files[0]?.id || null);
    }, [open, files]);

    const selectedFile = useMemo(
        () => files.find((f) => f.id === previewFileId) || files[0] || null,
        [files, previewFileId]
    );

    const previewUrl = useMemo(() => {
        if (!selectedFile) return null;
        return URL.createObjectURL(selectedFile.file);
    }, [selectedFile]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    if (!open) return null;

    const mimeType = selectedFile?.file.type || "";
    const isImage = mimeType.startsWith("image/");
    const isAudio = mimeType.startsWith("audio/");
    const isVideo = mimeType.startsWith("video/");
    const isPdf = mimeType === "application/pdf" || selectedFile?.extension.toLowerCase() === "pdf";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
            <div className="w-full max-w-5xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl">
                <div className="flex items-start justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            {t.mergeWindowTitle}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            {t.mergeWindowDesc}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                                {t.outputPdfName}
                            </label>
                            <input
                                value={outputName}
                                onChange={(e) => onOutputNameChange(e.target.value)}
                                className="w-full h-10 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 text-sm bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200"
                                placeholder="merged-files.pdf"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                                {t.filesInOrder}
                            </p>
                            <div className="max-h-[360px] overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
                                {files.map((file, index) => (
                                    <div
                                        key={file.id}
                                        className={`p-3 flex items-center gap-2 ${selectedFile?.id === file.id ? "bg-neutral-50 dark:bg-neutral-900/60" : ""}`}
                                    >
                                        <button
                                            onClick={() => setPreviewFileId(file.id)}
                                            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
                                            title={t.preview}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-neutral-800 dark:text-neutral-200 truncate">
                                                {index + 1}. {file.name}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                                {file.extension.toUpperCase()} - {formatBytes(file.size)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onMoveUp(file.id)}
                                                disabled={index === 0}
                                                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={t.moveUp}
                                            >
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onMoveDown(file.id)}
                                                disabled={index === files.length - 1}
                                                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                                title={t.moveDown}
                                            >
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t.preview}</p>
                        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 min-h-[360px] p-3 flex items-center justify-center">
                            {!selectedFile || !previewUrl ? (
                                <p className="text-sm text-neutral-500 dark:text-neutral-500">{t.noPreview}</p>
                            ) : isImage ? (
                                <img src={previewUrl} alt={selectedFile.name} className="max-h-[360px] max-w-full object-contain rounded" />
                            ) : isAudio ? (
                                <audio controls className="w-full">
                                    <source src={previewUrl} type={mimeType} />
                                </audio>
                            ) : isVideo ? (
                                <video controls className="max-h-[360px] max-w-full rounded">
                                    <source src={previewUrl} type={mimeType} />
                                </video>
                            ) : isPdf ? (
                                <iframe src={previewUrl} className="w-full h-[380px] rounded bg-white" title={selectedFile.name} />
                            ) : (
                                <div className="text-center">
                                    <FileText className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                                    <p className="text-sm text-neutral-500 dark:text-neutral-500">{t.noPreview}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-5">
                    {error && <p className="text-xs text-red-500 dark:text-red-400 mb-3">{error}</p>}
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                        >
                            {t.close}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting || files.length === 0}
                            className="px-4 py-1.5 text-sm rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? t.merging : t.mergeToPdf}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
