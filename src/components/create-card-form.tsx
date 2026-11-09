"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createCard } from "@/actions/cards";
import { idleActionState } from "@/lib/action-state";
import { ErrorLine } from "./error-line";

export function CreateCardForm() {
  const t = useTranslations("list");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(createCard, idleActionState);

  return (
    <form action={formAction} className="paper rounded-3xl p-6">
      <h2 className="font-serif text-2xl">{t("createTitle")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{t("createLead")}</p>
      <input type="hidden" name="locale" value={locale} />
      <div className="mt-4 grid gap-3">
        <label className="text-sm">
          <span>{t("titleLabel")}</span>
          <input
            name="title"
            required
            maxLength={120}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span>{t("definitionLabel")}</span>
          <textarea
            name="definition"
            required
            rows={4}
            maxLength={4000}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <ErrorLine error={state.error} />
        <div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60"
          >
            {pending ? t("saving") : t("createSubmit")}
          </button>
        </div>
      </div>
    </form>
  );
}
