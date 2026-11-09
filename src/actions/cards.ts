"use server";

import { revalidatePath, updateTag } from "next/cache";
import { hasLocale } from "next-intl";
import {
  addResourceRecord,
  createCardRecord,
  deleteResourceRecord,
  updateCardFrontRecord,
  updateResourceRecord,
} from "@/lib/cards-store";
import { listCardsCached, mutateCards } from "@/lib/cards-repo";
import type { ActionState } from "@/lib/action-state";
import { isResourceCategory, type Card } from "@/lib/types";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function invalidate(cardId: string) {
  updateTag("cards");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/cards`);
    revalidatePath(`/${locale}/cards/${cardId}`);
  }
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function success(category?: ActionState["category"]): ActionState {
  return category ? { status: "success", category } : { status: "success" };
}

export async function listCards(): Promise<Card[]> {
  return listCardsCached();
}

export async function getCard(id: string): Promise<Card | null> {
  const cards = await listCardsCached();
  return cards.find((card) => card.id === id) ?? null;
}

export async function createCard(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = field(formData, "locale");
  const result = await mutateCards((cards) =>
    createCardRecord(
      cards,
      {
        title: field(formData, "title"),
        definition: field(formData, "definition"),
      },
      () => newId("card"),
    ),
  );

  if (!result.ok) return { status: "error", error: result.error };

  invalidate(result.data.id);

  if (!hasLocale(routing.locales, locale)) {
    return success();
  }

  redirect({ href: `/cards/${result.data.id}`, locale });
  return success();
}

export async function updateCardFront(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const result = await mutateCards((cards) =>
    updateCardFrontRecord(cards, cardId, {
      title: field(formData, "title"),
      definition: field(formData, "definition"),
    }),
  );

  if (!result.ok) return { status: "error", error: result.error };
  invalidate(cardId);
  return success();
}

export async function addResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const category = field(formData, "category");
  const result = await mutateCards((cards) =>
    addResourceRecord(
      cards,
      cardId,
      {
        category,
        title: field(formData, "title"),
        url: field(formData, "url"),
        note: field(formData, "note"),
        source: field(formData, "source"),
      },
      () => newId("res"),
    ),
  );

  if (!result.ok) return { status: "error", error: result.error };
  invalidate(cardId);
  return success(isResourceCategory(category) ? category : undefined);
}

export async function updateResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const resourceId = field(formData, "resourceId");
  const category = field(formData, "category");
  const result = await mutateCards((cards) =>
    updateResourceRecord(cards, cardId, resourceId, {
      category,
      title: field(formData, "title"),
      url: field(formData, "url"),
      note: field(formData, "note"),
      source: field(formData, "source"),
    }),
  );

  if (!result.ok) return { status: "error", error: result.error };
  invalidate(cardId);
  return success(isResourceCategory(category) ? category : undefined);
}

export async function deleteResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const resourceId = field(formData, "resourceId");
  const result = await mutateCards((cards) => deleteResourceRecord(cards, cardId, resourceId));

  if (!result.ok) return { status: "error", error: result.error };
  invalidate(cardId);
  return success();
}
