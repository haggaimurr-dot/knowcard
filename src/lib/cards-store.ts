import { normalizeHttpsUrl } from "./url";
import {
  RESERVED_CARD_ID,
  isResourceCategory,
  type Card,
  type Category,
  type Group,
  type Resource,
  type ResourceCategory,
  type StoreResult,
  type StoreV2,
} from "./types";

const TITLE_MAX = 120;
const DEFINITION_MAX = 4000;
const RESOURCE_TITLE_MAX = 160;
const NOTE_MAX = 500;
const SOURCE_MAX = 80;

const MIGRATED_CATEGORY_ID = "migrated";
const MIGRATED_GROUP_ID = "migrated";

export type CardFrontInput = {
  title: string;
  definition: string;
};

export type CreateCardInput = CardFrontInput & {
  groupId?: string;
};

export type NameInput = {
  title: string;
};

export type ResourceInput = {
  category: string;
  title: string;
  url: string;
  note?: string;
  source?: string;
};

export type IdFactory = () => string;

function requiredText(
  value: string,
  max: number,
  emptyError: "missing_title" | "missing_definition",
): StoreResult<string> {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: emptyError };
  if (trimmed.length > max) return { ok: false, error: "too_long" };
  return { ok: true, data: trimmed };
}

function optionalText(value: string | undefined, max: number): StoreResult<string | undefined> {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return { ok: true, data: undefined };
  if (trimmed.length > max) return { ok: false, error: "too_long" };
  return { ok: true, data: trimmed };
}

function nextSort(items: readonly { sortOrder: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1;
}

function bySort<T extends { sortOrder: number; title: string }>(left: T, right: T): number {
  return left.sortOrder - right.sortOrder || left.title.localeCompare(right.title, "zh-Hans");
}

function replaceCard(store: StoreV2, next: Card): StoreV2 {
  return {
    ...store,
    cards: store.cards.map((card) => (card.id === next.id ? next : card)),
  };
}

function findCard(store: StoreV2, cardId: string): StoreResult<Card> {
  const card = store.cards.find((item) => item.id === cardId);
  if (!card) return { ok: false, error: "not_found" };
  return { ok: true, data: card };
}

function findGroup(store: StoreV2, groupId: string): StoreResult<Group> {
  const group = store.groups.find((item) => item.id === groupId.trim());
  if (!group) return { ok: false, error: "not_found" };
  return { ok: true, data: group };
}

function allocateCardId(createId: IdFactory, store: StoreV2): StoreResult<string> {
  const id = createId().trim();
  if (!id || id === RESERVED_CARD_ID) return { ok: false, error: "reserved_id" };
  if (store.cards.some((card) => card.id === id)) return { ok: false, error: "reserved_id" };
  return { ok: true, data: id };
}

function readResource(value: unknown): Resource | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id.trim()) return null;
  if (typeof record.category !== "string" || !isResourceCategory(record.category)) return null;
  if (typeof record.title !== "string" || !record.title.trim()) return null;
  if (typeof record.url !== "string") return null;
  const url = normalizeHttpsUrl(record.url);
  if (!url.ok) return null;

  const note = typeof record.note === "string" && record.note.trim() ? record.note.trim() : undefined;
  const source =
    typeof record.source === "string" && record.source.trim() ? record.source.trim() : undefined;

  return {
    id: record.id.trim(),
    category: record.category,
    title: record.title.trim(),
    url: url.data,
    ...(note ? { note } : {}),
    ...(source ? { source } : {}),
  };
}

function readResources(value: unknown): Resource[] | null {
  if (!Array.isArray(value)) return null;
  const resources: Resource[] = [];
  for (const entry of value) {
    const resource = readResource(entry);
    if (!resource) return null;
    resources.push(resource);
  }
  return resources;
}

function readCardBody(value: unknown): Omit<Card, "groupId"> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id.trim()) return null;
  if (typeof record.title !== "string" || !record.title.trim()) return null;
  if (typeof record.definition !== "string" || !record.definition.trim()) return null;
  const resources = readResources(record.resources);
  if (!resources) return null;

  return {
    id: record.id.trim(),
    title: record.title.trim(),
    definition: record.definition.trim(),
    resources,
  };
}

