"use client";

import { useLocale } from "@/components/locale-provider";

export default function AboutPage() {
    const { t } = useLocale();

    return (
        <div className="py-16 sm:py-24">
            <div className="max-w-screen-md mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mb-8">
                    {t.aboutTitle}
                </h1>
                <div className="space-y-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <p>{t.aboutP1}</p>
                    <p>{t.aboutP2}</p>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.howItWorks}
                    </h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>{t.howStep1}</li>
                        <li>{t.howStep2}</li>
                        <li>{t.howStep3}</li>
                        <li>{t.howStep4}</li>
                    </ol>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.fileHandling}
                    </h2>
                    <p>{t.fileHandlingDesc}</p>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.techDetails}
                    </h2>
                    <p>{t.techDetailsDesc}</p>
                </div>
            </div>
        </div>
    );
}
