"use client";

import { useTranslations } from "next-intl";
import type { StoreError } from "@/lib/types";

export function ErrorLine({ error }: { error?: StoreError }) {
  const t = useTranslations("studio.errors");
  if (!error) return null;
  return (
    <p role="alert" className="text-sm text-persimmon">
      {t(error)}
    </p>
  );
}