function readCategory(value: unknown): Category | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id.trim()) return null;
  if (typeof record.title !== "string" || !record.title.trim()) return null;
  if (typeof record.sortOrder !== "number" || !Number.isFinite(record.sortOrder)) return null;
  return { id: record.id.trim(), title: record.title.trim(), sortOrder: record.sortOrder };
}

function readGroup(value: unknown): Group | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id.trim()) return null;
  if (typeof record.categoryId !== "string" || !record.categoryId.trim()) return null;
  if (typeof record.title !== "string" || !record.title.trim()) return null;
  if (typeof record.sortOrder !== "number" || !Number.isFinite(record.sortOrder)) return null;
  return {
    id: record.id.trim(),
    categoryId: record.categoryId.trim(),
    title: record.title.trim(),
    sortOrder: record.sortOrder,
  };
}

function readCard(value: unknown): Card | null {
  const body = readCardBody(value);
  if (!body || !value || typeof value !== "object") return null;
  const groupId = (value as Record<string, unknown>).groupId;
  if (typeof groupId !== "string" || !groupId.trim()) return null;
  return { ...body, groupId: groupId.trim() };
}

function migrateV1(entries: readonly unknown[]): StoreV2 {
  const cards = entries.map((entry, index) => {
    const card = readCardBody(entry);
    if (!card) throw new Error(`cards.json[${index}] is invalid`);
    if (card.id === RESERVED_CARD_ID) throw new Error("card id all is reserved");
    return { ...card, groupId: MIGRATED_GROUP_ID };
  });

  return {
    version: 2,
    categories: [{ id: MIGRATED_CATEGORY_ID, title: "未分类", sortOrder: 0 }],
    groups: [
      {
        id: MIGRATED_GROUP_ID,
        categoryId: MIGRATED_CATEGORY_ID,
        title: "未分组",
        sortOrder: 0,
      },
    ],
    cards,
  };
}

export function parseStore(value: unknown): StoreV2 {
  if (Array.isArray(value)) return migrateV1(value);
  if (!value || typeof value !== "object") {
    throw new Error("cards.json must be a v2 store or a v1 array");
  }

  const record = value as Record<string, unknown>;
  if (record.version !== 2) throw new Error("cards.json version must be 2");
  if (!Array.isArray(record.categories) || !Array.isArray(record.groups) || !Array.isArray(record.cards)) {
    throw new Error("cards.json is missing categories, groups, or cards");
  }

  const categories: Category[] = [];
  const categoryIds = new Set<string>();
  const categoryTitles = new Set<string>();
  for (const [index, entry] of record.categories.entries()) {
    const category = readCategory(entry);
    if (!category) throw new Error(`categories[${index}] is invalid`);
    if (categoryIds.has(category.id)) throw new Error(`duplicate category id ${category.id}`);
    if (categoryTitles.has(category.title)) throw new Error(`duplicate category title`);
    categoryIds.add(category.id);
    categoryTitles.add(category.title);
    categories.push(category);
  }

  const groups: Group[] = [];
  const groupIds = new Set<string>();
  const groupTitles = new Map<string, Set<string>>();
  for (const [index, entry] of record.groups.entries()) {
    const group = readGroup(entry);
    if (!group) throw new Error(`groups[${index}] is invalid`);
    if (!categoryIds.has(group.categoryId)) throw new Error(`groups[${index}] category is missing`);
    if (groupIds.has(group.id)) throw new Error(`duplicate group id ${group.id}`);
    const titles = groupTitles.get(group.categoryId) ?? new Set<string>();
    if (titles.has(group.title)) throw new Error(`duplicate group title`);
    titles.add(group.title);
    groupTitles.set(group.categoryId, titles);
    groupIds.add(group.id);
    groups.push(group);
  }

  const cards: Card[] = [];
  const cardIds = new Set<string>();
  for (const [index, entry] of record.cards.entries()) {
    const card = readCard(entry);
    if (!card) throw new Error(`cards[${index}] is invalid`);
    if (card.id === RESERVED_CARD_ID) throw new Error("card id all is reserved");
    if (!groupIds.has(card.groupId)) throw new Error(`cards[${index}] group is missing`);
    if (cardIds.has(card.id)) throw new Error(`duplicate card id ${card.id}`);
    cardIds.add(card.id);
    cards.push(card);
  }

  return { version: 2, categories, groups, cards };
}

