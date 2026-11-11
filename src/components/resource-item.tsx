"use client";

import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { isHttpsUrl } from "@/lib/url";
import type { Resource } from "@/lib/types";
import { CategoryIcon } from "./category-icon";
import { PencilIcon, TrashIcon } from "./line-icons";

type ResourceItemProps = {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
};

function blockFlip(event: MouseEvent) {
  event.stopPropagation();
}

export function ResourceItem({ resource, onEdit, onDelete }: ResourceItemProps) {
  const t = useTranslations("studio");
  const safe = isHttpsUrl(resource.url);

  return (
    <li className="resource-row">
      <div className="resource-plate" aria-hidden>
        <CategoryIcon category={resource.category} className="size-7 text-pine/40" />
      </div>
      <div className="flex min-w-0 flex-1 items-start gap-1">
        <div className="min-w-0 flex-1">
          {safe ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={blockFlip}
              className="block rounded-sm"
            >
              <span className="text-[13px] leading-5 font-semibold">{resource.title}</span>
              {resource.source ? (
                <span className="mt-0.5 block text-[11px] leading-4 text-muted">{resource.source}</span>
              ) : null}
              {resource.note ? (
                <span className="mt-2 block text-xs leading-5 text-ink/75">{resource.note}</span>
              ) : null}
              <span className="mt-2 inline-block text-[11px] font-semibold text-pine underline underline-offset-4">
                {t("openExternal")}
              </span>
            </a>
          ) : (
            <>
              <p className="text-[13px] leading-5 font-semibold">{resource.title}</p>
              {resource.source ? <p className="mt-0.5 text-[11px] leading-4 text-muted">{resource.source}</p> : null}
              {resource.note ? <p className="mt-2 text-xs leading-5 text-ink/75">{resource.note}</p> : null}
            </>
          )}
        </div>
        <div className="flex shrink-0">
          <button
            type="button"
            className="resource-action"
            aria-label={t("edit")}
            onClick={(event) => {
              blockFlip(event);
              onEdit(resource);
            }}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className="resource-action resource-action-delete"
            aria-label={t("delete")}
            onClick={(event) => {
              blockFlip(event);
              onDelete(resource);
            }}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  );
}
