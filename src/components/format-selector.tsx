"use client";

import { useEffect, useState, useRef } from "react";
import { type FormatInfo, getValidOutputFormats, detectCategory } from "@/lib/formats";
import { ChevronDown, Check } from "lucide-react";
import { useLocale } from "./locale-provider";
import type { FormatCategory } from "@/lib/formats";

interface FormatSelectorProps {
    inputExtension: string;
    selectedFormat: string | null;
    onFormatSelect: (format: string) => void;
}

function getCatLabel(category: FormatCategory, t: ReturnType<typeof useLocale>["t"]): string {
    const map: Record<FormatCategory, string> = {
        image: t.catImage,
        document: t.catDocument,
        spreadsheet: t.catSpreadsheet,
        audio: t.catAudio,
        video: t.catVideo,
        archive: t.catArchive,
    };
    return map[category];
}

export function FormatSelector({ inputExtension, selectedFormat, onFormatSelect }: FormatSelectorProps) {
    const { t } = useLocale();
    const [formats, setFormats] = useState<FormatInfo[]>([]);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const validFormats = getValidOutputFormats(inputExtension);
        setFormats(validFormats);
        if (validFormats.length > 0 && !selectedFormat) {
            onFormatSelect(validFormats[0].extension);
        }
    }, [inputExtension]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const category = detectCategory(inputExtension);
    const selected = formats.find((f) => f.extension === selectedFormat);

    if (formats.length === 0) {
        return (
            <div className="text-xs text-neutral-500 dark:text-neutral-400 px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                {t.noConversions(inputExtension)}
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors w-full justify-between min-w-[160px]"
            >
                <div className="flex items-center gap-2 truncate">
                    {category && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0">
                            {getCatLabel(category, t)}
                        </span>
                    )}
                    <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                        {selected ? `.${selected.extension.toUpperCase()}` : t.selectFormat}
                    </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full mt-1.5 left-0 right-0 z-[100] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden max-h-[280px] overflow-y-auto ring-1 ring-black/5 dark:ring-white/5">
                    {formats.map((format) => (
                        <button
                            key={format.extension}
                            onClick={() => {
                                onFormatSelect(format.extension);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between transition-colors ${selectedFormat === format.extension
                                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                }`}
                        >
                            <span className="font-mono font-medium">.{format.extension}</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs ${selectedFormat === format.extension
                                        ? "text-neutral-300 dark:text-neutral-600"
                                        : "text-neutral-400 dark:text-neutral-500"
                                    }`}>
                                    {format.label}
                                </span>
                                {selectedFormat === format.extension && (
                                    <Check className="h-3.5 w-3.5" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
