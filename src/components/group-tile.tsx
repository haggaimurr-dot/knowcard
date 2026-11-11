"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TileMenu } from "./tile-menu";

type GroupTileProps = {
  id: string;
  title: string;
  cardCount: number;
  onRename: () => void;
  onDelete: () => void;
};

export function GroupTile({ id, title, cardCount, onRename, onDelete }: GroupTileProps) {
  const t = useTranslations("library");

  return (
    <article className="paper relative h-full rounded-3xl">
      <Link href={`/groups/${id}`} prefetch={false} className="block h-full min-h-28 rounded-3xl p-6 pr-24">
        <h3 className="font-serif text-2xl">{title}</h3>
        <p className="mt-3 text-xs tracking-wide text-pine">{t("cardCount", { count: cardCount })}</p>
      </Link>
      <div className="absolute right-3 top-3">
        <TileMenu
          label={t("more")}
          items={[
            { label: t("rename"), onSelect: onRename },
            { label: t("delete"), onSelect: onDelete, tone: "danger" },
          ]}
        />
      </div>
    </article>
  );
}
