"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { copyCard, moveCard } from "@/actions/cards";
import { idleActionState } from "@/lib/action-state";
import type { GroupOption } from "@/lib/library-view";
import { Link } from "@/i18n/navigation";
import { Dialog } from "./dialog";
import { EmptyState } from "./empty-state";
import { ErrorLine } from "./error-line";
import { ghostButtonClass, primaryButtonClass } from "./library-styles";
import { useCloseOnSuccess } from "./use-close-on-success";

type CopyMoveDialogProps = {
  mode: "copy" | "move";
  cardId: string;
  sourceGroupId: string;
  groups: GroupOption[];
  onClose: () => void;
};

export function CopyMoveDialog({ mode, cardId, sourceGroupId, groups, onClose }: CopyMoveDialogProps) {
  const t = useTranslations("library");
  const action = mode === "copy" ? copyCard : moveCard;
  const [state, formAction, pending] = useActionState(action, idleActionState);
  useCloseOnSuccess(mode === "move" ? state : idleActionState, onClose);

  const categories: { id: string; title: string }[] = [];
  for (const group of groups) {
    if (!categories.some((category) => category.id === group.categoryId)) {
      categories.push({ id: group.categoryId, title: group.categoryTitle });
    }
  }

  const hasOtherGroup = groups.some((group) => group.id !== sourceGroupId);
  const copied = mode === "copy" && state.status === "success" && state.cardId;

  return (
    <Dialog
      title={mode === "copy" ? t("copyTitle") : t("moveTitle")}
      closeLabel={t("close")}
      onClose={onClose}
    >
      {copied ? (
        <div className="space-y-4">
          <p role="status" className="text-sm leading-6">
            {t("copied")}
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={ghostButtonClass}>
              {t("close")}
            </button>
            <Link href={`/cards/${state.cardId}`} prefetch={false} className={primaryButtonClass}>
              {t("openCopy")}
            </Link>
          </div>
        </div>
      ) : !hasOtherGroup ? (
        <EmptyState
          title={t("noOtherGroupTitle")}
          body={t("noOtherGroupBody")}
          action={
            <Link href="/cards" prefetch={false} className={primaryButtonClass}>
              {t("goCreateGroup")}
            </Link>
          }
        />
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="cardId" value={cardId} />
          <div className="space-y-3">
            {categories.map((category) => {
              const rows = groups.filter((group) => group.categoryId === category.id);
              if (rows.length === 0) return null;
              return (
                <fieldset key={category.id} className="border-0 p-0">
                  <legend className="px-2 text-xs tracking-wide text-muted">{category.title}</legend>
                  <div className="mt-1">
                    {rows.map((group) => {
                      const current = group.id === sourceGroupId;
                      return (
                        <label
                          key={group.id}
                          className={`flex min-h-11 items-center gap-3 rounded-xl px-2 ${
                            current ? "text-muted" : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="radio"
                            name="targetGroupId"
                            value={group.id}
                            disabled={current}
                            required={!current}
                            className="size-4"
                          />
                          <span className="flex-1 text-sm">{group.title}</span>
                          {current ? <span className="text-xs">{t("current")}</span> : null}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>
          <ErrorLine error={state.error} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={ghostButtonClass}>
              {t("cancel")}
            </button>
            <button type="submit" disabled={pending} className={primaryButtonClass}>
              {pending ? t("saving") : mode === "copy" ? t("copySubmit") : t("moveSubmit")}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
