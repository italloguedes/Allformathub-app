"use client";

import Link from "next/link";
import { ArrowRight, FileOutput, Shield, Zap, Layers } from "lucide-react";
import { useLocale } from "@/components/locale-provider";

export default function LandingPage() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.1]">
              {t.heroTitle}
              <br />
              <span className="text-neutral-400 dark:text-neutral-600">{t.heroSubtitle}</span>
            </h1>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
              {t.heroDescription}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/convert"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                {t.openConverter}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                {t.learnMore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature
              icon={<Layers className="h-5 w-5" />}
              title={t.multipleFormats}
              description={t.multipleFormatsDesc}
            />
            <Feature
              icon={<FileOutput className="h-5 w-5" />}
              title={t.batchProcessing}
              description={t.batchProcessingDesc}
            />
            <Feature
              icon={<Zap className="h-5 w-5" />}
              title={t.fastProcessing}
              description={t.fastProcessingDesc}
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title={t.autoCleanup}
              description={t.autoCleanupDesc}
            />
          </div>
        </div>
      </section>

      {/* Supported formats */}
      <section className="py-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-8">
            {t.supportedFormats}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormatGroup label={t.images} formats={["JPG", "PNG", "WebP", "SVG", "BMP", "TIFF", "ICO", "AVIF"]} />
            <FormatGroup label={t.documents} formats={["PDF", "TXT", "HTML", "Markdown"]} />
            <FormatGroup label={t.spreadsheets} formats={["CSV", "XLSX", "ODS"]} />
            <FormatGroup label={t.audio} formats={["MP3", "WAV", "OGG", "FLAC", "M4A"]} />
            <FormatGroup label={t.video} formats={["MP4", "WebM", "MOV", "AVI", "MKV"]} />
            <FormatGroup label={t.archives} formats={["ZIP", "TAR", "GZIP"]} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div>
      <div className="p-2 w-fit rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}

function FormatGroup({ label, formats }: { label: string; formats: string[] }) {
  return (
    <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-3">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {formats.map((f) => (
          <span key={f} className="px-2 py-0.5 text-xs font-mono rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
