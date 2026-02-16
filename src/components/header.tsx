"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useLocale } from "./locale-provider";

export function Header() {
    const { t } = useLocale();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight text-[15px]">
                    <div className="h-6 w-6 rounded-md bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center">
                        <span className="text-white dark:text-neutral-900 text-xs font-bold">F</span>
                    </div>
                    All Format Hub
                </Link>
                <nav className="flex items-center gap-4 sm:gap-6">
                    <Link href="/convert" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                        {t.converter}
                    </Link>
                    <Link href="/about" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors hidden sm:block">
                        {t.about}
                    </Link>
                    <Link href="/privacy" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors hidden sm:block">
                        {t.privacy}
                    </Link>
                    <LanguageToggle />
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
