"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("locale");
  const next = locale === "zh-Hans" ? "en" : "zh-Hans";
  const label = next === "en" ? t("switchToEn") : t("switchToZh");

  return (
    <Link
      href={pathname}
      locale={next}
      hrefLang={next}
      aria-label={t("label")}
      className="rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs tracking-wide"
    >
      {label}
    </Link>
  );
}
