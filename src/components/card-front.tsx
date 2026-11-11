"use client";

import { useTranslations } from "next-intl";
import type { Card } from "@/lib/types";

type CardFrontProps = {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
};

export function CardFront({ card, flipped, onFlip }: CardFrontProps) {
  const t = useTranslations("studio");

  return (
    <div className="paper-sheet">
      <div className="paper-body flex h-full flex-col">
        <div className="paper-texture" aria-hidden />
        <header className="relative z-[1] flex items-start justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-pine uppercase">
              {t("frontKicker")}
            </p>
            <span className="folio-line" />
          </div>
          <button
            type="button"
            className="quiet-chip"
            aria-pressed={flipped}
            onClick={(event) => {
              event.stopPropagation();
              onFlip();
            }}
          >
            {t("flipToBack")}
          </button>
        </header>
        <div className="relative z-[1] flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6 py-6 sm:px-10">
          <div className="max-w-xl text-center">
            <h1 className="letterpress font-serif text-4xl leading-tight text-balance sm:text-5xl md:text-6xl">
              {card.title}
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-ink/85 sm:text-lg sm:leading-8">
              {card.definition}
            </p>
          </div>
        </div>
        <footer className="relative z-[1] px-5 pb-5 text-center text-sm text-muted sm:px-8">
          <kbd className="rounded-md border border-line bg-white/70 px-1.5 py-0.5 text-xs shadow-sm">
            Space
          </kbd>
          {" / "}
          <kbd className="rounded-md border border-line bg-white/70 px-1.5 py-0.5 text-xs shadow-sm">
            F
          </kbd>
          <span className="ml-2 tracking-wide">{t("flipHint")}</span>
        </footer>
      </div>
    </div>
  );
}
