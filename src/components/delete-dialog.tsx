"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { deleteResource } from "@/actions/cards";
import { idleActionState } from "@/lib/action-state";
import type { Resource } from "@/lib/types";
import { Dialog } from "./dialog";
import { ErrorLine } from "./error-line";
import { useCloseOnSuccess } from "./use-close-on-success";

type DeleteDialogProps = {
  cardId: string;
  resource: Resource;
  onClose: () => void;
};

export function DeleteDialog({ cardId, resource, onClose }: DeleteDialogProps) {
  const t = useTranslations("studio");
  const [state, formAction, pending] = useActionState(deleteResource, idleActionState);
  useCloseOnSuccess(state, () => onClose());

  return (
    <Dialog title={t("deleteTitle")} closeLabel={t("close")} onClose={onClose}>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="cardId" value={cardId} />
        <input type="hidden" name="resourceId" value={resource.id} />
        <p className="text-sm leading-6">
          <span className="font-medium">{resource.title}</span>
          {" · "}
          {t("deleteBody")}
        </p>
        <ErrorLine error={state.error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm">
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-persimmon px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending ? t("saving") : t("confirmDelete")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
