"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "./empty-state";
import { PlusIcon } from "./line-icons";
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
      <div className="h-full">
        <EmptyState
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <button
              type="button"
              className="quiet-chip"
              onClick={(event) => {
                event.stopPropagation();
                onAdd();
              }}
            >
              <PlusIcon />
              {t("emptyAction")}
            </button>
          }
        />
      </div>
    );
  }

  return (
    <ul id={`resources-${category}`} className="flex flex-col gap-3">
      {resources.map((resource) => (
        <ResourceItem key={resource.id} resource={resource} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
