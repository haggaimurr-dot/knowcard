"use client";

import { useEffect, useRef } from "react";
import type { ActionState } from "@/lib/action-state";

export function useCloseOnSuccess(
  state: ActionState,
  onDone: (state: ActionState) => void,
) {
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    if (state.status === "success") onDoneRef.current(state);
  }, [state]);
}
