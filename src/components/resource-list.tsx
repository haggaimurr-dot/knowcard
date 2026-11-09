"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "./empty-state";
import { ResourceItem } from "./resource-item";
import type { Resource, ResourceCategory } from "@/lib/types";

type ResourceListProps = {
  category: ResourceCategory;
  resources: Resource[];
  onAdd: () => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
};

export function ResourceList({ category, resources, onAdd, onEdit, onDelete }: ResourceListProps) {
  const t = useTranslations("studio");

  if (resources.length === 0) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        body={t("emptyBody")}
        action={
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full bg-pine px-4 py-2 text-sm text-white"
          >
            {t("emptyAction")}
          </button>
        }
      />
    );
  }

  return (
    <ul id={`resources-${category}`} className="h-full overflow-y-auto pr-1">
      {resources.map((resource) => (
        <ResourceItem key={resource.id} resource={resource} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
