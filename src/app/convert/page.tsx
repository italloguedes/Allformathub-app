"use client";

import ConverterWorkspace from "@/components/converter-workspace";
import { useLocale } from "@/components/locale-provider";

export default function ConvertPage() {
    const { t } = useLocale();

    return (
        <div className="py-10 sm:py-16">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {t.fileConverter}
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                        {t.fileConverterDesc}
                    </p>
                </div>
                <ConverterWorkspace />
            </div>
        </div>
    );
}
