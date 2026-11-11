type IconProps = {
  className?: string;
};

const shared = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...shared} className={className ?? "size-4"}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...shared} className={className ?? "size-4"}>
      <path d="M13.2 5.2 16.8 8.8" />
      <path d="M4.8 16.6 4 20l3.4-.8L18.2 8.4a1.6 1.6 0 0 0 0-2.3l-.3-.3a1.6 1.6 0 0 0-2.3 0L4.8 16.6Z" />
    </svg>
  );
}

export function RotateIcon({ className }: IconProps) {
  return (
    <svg {...shared} className={className ?? "size-4"}>
      <path d="M4 12a8 8 0 1 0 2.3-5.6" />
      <path d="M4 4.5V9h4.5" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...shared} className={className ?? "size-4"}>
      <path d="M5 7.5h14" />
      <path d="M9.5 7.4V5.2h5v2.2" />
      <path d="M7.2 7.5 8 19h8l.8-11.5" />
    </svg>
  );
}
