import type { ResourceCategory, StoreError } from "./types";

export type ActionState = {
  status: "idle" | "success" | "error";
  error?: StoreError;
  category?: ResourceCategory;
  cardId?: string;
};

export const idleActionState: ActionState = { status: "idle" };
