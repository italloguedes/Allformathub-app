"use client";

import Link from "next/link";
import { useLocale } from "./locale-provider";

export function Footer() {
    const { t } = useLocale();

    return (
        <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
                        <div className="h-5 w-5 rounded bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
                            <span className="text-white dark:text-neutral-900 text-[10px] font-bold">F</span>
                        </div>
                        All Format Hub
                    </div>
                    <nav className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-500">
                        <Link href="/about" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                            {t.about}
                        </Link>
                        <Link href="/privacy" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                            {t.privacy}
                        </Link>
                    </nav>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600">
                        {t.footerNote}
                    </p>
                </div>
            </div>
        </footer>
    );
}
