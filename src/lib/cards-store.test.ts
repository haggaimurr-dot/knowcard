import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
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
  listCardsByGroup,
  listCategories,
  moveCardRecord,
  parseStore,
  updateCardFrontRecord,
  updateCategoryRecord,
  updateGroupRecord,
  updateResourceRecord,
} from "./cards-store";
import { RESOURCE_CATEGORIES, type Card, type Resource, type StoreV2 } from "./types";

function ids() {
  let n = 0;
  return () => `id-${++n}`;
}

function emptyStore(): StoreV2 {
  return { version: 2, categories: [], groups: [], cards: [] };
}

function storeWithGroup(): StoreV2 {
  return {
    version: 2,
    categories: [{ id: "cat-1", title: "生物学", sortOrder: 0 }],
    groups: [{ id: "grp-1", categoryId: "cat-1", title: "植物生理", sortOrder: 0 }],
    cards: [],
  };
}

function storeWithTwoGroups(): StoreV2 {
  const card: Card = {
    id: "photosynthesis",
    groupId: "plant-physiology",
    title: "光合作用",
    definition: "绿色植物把光变成糖。",
    resources: [
      {
        id: "ps-image",
        category: "image",
        title: "光合作用总览图",
        url: "https://example.com/photo.svg",
        note: "示意图",
        source: "Example",
      },
      {
        id: "ps-audio",
        category: "audio",
        title: "读音",
        url: "https://example.com/audio.ogg",
      },
    ],
  };

  return {
    version: 2,
    categories: [
      { id: "biology", title: "生物学", sortOrder: 0 },
      { id: "chemistry", title: "化学", sortOrder: 1 },
    ],
    groups: [
      { id: "plant-physiology", categoryId: "biology", title: "植物生理", sortOrder: 0 },
      { id: "general-chem", categoryId: "chemistry", title: "无机入门", sortOrder: 0 },
    ],
    cards: [card],
  };
}

test("seed store is v2 with biology and an empty chemistry group", () => {
  const store = parseStore(JSON.parse(readFileSync("data/cards.json", "utf8")) as unknown);
  assert.equal(store.version, 2);

  const biology = store.categories.find((category) => category.id === "biology");
  const chemistry = store.categories.find((category) => category.id === "chemistry");
  const plants = store.groups.find((group) => group.id === "plant-physiology");
  const chem = store.groups.find((group) => group.id === "general-chem");
  const card = store.cards.find((item) => item.id === "photosynthesis");

  assert.equal(biology?.title, "生物学");
  assert.equal(chemistry?.title, "化学");
  assert.equal(plants?.title, "植物生理");
  assert.equal(plants?.categoryId, "biology");
  assert.equal(chem?.title, "无机入门");
  assert.equal(chem?.categoryId, "chemistry");
  assert.ok(card);
  assert.equal(card?.groupId, "plant-physiology");
  assert.equal(listCardsByGroup(store, "general-chem").length, 0);
  assert.equal(listCardsByGroup(store, "plant-physiology").length, 1);

  const categories = new Set(store.cards.flatMap((item) => item.resources.map((resource) => resource.category)));
  for (const category of RESOURCE_CATEGORIES) {
    assert.equal(categories.has(category), true, category);
  }
  for (const resource of store.cards.flatMap((item) => item.resources)) {
    assert.equal(new URL(resource.url).protocol, "https:");
  }
});

test("migrates a v1 card array into StoreV2 on load", () => {
  const store = parseStore([
    {
      id: "photosynthesis",
      title: "光合作用",
      definition: "定义",
      resources: [
        {
          id: "ps-image",
          category: "image",
          title: "图",
          url: "https://example.com/a.svg",
        },
      ],
    },
    {
      id: "newton",
      title: "牛顿",
      definition: "惯性",
      resources: [],
    },
  ]);

  assert.equal(store.version, 2);
  assert.equal(store.categories.length, 1);
  assert.equal(store.groups.length, 1);
  assert.equal(store.groups[0]?.categoryId, store.categories[0]?.id);
  assert.equal(store.cards.length, 2);
  assert.equal(store.cards[0]?.id, "photosynthesis");
  assert.equal(store.cards[0]?.title, "光合作用");
  assert.equal(store.cards[0]?.resources[0]?.id, "ps-image");
  assert.equal(store.cards[0]?.resources[0]?.url, "https://example.com/a.svg");
  assert.equal(store.cards[1]?.id, "newton");
  assert.ok(store.cards[0]?.groupId);
  assert.equal(store.cards[0]?.groupId, store.cards[1]?.groupId);
  assert.equal(store.cards[0]?.groupId, store.groups[0]?.id);
});

