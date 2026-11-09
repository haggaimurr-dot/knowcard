export const RESOURCE_CATEGORIES = [
  "image",
  "video",
  "blog",
  "document",
  "audio",
  "attachment",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export type Resource = {
  id: string;
  category: ResourceCategory;
  title: string;
  url: string;
  note?: string;
  source?: string;
};

export type Card = {
  id: string;
  title: string;
  definition: string;
  resources: Resource[];
};

export type StoreError =
  | "https_only"
  | "invalid_url"
  | "missing_title"
  | "missing_definition"
  | "not_found"
  | "invalid_category"
  | "too_long";

export type StoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: StoreError };

export function isResourceCategory(value: string): value is ResourceCategory {
  return (RESOURCE_CATEGORIES as readonly string[]).includes(value);
}

export function countByCategory(
  resources: readonly Resource[],
): Record<ResourceCategory, number> {
  const counts: Record<ResourceCategory, number> = {
    image: 0,
    video: 0,
    blog: 0,
    document: 0,
    audio: 0,
    attachment: 0,
  };

  for (const resource of resources) {
    counts[resource.category] += 1;
  }

  return counts;
}
