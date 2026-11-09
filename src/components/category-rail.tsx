"use client";

import { useTranslations } from "next-intl";
import { CategoryIcon } from "./category-icon";
import { RESOURCE_CATEGORIES, type ResourceCategory } from "@/lib/types";

type CategoryRailProps = {
  value: ResourceCategory;
  counts: Record<ResourceCategory, number>;
  orientation: "vertical" | "horizontal";
  onChange: (category: ResourceCategory) => void;
  className?: string;
};

export function CategoryRail({
  value,
  counts,
  orientation,
  onChange,
  className,
}: CategoryRailProps) {
  const t = useTranslations("studio");
  const vertical = orientation === "vertical";

  return (
    <div className={className} role="tablist" aria-orientation={orientation} aria-label={t("categoriesLabel")}>
      <div className={vertical ? "flex h-full flex-col" : "flex gap-2 overflow-x-auto pb-1"}>
        {RESOURCE_CATEGORIES.map((category) => {
          const selected = category === value;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(category)}
              className={
                vertical
                  ? `flex flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] ${selected ? "bg-pine text-white" : "text-ink hover:bg-black/5"}`
                  : `flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${selected ? "border-pine bg-pine text-white" : "border-line bg-white/60 text-ink"}`
              }
            >
              <CategoryIcon category={category} className={vertical ? "size-4" : "size-3.5"} />
              <span>{t(`categoriesShort.${category}`)}</span>
              <span className={vertical ? "text-[10px] opacity-80" : "text-xs opacity-80"}>
                {counts[category]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
