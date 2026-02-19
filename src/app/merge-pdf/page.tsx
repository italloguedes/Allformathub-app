"use client";

import MergePdfWorkspace from "@/components/merge-pdf-workspace";
import { useLocale } from "@/components/locale-provider";

export default function MergePdfPage() {
    const { t } = useLocale();

    return (
        <div className="py-10 sm:py-16">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {t.mergePdfPageTitle}
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                        {t.mergePdfPageDesc}
                    </p>
                </div>
                <MergePdfWorkspace />
            </div>
        </div>
    );
}
