"use client";

import { useLocale } from "@/components/locale-provider";

export default function PrivacyPage() {
    const { t } = useLocale();

    return (
        <div className="py-16 sm:py-24">
            <div className="max-w-screen-md mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight mb-8">
                    {t.privacyTitle}
                </h1>
                <div className="space-y-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <p>{t.privacyIntro}</p>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.dataCollection}
                    </h2>
                    <p>{t.dataCollectionDesc}</p>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.privacyFileHandling}
                    </h2>
                    <p>{t.privacyFileHandlingP1}</p>
                    <p>{t.privacyFileHandlingP2}</p>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.security}
                    </h2>
                    <p>{t.securityDesc}</p>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.cookies}
                    </h2>
                    <p>{t.cookiesDesc}</p>

                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pt-4">
                        {t.changes}
                    </h2>
                    <p>{t.changesDesc}</p>
                </div>
            </div>
        </div>
    );
}
