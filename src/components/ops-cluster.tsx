"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { PencilIcon, PlusIcon, RotateIcon } from "./line-icons";

type OpsClusterProps = {
  flipped: boolean;
  onAdd: () => void;
  onEditFront: () => void;
  onFlipToFront: () => void;
};

function blockFlip(event: MouseEvent) {
  event.stopPropagation();
}

export function OpsCluster({ flipped, onAdd, onEditFront, onFlipToFront }: OpsClusterProps) {
  const t = useTranslations("studio");

  return (
    <div
      role="group"
      aria-label={t("opsLabel")}
      className="ops-cluster w-full min-w-0 max-w-full basis-full sm:w-auto sm:basis-auto"
      onClick={blockFlip}
    >
      <button type="button" className="quiet-chip" onClick={onAdd}>
        <PlusIcon />
        <span>{t("addLink")}</span>
      </button>
      <span className="ops-divider" aria-hidden />
      <button type="button" className="quiet-chip" onClick={onEditFront}>
        <PencilIcon />
        <span>{t("editFront")}</span>
      </button>
      <span className="ops-divider" aria-hidden />
      <button type="button" className="quiet-chip" aria-pressed={flipped} onClick={onFlipToFront}>
        <RotateIcon />
        <span>{t("flipToFront")}</span>
      </button>
    </div>
  );
}
