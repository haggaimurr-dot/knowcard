import { getCategory, getGroup, listCategories, listGroups } from "./cards-store";
import type { Card, Category, Group, StoreV2 } from "./types";

export type GroupOption = {
  id: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  sortOrder: number;
  categorySortOrder: number;
  cardCount: number;
};

export type CategorySection = {
  id: string;
  title: string;
  groups: {
    id: string;
    title: string;
    cardCount: number;
  }[];
  groupCount: number;
  cardCount: number;
};

export type CardSummary = {
  id: string;
  title: string;
  definition: string;
  groupId: string;
  categoryTitle: string;
  groupTitle: string;
  resourceCount: number;
};

export type CardOwner = {
  card: Card;
  group: Group;
  category: Category;
};

export function groupOptions(store: StoreV2): GroupOption[] {
  return listCategories(store).flatMap((category) =>
    listGroups(store, category.id).map((group) => ({
      id: group.id,
      title: group.title,
      categoryId: category.id,
      categoryTitle: category.title,
      sortOrder: group.sortOrder,
      categorySortOrder: category.sortOrder,
      cardCount: store.cards.filter((card) => card.groupId === group.id).length,
    })),
  );
}

export function categorySections(store: StoreV2): CategorySection[] {
  return listCategories(store).map((category) => {
    const groups = listGroups(store, category.id).map((group) => ({
      id: group.id,
      title: group.title,
      cardCount: store.cards.filter((card) => card.groupId === group.id).length,
    }));
    return {
      id: category.id,
      title: category.title,
      groups,
      groupCount: groups.length,
      cardCount: groups.reduce((sum, group) => sum + group.cardCount, 0),
    };
  });
}

export function cardSummaries(store: StoreV2, groupId?: string): CardSummary[] {
  const options = groupOptions(store);
  const order = new Map(options.map((group, index) => [group.id, index]));
  const byId = new Map(options.map((group) => [group.id, group]));

  return store.cards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => !groupId || card.groupId === groupId)
    .sort((left, right) => {
      const groupOrder = (order.get(left.card.groupId) ?? 0) - (order.get(right.card.groupId) ?? 0);
      return groupOrder || left.index - right.index;
    })
    .map(({ card }) => {
      const group = byId.get(card.groupId);
      return {
        id: card.id,
        title: card.title,
        definition: card.definition,
        groupId: card.groupId,
        categoryTitle: group?.categoryTitle ?? "",
        groupTitle: group?.title ?? "",
        resourceCount: card.resources.length,
      };
    });
}

export function cardOwner(store: StoreV2, cardId: string): CardOwner | null {
  const card = store.cards.find((item) => item.id === cardId);
  if (!card) return null;
  const group = getGroup(store, card.groupId);
  if (!group) return null;
  const category = getCategory(store, group.categoryId);
  if (!category) return null;
  return { card, group, category };
}
