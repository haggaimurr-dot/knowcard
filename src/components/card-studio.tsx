"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { deleteCard } from "@/actions/cards";
import type { GroupOption } from "@/lib/library-view";
import type { Card, Resource, ResourceCategory } from "@/lib/types";
import { REDUCED_MS, flipFrame } from "@/lib/flip-motion";
import { Link } from "@/i18n/navigation";
import { CardBack } from "./card-back";
import { CardFront } from "./card-front";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { CopyMoveDialog } from "./copy-move-dialog";
import { DeleteDialog } from "./delete-dialog";
import { FrontDialog } from "./front-dialog";
import { ResourceDialog } from "./resource-dialog";

type DialogState =
  | { type: "add" }
  | { type: "front" }
  | { type: "edit"; resource: Resource }
  | { type: "delete"; resource: Resource }
  | { type: "copy" }
  | { type: "move" }
  | { type: "delete-card" }
  | null;

type StudioOwner = {
  groupId: string;
  categoryTitle: string;
  groupTitle: string;
};

type CardStudioProps = {
  card: Card;
  owner: StudioOwner;
  groups: GroupOption[];
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  return Boolean(target.closest("input, textarea, select, button, a, [role='dialog']"));
}

export function CardStudio({ card, owner, groups }: CardStudioProps) {
  const t = useTranslations("studio");
  const library = useTranslations("library");
  const locale = useLocale();
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState<ResourceCategory>("image");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogKey, setDialogKey] = useState(0);

  const flippedRef = useRef(false);
  const busyRef = useRef(false);
  const dialogRef = useRef<DialogState>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const timerRef = useRef(0);

  const clearMotionStyle = useCallback(() => {
    const inner = innerRef.current;
    if (inner) inner.style.willChange = "";
    if (inner && !prefersReducedMotion()) inner.style.transform = "";
    if (shadowRef.current) {
      shadowRef.current.style.willChange = "";
      shadowRef.current.style.transform = "";
    }
    if (frontRef.current) frontRef.current.style.willChange = "";
    if (backRef.current) backRef.current.style.willChange = "";
  }, []);

  const finishBusy = useCallback(
    (delay: number) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        busyRef.current = false;
        setBusy(false);
        clearMotionStyle();
      }, delay);
    },
    [clearMotionStyle],
  );

  const flip = useCallback(() => {
    if (dialogRef.current || busyRef.current) return;
    const next = !flippedRef.current;
    const reduced = prefersReducedMotion();
    const from = next ? 0 : 180;
    const to = next ? 180 : 0;

    window.cancelAnimationFrame(frameRef.current);
    window.clearTimeout(timerRef.current);
    flippedRef.current = next;
    busyRef.current = true;
    setFlipped(next);
    setBusy(true);

    if (reduced) {
      if (frontRef.current) frontRef.current.style.willChange = "opacity";
      if (backRef.current) backRef.current.style.willChange = "opacity";
      finishBusy(REDUCED_MS);
      return;
    }

    if (innerRef.current) {
      innerRef.current.style.willChange = "transform";
      innerRef.current.style.transform = `rotateY(${from}deg) scale(1)`;
    }
    if (shadowRef.current) shadowRef.current.style.willChange = "transform";

    const started = performance.now();
    const tick = (now: number) => {
      const frame = flipFrame(now - started, from, to);
      if (innerRef.current) {
        innerRef.current.style.transform = `rotateY(${frame.angle}deg) scale(${frame.scale})`;
      }
      if (shadowRef.current) {
        shadowRef.current.style.transform = `translate3d(${frame.shadowX}%, 0, 0) scaleX(${frame.shadowScale})`;
      }
      if (!frame.done) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      finishBusy(0);
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [finishBusy]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      const flips = key === " " || key === "Spacebar" || key === "f" || key === "F";
      if (!flips || dialogRef.current || busyRef.current) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      flip();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip]);

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const openDialog = useCallback((next: Exclude<DialogState, null>) => {
    dialogRef.current = next;
    setDialogKey((value) => value + 1);
    setDialog(next);
  }, []);

  const closeDialog = useCallback((nextCategory?: ResourceCategory) => {
    if (nextCategory) setCategory(nextCategory);
    dialogRef.current = null;
    setDialog(null);
  }, []);

  function onFaceClick(event: MouseEvent<HTMLDivElement>) {
    if (busyRef.current || dialogRef.current) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, button, input, textarea, select, label, [data-no-flip]")) return;
    flip();
  }

  return (
    <section
      className="mx-auto w-full px-4 pt-6 pb-10 sm:pt-8"
      data-studio="card"
      data-flipped={flipped ? "true" : "false"}
      data-category={category}
      aria-busy={busy}
    >
      <p className="sr-only" aria-live="polite">
        {flipped ? t("faceBack") : t("faceFront")}
      </p>
      <div className="px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link
            href={`/groups/${owner.groupId}`}
            prefetch={false}
            className="inline-flex h-11 items-center text-sm text-pine"
          >
            {library("owningGroup", { category: owner.categoryTitle, group: owner.groupTitle })}
          </Link>
          <div role="group" aria-label={library("manageCard")} className="flex flex-wrap gap-2">
            <button type="button" className="quiet-chip" onClick={() => openDialog({ type: "copy" })}>
              {library("copyTo")}
            </button>
            <button type="button" className="quiet-chip" onClick={() => openDialog({ type: "move" })}>
              {library("moveTo")}
            </button>
            <button
              type="button"
              className="quiet-chip"
              aria-label={library("deleteCardTitle")}
              onClick={() => openDialog({ type: "delete-card" })}
            >
              {library("delete")}
            </button>
          </div>
        </div>
      </div>
      <div className="flip-scene" data-busy={busy ? "true" : "false"}>
        <div className="specimen-stage relative mx-auto aspect-[4/3] w-full max-w-3xl max-md:min-h-[26rem]">
          <div ref={shadowRef} className="flip-shadow" aria-hidden />
          <div ref={innerRef} className="flip-inner" data-flipped={flipped ? "true" : "false"}>
            <div className="flip-edge flip-edge-left" aria-hidden />
            <div className="flip-edge flip-edge-right" aria-hidden />
            <div ref={frontRef} className="flip-face flip-face-front" inert={flipped} onClick={onFaceClick}>
              <CardFront card={card} flipped={flipped} onFlip={flip} />
            </div>
            <div ref={backRef} className="flip-face flip-face-back" inert={!flipped} onClick={onFaceClick}>
              <CardBack
                card={card}
                category={category}
                flipped={flipped}
                onCategory={setCategory}
                onAdd={() => openDialog({ type: "add" })}
                onEditFront={() => openDialog({ type: "front" })}
                onFlipToFront={flip}
                onEdit={(resource) => openDialog({ type: "edit", resource })}
                onDelete={(resource) => openDialog({ type: "delete", resource })}
              />
            </div>
          </div>
        </div>
      </div>
      {dialog?.type === "add" ? (
        <ResourceDialog
          key={dialogKey}
          mode="add"
          cardId={card.id}
          category={category}
          onClose={(next) => closeDialog(next)}
        />
      ) : null}
      {dialog?.type === "edit" ? (
        <ResourceDialog
          key={dialogKey}
          mode="edit"
          cardId={card.id}
          category={dialog.resource.category}
          resource={dialog.resource}
          onClose={(next) => closeDialog(next)}
        />
      ) : null}
      {dialog?.type === "front" ? (
        <FrontDialog key={dialogKey} card={card} onClose={() => closeDialog()} />
      ) : null}
      {dialog?.type === "delete" ? (
        <DeleteDialog
          key={dialogKey}
          cardId={card.id}
          resource={dialog.resource}
          onClose={() => closeDialog()}
        />
      ) : null}
      {dialog?.type === "copy" || dialog?.type === "move" ? (
        <CopyMoveDialog
          key={dialogKey}
          mode={dialog.type}
          cardId={card.id}
          sourceGroupId={owner.groupId}
          groups={groups}
          onClose={() => closeDialog()}
        />
      ) : null}
      {dialog?.type === "delete-card" ? (
        <ConfirmDeleteDialog
          key={dialogKey}
          title={library("deleteCardTitle")}
          body={library("deleteCardBody", { title: card.title })}
          action={deleteCard}
          hidden={{ cardId: card.id, from: "studio", locale }}
          onClose={() => closeDialog()}
        />
      ) : null}
    </section>
  );
}
