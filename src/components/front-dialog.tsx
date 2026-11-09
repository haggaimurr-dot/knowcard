"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateCardFront } from "@/actions/cards";
import { idleActionState } from "@/lib/action-state";
import type { Card } from "@/lib/types";
import { Dialog } from "./dialog";
import { ErrorLine } from "./error-line";
import { useCloseOnSuccess } from "./use-close-on-success";

type FrontDialogProps = {
  card: Card;
  onClose: () => void;
};

export function FrontDialog({ card, onClose }: FrontDialogProps) {
  const t = useTranslations("studio");
  const [state, formAction, pending] = useActionState(updateCardFront, idleActionState);
  useCloseOnSuccess(state, () => onClose());

  return (
    <Dialog title={t("editFrontTitle")} closeLabel={t("close")} onClose={onClose}>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="cardId" value={card.id} />
        <label className="block text-sm">
          <span>{t("fields.title")}</span>
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={card.title}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span>{t("fields.definition")}</span>
          <textarea
            name="definition"
            required
            rows={5}
            maxLength={4000}
            defaultValue={card.definition}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <ErrorLine error={state.error} />
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm">
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-pine px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending ? t("saving") : t("save")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
