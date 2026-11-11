"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({ title, closeLabel, onClose, children }: DialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const preferred = panel?.querySelector<HTMLElement>("[data-initial-focus]");
    const field = panel?.querySelector<HTMLElement>(
      "input:not([type='hidden']):not(:disabled), textarea, select:not(:disabled)",
    );
    (preferred ?? field ?? panel?.querySelector<HTMLElement>("button:not(:disabled)"))?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-[rgba(22,32,26,0.46)]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="paper relative z-10 max-h-[min(40rem,calc(100dvh-2rem))] w-full max-w-md overflow-y-auto rounded-3xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-serif text-2xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm text-muted"
          >
            {closeLabel}
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
