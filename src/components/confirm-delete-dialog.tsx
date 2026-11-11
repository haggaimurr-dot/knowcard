"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { ActionState } from "@/lib/action-state";
import { idleActionState } from "@/lib/action-state";
import { Dialog } from "./dialog";
import { ErrorLine } from "./error-line";
import { dangerButtonClass, ghostButtonClass } from "./library-styles";
import { useCloseOnSuccess } from "./use-close-on-success";

type ConfirmDeleteDialogProps = {
  title: string;
  body: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  hidden?: Record<string, string>;
  onClose: () => void;
};

export function ConfirmDeleteDialog({
  title,
  body,
  action,
  hidden,
  onClose,
}: ConfirmDeleteDialogProps) {
  const t = useTranslations("library");
  const [state, formAction, pending] = useActionState(action, idleActionState);
  useCloseOnSuccess(state, () => onClose());

  return (
    <Dialog title={title} closeLabel={t("close")} onClose={onClose}>
      <form action={formAction} className="space-y-4">
        {hidden
          ? Object.entries(hidden).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}
        <p className="text-sm leading-6">{body}</p>
        <ErrorLine error={state.error} />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            data-initial-focus
            onClick={onClose}
            className={ghostButtonClass}
          >
            {t("cancel")}
          </button>
          <button type="submit" disabled={pending} className={dangerButtonClass}>
            {pending ? t("saving") : t("confirmDelete")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
