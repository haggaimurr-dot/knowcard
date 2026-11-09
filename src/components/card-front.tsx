"use client";

import { useTranslations } from "next-intl";
import type { Card } from "@/lib/types";

type CardFrontProps = {
  card: Card;
  onFlip: () => void;
};

export function CardFront({ card, onFlip }: CardFrontProps) {
  const t = useTranslations("studio");

  return (
    <div className="paper flex h-full flex-col">
      <header className="flex items-center justify-between px-6 pt-5">
        <p className="text-xs tracking-[0.18em] text-pine">{t("frontKicker")}</p>
        <button
          type="button"
          onClick={onFlip}
          className="rounded-full bg-pine px-3 py-1.5 text-sm text-white"
        >
          {t("flipToBack")}
        </button>
      </header>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-8 py-8">
        <div className="max-w-xl text-center">
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{card.title}</h1>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-8 text-ink/85">{card.definition}</p>
        </div>
      </div>
      <footer className="px-6 pb-5 text-center text-sm text-muted">
        <kbd className="rounded-md border border-line bg-white px-1.5 py-0.5 text-xs">Space</kbd>
        {" / "}
        <kbd className="rounded-md border border-line bg-white px-1.5 py-0.5 text-xs">F</kbd>
        <span className="ml-2">{t("flipHint")}</span>
      </footer>
    </div>
  );
}
