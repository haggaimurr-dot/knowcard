"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslations } from "next-intl";

type OpsMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  onEditFront: () => void;
  onFlipToFront: () => void;
};

export function OpsMenu({
  open,
  onOpenChange,
  onAdd,
  onEditFront,
  onFlipToFront,
}: OpsMenuProps) {
  const t = useTranslations("studio");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onOpenChange(false);
    }

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => onOpenChange(!open)}
        className="rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-sm"
      >
        {t("ops")}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={t("opsLabel")}
          className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-line bg-paper p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5"
            onClick={onAdd}
          >
            {t("addLink")}
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5"
            onClick={onEditFront}
          >
            {t("editFront")}
          </button>
          <button
            type="button"
            role="menuitem"
            className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5"
            onClick={onFlipToFront}
          >
            {t("flipToFront")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
