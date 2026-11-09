"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Card, Resource, ResourceCategory } from "@/lib/types";
import { CardBack } from "./card-back";
import { CardFront } from "./card-front";
import { DeleteDialog } from "./delete-dialog";
import { FrontDialog } from "./front-dialog";
import { ResourceDialog } from "./resource-dialog";

type DialogState =
  | { type: "add" }
  | { type: "front" }
  | { type: "edit"; resource: Resource }
  | { type: "delete"; resource: Resource }
  | null;

type CardStudioProps = {
  card: Card;
};

export function CardStudio({ card }: CardStudioProps) {
  const t = useTranslations("studio");
  const [flipped, setFlipped] = useState(false);
  const [category, setCategory] = useState<ResourceCategory>("image");
  const [opsOpen, setOpsOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const openDialog = useCallback((next: Exclude<DialogState, null>) => {
    setDialogKey((value) => value + 1);
    setOpsOpen(false);
    setDialog(next);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      const flips = key === " " || key === "f" || key === "F";
      if (!flips || dialog || opsOpen) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
        if ((tag === "BUTTON" || tag === "A") && key === " ") return;
      }

      event.preventDefault();
      setFlipped((value) => !value);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, opsOpen]);

  return (
    <section
      className="mx-auto w-full max-w-5xl px-4 py-6"
      data-studio="card"
      data-flipped={flipped ? "true" : "false"}
      data-category={category}
    >
      <p className="sr-only" aria-live="polite">
        {flipped ? t("faceBack") : t("faceFront")}
      </p>
      <div className="flip-scene h-[min(40rem,calc(100dvh-7rem))] min-h-[32rem]">
        <div className="flip-inner" data-flipped={flipped ? "true" : "false"}>
          <div className="flip-face flip-face-front" inert={flipped}>
            <CardFront card={card} onFlip={() => setFlipped(true)} />
          </div>
          <div className="flip-face flip-face-back" inert={!flipped}>
            <CardBack
              card={card}
              category={category}
              opsOpen={opsOpen}
              onCategory={setCategory}
              onOpsOpenChange={setOpsOpen}
              onAdd={() => openDialog({ type: "add" })}
              onEditFront={() => openDialog({ type: "front" })}
              onFlipToFront={() => {
                setOpsOpen(false);
                setFlipped(false);
              }}
              onEdit={(resource) => openDialog({ type: "edit", resource })}
              onDelete={(resource) => openDialog({ type: "delete", resource })}
            />
          </div>
        </div>
      </div>
      {dialog?.type === "add" ? (
        <ResourceDialog
          key={dialogKey}
          mode="add"
          cardId={card.id}
          category={category}
          onClose={(next) => {
            if (next) setCategory(next);
            setDialog(null);
          }}
        />
      ) : null}
      {dialog?.type === "edit" ? (
        <ResourceDialog
          key={dialogKey}
          mode="edit"
          cardId={card.id}
          category={dialog.resource.category}
          resource={dialog.resource}
          onClose={(next) => {
            if (next) setCategory(next);
            setDialog(null);
          }}
        />
      ) : null}
      {dialog?.type === "front" ? (
        <FrontDialog key={dialogKey} card={card} onClose={() => setDialog(null)} />
      ) : null}
      {dialog?.type === "delete" ? (
        <DeleteDialog
          key={dialogKey}
          cardId={card.id}
          resource={dialog.resource}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </section>
  );
}