export function serializeStore(store: StoreV2): string {
  return `${JSON.stringify(store, null, 2)}\n`;
}

export function listCategories(store: StoreV2): Category[] {
  return [...store.categories].sort(bySort);
}

export function getCategory(store: StoreV2, categoryId: string): Category | null {
  return store.categories.find((category) => category.id === categoryId) ?? null;
}

export function listGroups(store: StoreV2, categoryId?: string): Group[] {
  return store.groups
    .filter((group) => !categoryId || group.categoryId === categoryId)
    .sort(bySort);
}

export function getGroup(store: StoreV2, groupId: string): Group | null {
  return store.groups.find((group) => group.id === groupId) ?? null;
}

export function listCardsByGroup(store: StoreV2, groupId: string): Card[] {
  return store.cards.filter((card) => card.groupId === groupId);
}

export function createCategoryRecord(
  store: StoreV2,
  input: NameInput,
  createId: IdFactory,
): StoreResult<{ store: StoreV2; category: Category }> {
  const title = requiredText(input.title, TITLE_MAX, "missing_title");
  if (!title.ok) return title;
  if (store.categories.some((category) => category.title === title.data)) {
    return { ok: false, error: "duplicate_title" };
  }

  const category: Category = {
    id: createId(),
    title: title.data,
    sortOrder: nextSort(store.categories),
  };

  return {
    ok: true,
    data: { store: { ...store, categories: [...store.categories, category] }, category },
  };
}

export function updateCategoryRecord(
  store: StoreV2,
  categoryId: string,
  input: NameInput,
): StoreResult<{ store: StoreV2; category: Category }> {
  const current = getCategory(store, categoryId);
  if (!current) return { ok: false, error: "not_found" };
  const title = requiredText(input.title, TITLE_MAX, "missing_title");
  if (!title.ok) return title;
  if (store.categories.some((category) => category.id !== categoryId && category.title === title.data)) {
    return { ok: false, error: "duplicate_title" };
  }

  const category: Category = { ...current, title: title.data };
  return {
    ok: true,
    data: {
      category,
      store: {
        ...store,
        categories: store.categories.map((item) => (item.id === categoryId ? category : item)),
      },
    },
  };
}

export function deleteCategoryRecord(
  store: StoreV2,
  categoryId: string,
): StoreResult<{ store: StoreV2; deletedGroups: number; deletedCards: number }> {
  if (!getCategory(store, categoryId)) return { ok: false, error: "not_found" };
  const groupIds = new Set(
    store.groups.filter((group) => group.categoryId === categoryId).map((group) => group.id),
  );
  const deletedCards = store.cards.filter((card) => groupIds.has(card.groupId)).length;

  return {
    ok: true,
    data: {
      deletedGroups: groupIds.size,
      deletedCards,
      store: {
        ...store,
        categories: store.categories.filter((category) => category.id !== categoryId),
        groups: store.groups.filter((group) => group.categoryId !== categoryId),
        cards: store.cards.filter((card) => !groupIds.has(card.groupId)),
      },
    },
  };
}

