"use client";

interface PreviewPanelProps {
    fileName: string;
    fileUrl: string;
    mimeType: string;
}

export function PreviewPanel({ fileName, fileUrl, mimeType }: PreviewPanelProps) {
    const isImage = mimeType.startsWith("image/");
    const isAudio = mimeType.startsWith("audio/");
    const isVideo = mimeType.startsWith("video/");
    const isPdf = mimeType === "application/pdf";

    if (!isImage && !isAudio && !isVideo && !isPdf) {
        return (
            <div className="flex items-center justify-center h-40 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    No preview available for this file type
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-900">
            <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                <p className="text-xs text-neutral-500 dark:text-neutral-500 font-medium truncate">
                    {fileName}
                </p>
            </div>
            <div className="p-4 flex items-center justify-center">
                {isImage && (
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-h-[300px] max-w-full rounded object-contain"
                    />
                )}
                {isAudio && (
                    <audio controls className="w-full max-w-md">
                        <source src={fileUrl} type={mimeType} />
                    </audio>
                )}
                {isVideo && (
                    <video controls className="max-h-[300px] max-w-full rounded">
                        <source src={fileUrl} type={mimeType} />
                    </video>
                )}
                {isPdf && (
                    <iframe
                        src={fileUrl}
                        className="w-full h-[400px] rounded"
                        title={fileName}
                    />
                )}
            </div>
        </div>
    );
}
