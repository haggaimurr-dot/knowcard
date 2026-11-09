import { normalizeHttpsUrl } from "./url";
import {
  isResourceCategory,
  type Card,
  type Resource,
  type ResourceCategory,
  type StoreResult,
} from "./types";

const TITLE_MAX = 120;
const DEFINITION_MAX = 4000;
const RESOURCE_TITLE_MAX = 160;
const NOTE_MAX = 500;
const SOURCE_MAX = 80;

export type CardFrontInput = {
  title: string;
  definition: string;
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

function replaceCard(cards: readonly Card[], next: Card): Card[] {
  return cards.map((card) => (card.id === next.id ? next : card));
}

function findCard(cards: readonly Card[], cardId: string): StoreResult<Card> {
  const card = cards.find((item) => item.id === cardId);
  if (!card) return { ok: false, error: "not_found" };
  return { ok: true, data: card };
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

function readCard(value: unknown): Card | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id.trim()) return null;
  if (typeof record.title !== "string" || !record.title.trim()) return null;
  if (typeof record.definition !== "string" || !record.definition.trim()) return null;
  if (!Array.isArray(record.resources)) return null;

  const resources: Resource[] = [];
  for (const entry of record.resources) {
    const resource = readResource(entry);
    if (!resource) return null;
    resources.push(resource);
  }

  return {
    id: record.id.trim(),
    title: record.title.trim(),
    definition: record.definition.trim(),
    resources,
  };
}

export function parseCards(value: unknown): Card[] {
  if (!Array.isArray(value)) {
    throw new Error("cards.json must be an array");
  }

  return value.map((entry, index) => {
    const card = readCard(entry);
    if (!card) {
      throw new Error(`cards.json[${index}] is invalid`);
    }
    return card;
  });
}

function normalizeResource(
  input: ResourceInput,
): StoreResult<{
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

export function createCardRecord(
  cards: readonly Card[],
  input: CardFrontInput,
  createId: IdFactory,
): StoreResult<{ cards: Card[]; card: Card }> {
  const title = requiredText(input.title, TITLE_MAX, "missing_title");
  if (!title.ok) return title;
  const definition = requiredText(input.definition, DEFINITION_MAX, "missing_definition");
  if (!definition.ok) return definition;

  const card: Card = {
    id: createId(),
    title: title.data,
    definition: definition.data,
    resources: [],
  };

  return { ok: true, data: { cards: [...cards, card], card } };
}

export function updateCardFrontRecord(
  cards: readonly Card[],
  cardId: string,
  input: CardFrontInput,
): StoreResult<{ cards: Card[]; card: Card }> {
  const current = findCard(cards, cardId);
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

  return { ok: true, data: { cards: replaceCard(cards, card), card } };
}

export function addResourceRecord(
  cards: readonly Card[],
  cardId: string,
  input: ResourceInput,
  createId: IdFactory,
): StoreResult<{ cards: Card[]; card: Card }> {
  const current = findCard(cards, cardId);
  if (!current.ok) return current;

  const resource = normalizeResource(input);
  if (!resource.ok) return resource;

  const card: Card = {
    ...current.data,
    resources: [...current.data.resources, { id: createId(), ...resource.data }],
  };

  return { ok: true, data: { cards: replaceCard(cards, card), card } };
}

export function updateResourceRecord(
  cards: readonly Card[],
  cardId: string,
  resourceId: string,
  input: ResourceInput,
): StoreResult<{ cards: Card[]; card: Card }> {
  const current = findCard(cards, cardId);
  if (!current.ok) return current;

  const index = current.data.resources.findIndex((resource) => resource.id === resourceId);
  if (index === -1) return { ok: false, error: "not_found" };

  const resource = normalizeResource(input);
  if (!resource.ok) return resource;

  const resources = current.data.resources.map((item, itemIndex) =>
    itemIndex === index ? { id: item.id, ...resource.data } : item,
  );
  const card: Card = { ...current.data, resources };

  return { ok: true, data: { cards: replaceCard(cards, card), card } };
}

export function deleteResourceRecord(
  cards: readonly Card[],
  cardId: string,
  resourceId: string,
): StoreResult<{ cards: Card[]; card: Card }> {
  const current = findCard(cards, cardId);
  if (!current.ok) return current;

  if (!current.data.resources.some((resource) => resource.id === resourceId)) {
    return { ok: false, error: "not_found" };
  }

  const card: Card = {
    ...current.data,
    resources: current.data.resources.filter((resource) => resource.id !== resourceId),
  };

  return { ok: true, data: { cards: replaceCard(cards, card), card } };
}
