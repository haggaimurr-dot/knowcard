import "server-only";

import { cacheTag } from "next/cache";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseStore, serializeStore } from "./cards-store";
import type { Card, StoreResult, StoreV2 } from "./types";

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

export async function readStoreFromDisk(): Promise<StoreV2> {
  const raw = await readFile(dataPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  const store = parseStore(parsed);
  if (Array.isArray(parsed)) {
    await writeFile(dataPath, serializeStore(store), "utf8");
  }
  return store;
}

export async function readCardsFromDisk(): Promise<Card[]> {
  const store = await readStoreFromDisk();
  return store.cards;
}

export async function listStoreCached(): Promise<StoreV2> {
  "use cache";
  cacheTag("cards");
  return readStoreFromDisk();
}

export async function listCardsCached(): Promise<Card[]> {
  const store = await listStoreCached();
  return store.cards;
}

export async function mutateStore<T extends { store: StoreV2 }>(
  mutator: (store: StoreV2) => StoreResult<T>,
): Promise<StoreResult<Omit<T, "store">>> {
  return enqueue(async () => {
    const current = await readStoreFromDisk();
    const result = mutator(current);
    if (!result.ok) return result;
    await writeFile(dataPath, serializeStore(result.data.store), "utf8");
    const { store, ...rest } = result.data;
    void store;
    return { ok: true, data: rest };
  });
}
