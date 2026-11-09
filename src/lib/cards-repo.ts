import "server-only";

import { cacheTag } from "next/cache";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseCards } from "./cards-store";
import type { Card, StoreResult } from "./types";

const dataPath = path.join(process.cwd(), "data", "cards.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readCardsFromDisk(): Promise<Card[]> {
  const raw = await readFile(dataPath, "utf8");
  return parseCards(JSON.parse(raw) as unknown);
}

export async function listCardsCached(): Promise<Card[]> {
  "use cache";
  cacheTag("cards");
  return readCardsFromDisk();
}

export async function mutateCards(
  mutator: (cards: Card[]) => StoreResult<{ cards: Card[]; card: Card }>,
): Promise<StoreResult<Card>> {
  return enqueue(async () => {
    const current = await readCardsFromDisk();
    const result = mutator(current);
    if (!result.ok) return result;
    await writeFile(dataPath, `${JSON.stringify(result.data.cards, null, 2)}\n`, "utf8");
    return { ok: true, data: result.data.card };
  });
}
