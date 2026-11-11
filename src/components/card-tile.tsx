"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { deleteCard } from "@/actions/cards";
import type { CardSummary, GroupOption } from "@/lib/library-view";
import { Link } from "@/i18n/navigation";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { CopyMoveDialog } from "./copy-move-dialog";
import { TileMenu } from "./tile-menu";

type CardTileProps = {
  card: CardSummary;
  showOwner?: boolean;
  onCopy: () => void;
  onMove: () => void;
  onDelete: () => void;
};

export function CardTile({ card, showOwner = false, onCopy, onMove, onDelete }: CardTileProps) {
  const t = useTranslations("library");
  const list = useTranslations("list");

  return (
    <article className="paper relative h-full rounded-3xl">
      <Link href={`/cards/${card.id}`} prefetch={false} className="block h-full rounded-3xl p-6 pr-24">
        <h2 className="font-serif text-2xl">{card.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{card.definition}</p>
        <p className="mt-5 text-xs tracking-wide text-pine">
          {showOwner
            ? t("owner", { category: card.categoryTitle, group: card.groupTitle })
            : list("resources", { count: card.resourceCount })}
        </p>
      </Link>
      <div className="absolute right-3 top-3">
        <TileMenu
          label={t("more")}
          items={[
            { label: t("copyTo"), onSelect: onCopy },
            { label: t("moveTo"), onSelect: onMove },
            { label: t("delete"), onSelect: onDelete, tone: "danger" },
          ]}
        />
      </div>
    </article>
  );
}

type DialogState =
  | { type: "copy" | "move"; card: CardSummary }
  | { type: "delete"; card: CardSummary }
  | null;

export function CardTileList({
  cards,
  groups,
  showOwner = false,
}: {
  cards: CardSummary[];
  groups: GroupOption[];
  showOwner?: boolean;
}) {
  const t = useTranslations("library");
  const locale = useLocale();
  const [dialog, setDialog] = useState<DialogState>(null);

  return (
    <>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.id}>
            <CardTile
              card={card}
              showOwner={showOwner}
              onCopy={() => setDialog({ type: "copy", card })}
              onMove={() => setDialog({ type: "move", card })}
              onDelete={() => setDialog({ type: "delete", card })}
            />
          </li>
        ))}
      </ul>
      {dialog?.type === "copy" || dialog?.type === "move" ? (
        <CopyMoveDialog
          mode={dialog.type}
          cardId={dialog.card.id}
          sourceGroupId={dialog.card.groupId}
          groups={groups}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "delete" ? (
        <ConfirmDeleteDialog
          title={t("deleteCardTitle")}
          body={t("deleteCardBody", { title: dialog.card.title })}
          action={deleteCard}
          hidden={{ cardId: dialog.card.id, from: "library", locale }}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </>
  );
}