test("createCard requires an existing groupId", () => {
  const missing = createCardRecord(
    emptyStore(),
    { title: "牛顿", definition: "惯性", groupId: "missing" },
    ids(),
  );
  assert.deepEqual(missing, { ok: false, error: "not_found" });

  const blank = createCardRecord(
    storeWithGroup(),
    { title: "牛顿", definition: "惯性", groupId: "  " },
    ids(),
  );
  assert.equal(blank.ok, false);

  const created = createCardRecord(
    storeWithGroup(),
    { title: " 牛顿 ", definition: " 惯性 " },
    ids(),
  );
  assert.equal(created.ok, false);

  const ready = createCardRecord(
    storeWithGroup(),
    { title: " 牛顿 ", definition: " 惯性 ", groupId: "grp-1" },
    ids(),
  );
  assert.equal(ready.ok, true);
  if (!ready.ok) return;
  assert.equal(ready.data.card.groupId, "grp-1");
  assert.equal(ready.data.card.title, "牛顿");
  assert.equal(ready.data.store.cards.length, 1);
  assert.equal(storeWithGroup().cards.length, 0);
});

test("card id cannot be all", () => {
  const result = createCardRecord(
    storeWithGroup(),
    { title: "保留", definition: "不能占用全部卡片路由", groupId: "grp-1" },
    () => "all",
  );
  assert.deepEqual(result, { ok: false, error: "reserved_id" });
});

test("copyCard deep-copies card and resource ids into another group", () => {
  const source = storeWithTwoGroups();
  const original = source.cards[0];
  assert.ok(original);

  const copied = copyCardRecord(source, original.id, "general-chem", ids());
  assert.equal(copied.ok, true);
  if (!copied.ok) return;

  assert.notEqual(copied.data.card.id, original.id);
  assert.equal(copied.data.card.groupId, "general-chem");
  assert.equal(copied.data.card.title, original.title);
  assert.equal(copied.data.card.definition, original.definition);
  assert.equal(copied.data.card.resources.length, original.resources.length);
  assert.equal(copied.data.store.cards.length, 2);

  for (const [index, resource] of original.resources.entries()) {
    const clone: Resource | undefined = copied.data.card.resources[index];
    assert.ok(clone);
    assert.notEqual(clone.id, resource.id);
    assert.equal(clone.category, resource.category);
    assert.equal(clone.title, resource.title);
    assert.equal(clone.url, resource.url);
    assert.equal(clone.note, resource.note);
    assert.equal(clone.source, resource.source);
  }

  const resourceIds = copied.data.card.resources.map((resource) => resource.id);
  assert.equal(new Set(resourceIds).size, resourceIds.length);

  copied.data.card.resources[0]!.title = "changed";
  const untouched = copied.data.store.cards.find((card) => card.id === original.id);
  assert.equal(untouched?.resources[0]?.title, original.resources[0]?.title);
  assert.equal(untouched?.groupId, "plant-physiology");
  assert.equal(source.cards[0]?.resources[0]?.title, "光合作用总览图");
});

test("copyCard and moveCard reject the source group", () => {
  const source = storeWithTwoGroups();
  const copied = copyCardRecord(source, "photosynthesis", "plant-physiology", ids());
  const moved = moveCardRecord(source, "photosynthesis", "plant-physiology");
  assert.deepEqual(copied, { ok: false, error: "same_group" });
  assert.deepEqual(moved, { ok: false, error: "same_group" });
  assert.equal(source.cards.length, 1);
  assert.equal(source.cards[0]?.groupId, "plant-physiology");
});

