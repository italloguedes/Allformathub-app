"use client";

import { useLocale } from "./locale-provider";
import { Languages } from "lucide-react";

export function LanguageToggle() {
    const { locale, setLocale } = useLocale();

    return (
        <button
            onClick={() => setLocale(locale === "en" ? "pt" : "en")}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            aria-label="Toggle language"
        >
            <Languages className="h-3.5 w-3.5" />
            {locale === "en" ? "PT" : "EN"}
        </button>
    );
}
