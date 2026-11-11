"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { ActionState } from "@/lib/action-state";
import { idleActionState } from "@/lib/action-state";
import { Dialog } from "./dialog";
import { ErrorLine } from "./error-line";
import { ghostButtonClass, primaryButtonClass } from "./library-styles";
import { useCloseOnSuccess } from "./use-close-on-success";

type NameDialogProps = {
  title: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  hidden?: Record<string, string>;
  initialValue?: string;
  onClose: () => void;
};

export function NameDialog({ title, action, hidden, initialValue = "", onClose }: NameDialogProps) {
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
        <label className="block text-sm">
          <span>{t("nameLabel")}</span>
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={initialValue}
            className="mt-1 min-h-11 w-full rounded-xl border border-line bg-white px-3"
          />
        </label>
        <ErrorLine error={state.error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ghostButtonClass}>
            {t("cancel")}
          </button>
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? t("saving") : t("save")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