test("moveCard only changes groupId", () => {
  const source = storeWithTwoGroups();
  const before = source.cards[0];
  assert.ok(before);

  const moved = moveCardRecord(source, before.id, "general-chem");
  assert.equal(moved.ok, true);
  if (!moved.ok) return;

  assert.equal(moved.data.store.cards.length, 1);
  assert.equal(moved.data.card.id, before.id);
  assert.equal(moved.data.card.groupId, "general-chem");
  assert.equal(moved.data.card.title, before.title);
  assert.equal(moved.data.card.definition, before.definition);
  assert.deepEqual(moved.data.card.resources, before.resources);
  assert.equal(source.cards[0]?.groupId, "plant-physiology");
});

test("deleteCategory and deleteGroup cascade and report counts", () => {
  const base = storeWithTwoGroups();
  const extra = createCardRecord(
    base,
    { title: "细胞呼吸", definition: "分解糖", groupId: "plant-physiology" },
    ids(),
  );
  assert.equal(extra.ok, true);
  if (!extra.ok) return;

  const secondGroup = createGroupRecord(
    extra.data.store,
    { categoryId: "biology", title: "细胞" },
    () => "cells",
  );
  assert.equal(secondGroup.ok, true);
  if (!secondGroup.ok) return;

  const third = createCardRecord(
    secondGroup.data.store,
    { title: "线粒体", definition: "产能", groupId: "cells" },
    () => "mito",
  );
  assert.equal(third.ok, true);
  if (!third.ok) return;

  const removedGroup = deleteGroupRecord(third.data.store, "cells");
  assert.equal(removedGroup.ok, true);
  if (!removedGroup.ok) return;
  assert.equal(removedGroup.data.deletedCards, 1);
  assert.equal(removedGroup.data.store.groups.some((group) => group.id === "cells"), false);
  assert.equal(removedGroup.data.store.cards.some((card) => card.id === "mito"), false);
  assert.equal(removedGroup.data.store.categories.some((category) => category.id === "biology"), true);

  const restored = third.data.store;
  const removedCategory = deleteCategoryRecord(restored, "biology");
  assert.equal(removedCategory.ok, true);
  if (!removedCategory.ok) return;
  assert.equal(removedCategory.data.deletedGroups, 2);
  assert.equal(removedCategory.data.deletedCards, 3);
  assert.equal(removedCategory.data.store.categories.some((category) => category.id === "biology"), false);
  assert.equal(removedCategory.data.store.groups.some((group) => group.categoryId === "biology"), false);
  assert.equal(removedCategory.data.store.cards.some((card) => card.groupId === "plant-physiology"), false);
  assert.equal(removedCategory.data.store.categories.some((category) => category.id === "chemistry"), true);
  assert.equal(removedCategory.data.store.cards.some((card) => card.groupId === "general-chem"), false);
  assert.equal(listCardsByGroup(removedCategory.data.store, "general-chem").length, 0);

  const empty = deleteCategoryRecord(
    {
      version: 2,
      categories: [{ id: "chemistry", title: "化学", sortOrder: 1 }],
      groups: [],
      cards: [],
    },
    "chemistry",
  );
  assert.equal(empty.ok, true);
  if (!empty.ok) return;
  assert.equal(empty.data.deletedGroups, 0);
  assert.equal(empty.data.deletedCards, 0);
  assert.equal(empty.data.store.categories.length, 0);
});

test("category titles are unique globally and group titles are unique within a category", () => {
  const first = createCategoryRecord(emptyStore(), { title: " 生物学 " }, () => "biology");
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(first.data.category.title, "生物学");

  const duplicate = createCategoryRecord(first.data.store, { title: "生物学" }, () => "bio-2");
  assert.deepEqual(duplicate, { ok: false, error: "duplicate_title" });

  const chemistry = createCategoryRecord(first.data.store, { title: "化学" }, () => "chemistry");
  assert.equal(chemistry.ok, true);
  if (!chemistry.ok) return;

  const renamed = updateCategoryRecord(chemistry.data.store, "chemistry", { title: "生物学" });
  assert.deepEqual(renamed, { ok: false, error: "duplicate_title" });

  const plants = createGroupRecord(
    chemistry.data.store,
    { categoryId: "biology", title: "植物生理" },
    () => "plants",
  );
  assert.equal(plants.ok, true);
  if (!plants.ok) return;

  const again = createGroupRecord(
    plants.data.store,
    { categoryId: "biology", title: "植物生理" },
    () => "plants-2",
  );
  assert.deepEqual(again, { ok: false, error: "duplicate_title" });

  const sameNameElsewhere = createGroupRecord(
    plants.data.store,
    { categoryId: "chemistry", title: "植物生理" },
    () => "chem-plants",
  );
  assert.equal(sameNameElsewhere.ok, true);

  const ordered = listCategories(chemistry.data.store);
  assert.deepEqual(
    ordered.map((category) => category.id),
    ["biology", "chemistry"],
  );
});

