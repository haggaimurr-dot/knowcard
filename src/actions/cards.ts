"use server";

import { revalidatePath, updateTag } from "next/cache";
import { hasLocale } from "next-intl";
import {
  addResourceRecord,
  copyCardRecord,
  createCardRecord,
  createCategoryRecord,
  createGroupRecord,
  deleteCardRecord,
  deleteCategoryRecord,
  deleteGroupRecord,
  deleteResourceRecord,
  getCategory as readCategory,
  getGroup as readGroup,
  listCardsByGroup as readCardsByGroup,
  listCategories as readCategories,
  listGroups as readGroups,
  moveCardRecord,
  updateCardFrontRecord,
  updateCategoryRecord,
  updateGroupRecord,
  updateResourceRecord,
} from "@/lib/cards-store";
import { listCardsCached, listStoreCached, mutateStore } from "@/lib/cards-repo";
import type { ActionState } from "@/lib/action-state";
import { isResourceCategory, type Card, type Category, type Group, type StoreV2 } from "@/lib/types";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function invalidate() {
  updateTag("cards");
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/cards`);
    revalidatePath(`/${locale}/cards/all`);
  }
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function success(category?: ActionState["category"], cardId?: string): ActionState {
  return {
    status: "success",
    ...(category ? { category } : {}),
    ...(cardId ? { cardId } : {}),
  };
}

function cardIdFactory(): () => string {
  let mintedCard = false;
  return () => {
    if (!mintedCard) {
      mintedCard = true;
      return newId("card");
    }
    return newId("res");
  };
}

export async function getLibrary(): Promise<StoreV2> {
  return listStoreCached();
}

export async function listCards(): Promise<Card[]> {
  return listCardsCached();
}

export async function listCategories(): Promise<Category[]> {
  return readCategories(await listStoreCached());
}

export async function getCategory(id: string): Promise<Category | null> {
  return readCategory(await listStoreCached(), id);
}

export async function listGroups(categoryId?: string): Promise<Group[]> {
  return readGroups(await listStoreCached(), categoryId);
}

export async function getGroup(id: string): Promise<Group | null> {
  return readGroup(await listStoreCached(), id);
}

export async function listCardsByGroup(groupId: string): Promise<Card[]> {
  return readCardsByGroup(await listStoreCached(), groupId);
}

export async function getCard(id: string): Promise<Card | null> {
  const cards = await listCardsCached();
  return cards.find((card) => card.id === id) ?? null;
}

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) =>
    createCategoryRecord(store, { title: field(formData, "title") }, () => newId("cat")),
  );
  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function updateCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) =>
    updateCategoryRecord(store, field(formData, "categoryId"), { title: field(formData, "title") }),
  );
  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function deleteCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) => deleteCategoryRecord(store, field(formData, "categoryId")));
  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function createGroup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) =>
    createGroupRecord(
      store,
      { categoryId: field(formData, "categoryId"), title: field(formData, "title") },
      () => newId("grp"),
    ),
  );
  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function updateGroup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) =>
    updateGroupRecord(store, field(formData, "groupId"), { title: field(formData, "title") }),
  );
  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function deleteGroup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) => deleteGroupRecord(store, field(formData, "groupId")));
  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function createCard(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = field(formData, "locale");
  const result = await mutateStore((store) =>
    createCardRecord(
      store,
      {
        title: field(formData, "title"),
        definition: field(formData, "definition"),
        groupId: field(formData, "groupId"),
      },
      () => newId("card"),
    ),
  );

  if (!result.ok) return { status: "error", error: result.error };
  const card = result.data.card;
  if (!card) return { status: "error", error: "not_found" };

  invalidate();

  if (!hasLocale(routing.locales, locale)) {
    return success();
  }

  redirect({ href: `/cards/${card.id}`, locale });
  return success();
}

export async function updateCardFront(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const result = await mutateStore((store) =>
    updateCardFrontRecord(store, cardId, {
      title: field(formData, "title"),
      definition: field(formData, "definition"),
    }),
  );

  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function deleteCard(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = field(formData, "locale");
  const from = field(formData, "from");
  const result = await mutateStore((store) => deleteCardRecord(store, field(formData, "cardId")));
  if (!result.ok) return { status: "error", error: result.error };
  const card = result.data.card;
  if (!card) return { status: "error", error: "not_found" };

  invalidate();

  if (from === "studio" && hasLocale(routing.locales, locale)) {
    redirect({ href: `/groups/${card.groupId}`, locale });
  }

  return success();
}

export async function copyCard(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) =>
    copyCardRecord(store, field(formData, "cardId"), field(formData, "targetGroupId"), cardIdFactory()),
  );
  if (!result.ok) return { status: "error", error: result.error };
  const card = result.data.card;
  if (!card) return { status: "error", error: "not_found" };
  invalidate();
  return success(undefined, card.id);
}

export async function moveCard(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await mutateStore((store) =>
    moveCardRecord(store, field(formData, "cardId"), field(formData, "targetGroupId")),
  );
  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}

export async function addResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const category = field(formData, "category");
  const result = await mutateStore((store) =>
    addResourceRecord(
      store,
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
  invalidate();
  return success(isResourceCategory(category) ? category : undefined);
}

export async function updateResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const resourceId = field(formData, "resourceId");
  const category = field(formData, "category");
  const result = await mutateStore((store) =>
    updateResourceRecord(store, cardId, resourceId, {
      category,
      title: field(formData, "title"),
      url: field(formData, "url"),
      note: field(formData, "note"),
      source: field(formData, "source"),
    }),
  );

  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success(isResourceCategory(category) ? category : undefined);
}

export async function deleteResource(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cardId = field(formData, "cardId");
  const resourceId = field(formData, "resourceId");
  const result = await mutateStore((store) => deleteResourceRecord(store, cardId, resourceId));

  if (!result.ok) return { status: "error", error: result.error };
  invalidate();
  return success();
}
