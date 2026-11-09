"use client";

import { useTranslations } from "next-intl";
import { isHttpsUrl } from "@/lib/url";
import type { Resource } from "@/lib/types";

type ResourceItemProps = {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
};

export function ResourceItem({ resource, onEdit, onDelete }: ResourceItemProps) {
  const t = useTranslations("studio");
  const safe = isHttpsUrl(resource.url);

  return (
    <li className="flex items-start gap-3 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        {safe ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:underline"
          >
            {resource.title}
          </a>
        ) : (
          <p className="font-medium">{resource.title}</p>
        )}
        {resource.source ? <p className="mt-1 text-xs text-muted">{resource.source}</p> : null}
        {resource.note ? <p className="mt-1 text-sm leading-6 text-ink/80">{resource.note}</p> : null}
        {safe ? (
          <p className="mt-1 truncate text-xs text-pine">{t("openExternal")}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => onEdit(resource)}
          className="rounded-full px-2.5 py-1 text-xs text-ink/80 hover:bg-black/5"
        >
          {t("edit")}
        </button>
        <button
          type="button"
          onClick={() => onDelete(resource)}
          className="rounded-full px-2.5 py-1 text-xs text-persimmon hover:bg-persimmon/10"
        >
          {t("delete")}
        </button>
      </div>
    </li>
  );
}
