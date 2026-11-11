"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent } from "react";

export type TileMenuItem = {
  label: string;
  onSelect: () => void;
  tone?: "danger";
};

type TileMenuProps = {
  label: string;
  items: TileMenuItem[];
};

function stopNavigation(event: MouseEvent | PointerEvent) {
  event.stopPropagation();
}

export function TileMenu({ label, items }: TileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const menu = rootRef.current?.querySelector<HTMLElement>("[role='menuitem']");
    menu?.focus();

    function onPointer(event: Event) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative" onClick={stopNavigation} onPointerDown={stopNavigation}>
      <button
        type="button"
        className="quiet-chip"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="paper absolute right-0 z-20 mt-1 min-w-44 rounded-2xl p-1.5"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={`flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm ${
                item.tone === "danger" ? "text-persimmon" : ""
              }`}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
