import type { ResourceCategory, StoreError } from "./types";

export type ActionState = {
  status: "idle" | "success" | "error";
  error?: StoreError;
  category?: ResourceCategory;
};

export const idleActionState: ActionState = { status: "idle" };
