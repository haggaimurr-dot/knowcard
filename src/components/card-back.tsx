"use client";

import { useTranslations } from "next-intl";
import { countByCategory, type Card, type Resource, type ResourceCategory } from "@/lib/types";
import { CategoryRail } from "./category-rail";
import { OpsMenu } from "./ops-menu";
import { ResourceList } from "./resource-list";

type CardBackProps = {
  card: Card;
  category: ResourceCategory;
  opsOpen: boolean;
  onCategory: (category: ResourceCategory) => void;
  onOpsOpenChange: (open: boolean) => void;
  onAdd: () => void;
  onEditFront: () => void;
  onFlipToFront: () => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
};

export function CardBack({
  card,
  category,
  opsOpen,
  onCategory,
  onOpsOpenChange,
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
    <div className="paper grid h-full grid-rows-[auto_auto_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_4.75rem] md:grid-rows-[auto_minmax(0,1fr)]">
      <header className="flex items-start justify-between gap-3 px-5 pt-5 md:col-start-1">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.18em] text-pine">{t("backKicker")}</p>
          <h2 className="mt-1 truncate font-serif text-2xl">{card.title}</h2>
        </div>
        <OpsMenu
          open={opsOpen}
          onOpenChange={onOpsOpenChange}
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
        className="px-5 pt-4 md:hidden"
      />
      <CategoryRail
        value={category}
        counts={counts}
        orientation="vertical"
        onChange={onCategory}
        className="hidden border-l border-line bg-[#f4eee4] md:col-start-2 md:row-span-2 md:row-start-1 md:flex"
      />
      <div className="min-h-0 px-5 pb-5 pt-2 md:col-start-1 md:row-start-2">
        <ResourceList
          category={category}
          resources={resources}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
