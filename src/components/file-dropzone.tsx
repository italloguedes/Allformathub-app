"use client";

import { useCallback, useState } from "react";
import { Upload, X } from "lucide-react";
import { useLocale } from "./locale-provider";

export interface FileDropzoneProps {
    onFilesSelected: (files: File[]) => void;
    disabled?: boolean;
}

export function FileDropzone({ onFilesSelected, disabled }: FileDropzoneProps) {
    const { t } = useLocale();
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFiles = useCallback(
        (fileList: FileList) => {
            if (disabled) return;

            const files: File[] = [];
            for (let i = 0; i < fileList.length; i++) {
                files.push(fileList[i]);
            }

            if (files.length > 0) {
                onFilesSelected(files);
            }
        },
        [disabled, onFilesSelected]
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
        if (disabled) return;
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = () => {
            if (input.files && input.files.length > 0) {
                handleFiles(input.files);
            }
        };
        input.click();
    }, [disabled, handleFiles]);

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
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
            >
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
            </div>
        </div>
    );
}
