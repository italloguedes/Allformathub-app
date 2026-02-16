"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Locale, type Translations } from "@/lib/i18n";

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: Translations;
}

const LocaleContext = createContext<LocaleContextType>({
    locale: "en",
    setLocale: () => { },
    t: translations.en,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");

    useEffect(() => {
        const saved = localStorage.getItem("formathub-locale") as Locale | null;
        if (saved && (saved === "en" || saved === "pt")) {
            setLocaleState(saved);
        } else {
            // Auto-detect from browser
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith("pt")) {
                setLocaleState("pt");
            }
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("formathub-locale", newLocale);
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    return useContext(LocaleContext);
}
