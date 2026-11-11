"use client";

import { useTranslations } from "next-intl";
import type { CategorySection as CategorySectionData } from "@/lib/library-view";
import { GroupTile } from "./group-tile";
import { TileMenu } from "./tile-menu";

type CategorySectionProps = {
  section: CategorySectionData;
  onRename: () => void;
  onDelete: () => void;
  onRenameGroup: (groupId: string, title: string) => void;
  onDeleteGroup: (groupId: string, title: string, cardCount: number) => void;
  onCreateGroup: () => void;
};

export function CategorySection({
  section,
  onRename,
  onDelete,
  onRenameGroup,
  onDeleteGroup,
  onCreateGroup,
}: CategorySectionProps) {
  const t = useTranslations("library");

  return (
    <section aria-labelledby={`category-${section.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id={`category-${section.id}`} className="font-serif text-3xl">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {t("categoryCount", { groups: section.groupCount, cards: section.cardCount })}
          </p>
        </div>
        <TileMenu
          label={t("more")}
          items={[
            { label: t("rename"), onSelect: onRename },
            { label: t("delete"), onSelect: onDelete, tone: "danger" },
          ]}
        />
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {section.groups.map((group) => (
          <li key={group.id}>
            <GroupTile
              id={group.id}
              title={group.title}
              cardCount={group.cardCount}
              onRename={() => onRenameGroup(group.id, group.title)}
              onDelete={() => onDeleteGroup(group.id, group.title, group.cardCount)}
            />
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onCreateGroup}
            className="flex h-full min-h-28 w-full items-center justify-center rounded-3xl border border-dashed border-line px-6 text-sm text-pine"
          >
            {t("createGroup")}
          </button>
        </li>
      </ul>
    </section>
  );
}