export function createGroupRecord(
  store: StoreV2,
  input: { categoryId: string; title: string },
  createId: IdFactory,
): StoreResult<{ store: StoreV2; group: Group }> {
  if (!getCategory(store, input.categoryId)) return { ok: false, error: "not_found" };
  const title = requiredText(input.title, TITLE_MAX, "missing_title");
  if (!title.ok) return title;
  const siblings = store.groups.filter((group) => group.categoryId === input.categoryId);
  if (siblings.some((group) => group.title === title.data)) {
    return { ok: false, error: "duplicate_title" };
  }

  const group: Group = {
    id: createId(),
    categoryId: input.categoryId,
    title: title.data,
    sortOrder: nextSort(siblings),
  };

  return {
    ok: true,
    data: { store: { ...store, groups: [...store.groups, group] }, group },
  };
}

export function updateGroupRecord(
  store: StoreV2,
  groupId: string,
  input: NameInput,
): StoreResult<{ store: StoreV2; group: Group }> {
  const current = getGroup(store, groupId);
  if (!current) return { ok: false, error: "not_found" };
  const title = requiredText(input.title, TITLE_MAX, "missing_title");
  if (!title.ok) return title;
  const duplicate = store.groups.some(
    (group) =>
      group.id !== groupId && group.categoryId === current.categoryId && group.title === title.data,
  );
  if (duplicate) return { ok: false, error: "duplicate_title" };

  const group: Group = { ...current, title: title.data };
  return {
    ok: true,
    data: {
      group,
      store: {
        ...store,
        groups: store.groups.map((item) => (item.id === groupId ? group : item)),
      },
    },
  };
}

export function deleteGroupRecord(
  store: StoreV2,
  groupId: string,
): StoreResult<{ store: StoreV2; deletedCards: number }> {
  if (!getGroup(store, groupId)) return { ok: false, error: "not_found" };
  const deletedCards = store.cards.filter((card) => card.groupId === groupId).length;
  return {
    ok: true,
    data: {
      deletedCards,
      store: {
        ...store,
        groups: store.groups.filter((group) => group.id !== groupId),
        cards: store.cards.filter((card) => card.groupId !== groupId),
      },
    },
  };
}

export function createCardRecord(
  store: StoreV2,
  input: CreateCardInput,
  createId: IdFactory,
): StoreResult<{ store: StoreV2; card: Card }> {
  const group = findGroup(store, input.groupId ?? "");
  if (!group.ok) return group;

  const title = requiredText(input.title, TITLE_MAX, "missing_title");
  if (!title.ok) return title;
  const definition = requiredText(input.definition, DEFINITION_MAX, "missing_definition");
  if (!definition.ok) return definition;

  const id = allocateCardId(createId, store);
  if (!id.ok) return id;

  const card: Card = {
    id: id.data,
    groupId: group.data.id,
    title: title.data,
    definition: definition.data,
    resources: [],
  };

  return { ok: true, data: { store: { ...store, cards: [...store.cards, card] }, card } };
}

export function updateCardFrontRecord(
  store: StoreV2,
  cardId: string,
  input: CardFrontInput,
): StoreResult<{ store: StoreV2; card: Card }> {
  const current = findCard(store, cardId);
  if (!current.ok) return current;

  const title = requiredText(input.title, TITLE_MAX, "missing_title");
  if (!title.ok) return title;
  const definition = requiredText(input.definition, DEFINITION_MAX, "missing_definition");
  if (!definition.ok) return definition;

  const card: Card = {
    ...current.data,
    title: title.data,
    definition: definition.data,
  };

  return { ok: true, data: { store: replaceCard(store, card), card } };
}

function normalizeResource(input: ResourceInput): StoreResult<{
  category: ResourceCategory;
  title: string;
  url: string;
  note?: string;
  source?: string;
}> {
  if (!isResourceCategory(input.category)) {
    return { ok: false, error: "invalid_category" };
  }

  const title = requiredText(input.title, RESOURCE_TITLE_MAX, "missing_title");
  if (!title.ok) return title;

  const url = normalizeHttpsUrl(input.url);
  if (!url.ok) return url;

  const note = optionalText(input.note, NOTE_MAX);
  if (!note.ok) return note;

  const source = optionalText(input.source, SOURCE_MAX);
  if (!source.ok) return source;

  return {
    ok: true,
    data: {
      category: input.category,
      title: title.data,
      url: url.data,
      ...(note.data ? { note: note.data } : {}),
      ...(source.data ? { source: source.data } : {}),
    },
  };
}

