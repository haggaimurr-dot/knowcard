"use client";

import { useTranslations } from "next-intl";
import { countByCategory, type Card, type Resource, type ResourceCategory } from "@/lib/types";
import { CategoryRail } from "./category-rail";
import { OpsCluster } from "./ops-cluster";
import { ResourceList } from "./resource-list";

type CardBackProps = {
  card: Card;
  category: ResourceCategory;
  flipped: boolean;
  onCategory: (category: ResourceCategory) => void;
  onAdd: () => void;
  onEditFront: () => void;
  onFlipToFront: () => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
};

export function CardBack({
  card,
  category,
  flipped,
  onCategory,
  onAdd,
  onEditFront,
  onFlipToFront,
  onEdit,
  onDelete,
}: CardBackProps) {
  const t = useTranslations("studio");
  const resources = card.resources.filter((resource) => resource.category === category);
  const counts = countByCategory(card.resources);

  return (
    <div className="paper-sheet">
      <div className="paper-body flex h-full min-h-0 flex-col md:grid md:grid-cols-[minmax(0,1fr)_5rem] md:grid-rows-[auto_minmax(0,1fr)]">
        <div className="paper-texture" aria-hidden />
        <header className="relative z-[1] flex w-full min-w-0 shrink-0 flex-wrap items-start justify-between gap-x-3 gap-y-2 px-4 pt-4 sm:px-6 sm:pt-5 md:col-start-1 md:row-start-1">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.18em] text-pine uppercase">
              {t("backKicker")}
            </p>
            <span className="folio-line" />
            <h2 className="letterpress mt-2 font-serif text-2xl leading-tight">{card.title}</h2>
          </div>
          <OpsCluster
            flipped={flipped}
            onAdd={onAdd}
            onEditFront={onEditFront}
            onFlipToFront={onFlipToFront}
          />
        </header>
        <CategoryRail
          value={category}
          counts={counts}
          orientation="horizontal"
          onChange={onCategory}
          className="relative z-[1] md:hidden"
        />
        <CategoryRail
          value={category}
          counts={counts}
          orientation="vertical"
          onChange={onCategory}
          className="category-rail-vertical relative z-[1] md:col-start-2 md:row-span-2 md:row-start-1"
        />
        <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-4 sm:px-6 md:col-start-1 md:row-start-2">
          <ResourceList
            category={category}
            resources={resources}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