test("rejects non-https and empty titles", () => {
  const created = createCardRecord(
    storeWithGroup(),
    { title: "  ", definition: "def", groupId: "grp-1" },
    ids(),
  );
  assert.equal(created.ok, false);

  const card = createCardRecord(
    storeWithGroup(),
    { title: "牛顿", definition: "惯性", groupId: "grp-1" },
    ids(),
  );
  assert.equal(card.ok, true);
  if (!card.ok) return;

  const http = addResourceRecord(
    card.data.store,
    card.data.card.id,
    { category: "blog", title: "笔记", url: "http://example.com/post" },
    ids(),
  );
  assert.deepEqual(http, { ok: false, error: "https_only" });

  const bad = addResourceRecord(
    card.data.store,
    card.data.card.id,
    { category: "blog", title: "笔记", url: "javascript:alert(1)" },
    ids(),
  );
  assert.equal(bad.ok, false);
});

test("creates, edits, and deletes a resource without dropping groupId", () => {
  const created = createCardRecord(
    storeWithGroup(),
    { title: "卡片", definition: "释义", groupId: "grp-1" },
    ids(),
  );
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const added = addResourceRecord(
    created.data.store,
    created.data.card.id,
    {
      category: "document",
      title: "讲义",
      url: "https://example.com/notes",
      note: " 第一讲 ",
      source: "",
    },
    ids(),
  );
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.equal(added.data.card.resources[0]?.url, "https://example.com/notes");
  assert.equal(added.data.card.resources[0]?.note, "第一讲");
  assert.equal(added.data.card.resources[0]?.source, undefined);
  assert.equal(added.data.card.groupId, "grp-1");

  const resourceId = added.data.card.resources[0]?.id ?? "";
  const updated = updateResourceRecord(added.data.store, added.data.card.id, resourceId, {
    category: "audio",
    title: "朗读",
    url: "https://example.com/audio.ogg",
  });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  assert.equal(updated.data.card.resources[0]?.category, "audio");

  const front = updateCardFrontRecord(updated.data.store, updated.data.card.id, {
    title: "新标题",
    definition: "新释义",
  });
  assert.equal(front.ok, true);
  if (!front.ok) return;
  assert.equal(front.data.card.title, "新标题");
  assert.equal(front.data.card.groupId, "grp-1");
  assert.equal(front.data.card.resources.length, 1);

  const removed = deleteResourceRecord(front.data.store, front.data.card.id, resourceId);
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.equal(removed.data.card.resources.length, 0);

  const missing = deleteResourceRecord(removed.data.store, "nope", resourceId);
  assert.deepEqual(missing, { ok: false, error: "not_found" });

  const deleted = deleteCardRecord(removed.data.store, removed.data.card.id);
  assert.equal(deleted.ok, true);
  if (!deleted.ok) return;
  assert.equal(deleted.data.deletedCards, 1);
  assert.equal(deleted.data.store.cards.length, 0);
});

test("rename rejects a blank title and an overlong title", () => {
  const created = createCategoryRecord(emptyStore(), { title: "生物学" }, () => "biology");
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const blank = updateCategoryRecord(created.data.store, "biology", { title: "   " });
  assert.deepEqual(blank, { ok: false, error: "missing_title" });

  const long = updateGroupRecord(
    {
      ...created.data.store,
      groups: [{ id: "plants", categoryId: "biology", title: "植物生理", sortOrder: 0 }],
    },
    "plants",
    { title: "植".repeat(121) },
  );
  assert.deepEqual(long, { ok: false, error: "too_long" });
});
