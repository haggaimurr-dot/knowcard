import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  addResourceRecord,
  createCardRecord,
  deleteResourceRecord,
  parseCards,
  updateCardFrontRecord,
  updateResourceRecord,
} from "./cards-store";
import { RESOURCE_CATEGORIES, type Card } from "./types";

function ids() {
  let n = 0;
  return () => `id-${++n}`;
}

const empty: Card[] = [];

test("seed card covers every category with https links", () => {
  const cards = parseCards(JSON.parse(readFileSync("data/cards.json", "utf8")) as unknown);
  assert.ok(cards.length >= 1);
  const categories = new Set(cards.flatMap((card) => card.resources.map((resource) => resource.category)));
  for (const category of RESOURCE_CATEGORIES) {
    assert.equal(categories.has(category), true, category);
  }
  for (const resource of cards.flatMap((card) => card.resources)) {
    assert.equal(new URL(resource.url).protocol, "https:");
  }
});

test("rejects non-https and empty titles", () => {
  const created = createCardRecord(empty, { title: "  ", definition: "def" }, ids());
  assert.equal(created.ok, false);

  const card = createCardRecord(empty, { title: "牛顿", definition: "惯性" }, ids());
  assert.equal(card.ok, true);
  if (!card.ok) return;

  const http = addResourceRecord(
    card.data.cards,
    card.data.card.id,
    { category: "blog", title: "笔记", url: "http://example.com/post" },
    ids(),
  );
  assert.deepEqual(http, { ok: false, error: "https_only" });

  const bad = addResourceRecord(
    card.data.cards,
    card.data.card.id,
    { category: "blog", title: "笔记", url: "javascript:alert(1)" },
    ids(),
  );
  assert.equal(bad.ok, false);
});

test("creates, edits, and deletes a resource", () => {
  const created = createCardRecord(empty, { title: "卡片", definition: "释义" }, ids());
  assert.equal(created.ok, true);
  if (!created.ok) return;

  const added = addResourceRecord(
    created.data.cards,
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

  const resourceId = added.data.card.resources[0]?.id ?? "";
  const updated = updateResourceRecord(added.data.cards, added.data.card.id, resourceId, {
    category: "audio",
    title: "朗读",
    url: "https://example.com/audio.ogg",
  });
  assert.equal(updated.ok, true);
  if (!updated.ok) return;
  assert.equal(updated.data.card.resources[0]?.category, "audio");

  const front = updateCardFrontRecord(updated.data.cards, updated.data.card.id, {
    title: "新标题",
    definition: "新释义",
  });
  assert.equal(front.ok, true);
  if (!front.ok) return;
  assert.equal(front.data.card.title, "新标题");
  assert.equal(front.data.card.resources.length, 1);

  const removed = deleteResourceRecord(front.data.cards, front.data.card.id, resourceId);
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.equal(removed.data.card.resources.length, 0);

  const missing = deleteResourceRecord(removed.data.cards, "nope", resourceId);
  assert.deepEqual(missing, { ok: false, error: "not_found" });
});
