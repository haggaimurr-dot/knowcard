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
    <div
      className={
        vertical
          ? `flex-col ${className ?? ""}`
          : `category-rail-horizontal flex min-w-0 gap-2 overflow-x-auto ${className ?? ""}`
      }
      role="tablist"
      aria-orientation={orientation}
      aria-label={t("categoriesLabel")}
      onClick={(event) => event.stopPropagation()}
    >
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
                ? `category-tab${selected ? " category-tab-active" : ""}`
                : `category-chip${selected ? " category-chip-active" : ""}`
            }
          >
            <CategoryIcon category={category} className={vertical ? "size-4" : "size-3.5"} />
            <span>{t(`categoriesShort.${category}`)}</span>
            <span className={vertical ? "text-[10px] tabular-nums text-pine/70" : "text-xs tabular-nums opacity-80"}>
              {counts[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
