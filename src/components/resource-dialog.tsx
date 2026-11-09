"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { addResource, updateResource } from "@/actions/cards";
import { idleActionState } from "@/lib/action-state";
import { RESOURCE_CATEGORIES, type Resource, type ResourceCategory } from "@/lib/types";
import { Dialog } from "./dialog";
import { ErrorLine } from "./error-line";
import { useCloseOnSuccess } from "./use-close-on-success";

type ResourceDialogProps = {
  mode: "add" | "edit";
  cardId: string;
  category: ResourceCategory;
  resource?: Resource;
  onClose: (category?: ResourceCategory) => void;
};

export function ResourceDialog({ mode, cardId, category, resource, onClose }: ResourceDialogProps) {
  const t = useTranslations("studio");
  const action = mode === "add" ? addResource : updateResource;
  const [state, formAction, pending] = useActionState(action, idleActionState);
  useCloseOnSuccess(state, (next) => onClose(next.category));

  return (
    <Dialog
      title={mode === "add" ? t("addTitle") : t("editResourceTitle")}
      closeLabel={t("close")}
      onClose={() => onClose()}
    >
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="cardId" value={cardId} />
        {resource ? <input type="hidden" name="resourceId" value={resource.id} /> : null}
        <label className="block text-sm">
          <span>{t("fields.category")}</span>
          <select
            name="category"
            defaultValue={resource?.category ?? category}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          >
            {RESOURCE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {t(`categories.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span>{t("fields.title")}</span>
          <input
            name="title"
            required
            maxLength={160}
            defaultValue={resource?.title ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span>{t("fields.url")}</span>
          <input
            name="url"
            type="url"
            required
            inputMode="url"
            placeholder="https://"
            defaultValue={resource?.url ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span>
            {t("fields.source")} <span className="text-muted">({t("fields.optional")})</span>
          </span>
          <input
            name="source"
            maxLength={80}
            defaultValue={resource?.source ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span>
            {t("fields.note")} <span className="text-muted">({t("fields.optional")})</span>
          </span>
          <textarea
            name="note"
            rows={3}
            maxLength={500}
            defaultValue={resource?.note ?? ""}
            className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2"
          />
        </label>
        <p className="text-xs leading-5 text-muted">{t("httpsHint")}</p>
        <ErrorLine error={state.error} />
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={() => onClose()} className="rounded-full px-4 py-2 text-sm">
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
