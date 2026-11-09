import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <span
        aria-hidden
        className="mb-4 grid size-12 place-items-center rounded-full border border-line text-pine"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 7v10M7 12h10" strokeLinecap="round" />
        </svg>
      </span>
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