export function addResourceRecord(
  store: StoreV2,
  cardId: string,
  input: ResourceInput,
  createId: IdFactory,
): StoreResult<{ store: StoreV2; card: Card }> {
  const current = findCard(store, cardId);
  if (!current.ok) return current;

  const resource = normalizeResource(input);
  if (!resource.ok) return resource;

  const card: Card = {
    ...current.data,
    resources: [...current.data.resources, { id: createId(), ...resource.data }],
  };

  return { ok: true, data: { store: replaceCard(store, card), card } };
}

export function updateResourceRecord(
  store: StoreV2,
  cardId: string,
  resourceId: string,
  input: ResourceInput,
): StoreResult<{ store: StoreV2; card: Card }> {
  const current = findCard(store, cardId);
  if (!current.ok) return current;

  const index = current.data.resources.findIndex((resource) => resource.id === resourceId);
  if (index === -1) return { ok: false, error: "not_found" };

  const resource = normalizeResource(input);
  if (!resource.ok) return resource;

  const resources = current.data.resources.map((item, itemIndex) =>
    itemIndex === index ? { id: item.id, ...resource.data } : item,
  );
  const card: Card = { ...current.data, resources };

  return { ok: true, data: { store: replaceCard(store, card), card } };
}

export function deleteResourceRecord(
  store: StoreV2,
  cardId: string,
  resourceId: string,
): StoreResult<{ store: StoreV2; card: Card }> {
  const current = findCard(store, cardId);
  if (!current.ok) return current;

  if (!current.data.resources.some((resource) => resource.id === resourceId)) {
    return { ok: false, error: "not_found" };
  }

  const card: Card = {
    ...current.data,
    resources: current.data.resources.filter((resource) => resource.id !== resourceId),
  };

  return { ok: true, data: { store: replaceCard(store, card), card } };
}

export function deleteCardRecord(
  store: StoreV2,
  cardId: string,
): StoreResult<{ store: StoreV2; card: Card; deletedCards: number }> {
  const current = findCard(store, cardId);
  if (!current.ok) return current;

  return {
    ok: true,
    data: {
      card: current.data,
      deletedCards: 1,
      store: { ...store, cards: store.cards.filter((card) => card.id !== cardId) },
    },
  };
}

function cloneResource(resource: Resource, createId: IdFactory): Resource {
  return {
    id: createId(),
    category: resource.category,
    title: resource.title,
    url: resource.url,
    ...(resource.note ? { note: resource.note } : {}),
    ...(resource.source ? { source: resource.source } : {}),
  };
}

export function copyCardRecord(
  store: StoreV2,
  cardId: string,
  targetGroupId: string,
  createId: IdFactory,
): StoreResult<{ store: StoreV2; card: Card }> {
  const current = findCard(store, cardId);
  if (!current.ok) return current;
  const target = findGroup(store, targetGroupId);
  if (!target.ok) return target;
  if (current.data.groupId === target.data.id) return { ok: false, error: "same_group" };

  const id = allocateCardId(createId, store);
  if (!id.ok) return id;

  const card: Card = {
    id: id.data,
    groupId: target.data.id,
    title: current.data.title,
    definition: current.data.definition,
    resources: current.data.resources.map((resource) => cloneResource(resource, createId)),
  };

  return { ok: true, data: { store: { ...store, cards: [...store.cards, card] }, card } };
}

export function moveCardRecord(
  store: StoreV2,
  cardId: string,
  targetGroupId: string,
): StoreResult<{ store: StoreV2; card: Card }> {
  const current = findCard(store, cardId);
  if (!current.ok) return current;
  const target = findGroup(store, targetGroupId);
  if (!target.ok) return target;
  if (current.data.groupId === target.data.id) return { ok: false, error: "same_group" };

  const card: Card = { ...current.data, groupId: target.data.id };
  return { ok: true, data: { store: replaceCard(store, card), card } };
}
