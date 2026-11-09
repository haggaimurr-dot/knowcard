import type { ResourceCategory } from "@/lib/types";

type IconProps = {
  category: ResourceCategory;
  className?: string;
};

export function CategoryIcon({ category, className }: IconProps) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (category) {
    case "image":
      return (
        <svg {...props}>
          <rect x="3.5" y="5" width="17" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.4" />
          <path d="M4 16.5 9 12l3.2 3 2.2-2 5.1 4" />
        </svg>
      );
    case "video":
      return (
        <svg {...props}>
          <rect x="3.5" y="6" width="17" height="12" rx="2" />
          <path d="M10 9.5v5l4.5-2.5-4.5-2.5Z" />
        </svg>
      );
    case "blog":
      return (
        <svg {...props}>
          <path d="M6 5.5h9.5A3.5 3.5 0 0 1 19 9v9.5H8.5A3.5 3.5 0 0 1 5 15V5.5H6Z" />
          <path d="M8.5 9.5h7M8.5 13h5" />
        </svg>
      );
    case "document":
      return (
        <svg {...props}>
          <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M14 3.8V8h4.2M8.5 12.5h7M8.5 16h5" />
        </svg>
      );
    case "audio":
      return (
        <svg {...props}>
          <path d="M9 16.5a2.2 2.2 0 1 1-2.1-2.2L8 8l8-2v7.2" />
          <path d="M16 14.8a2.2 2.2 0 1 1-2.1-2.2" />
        </svg>
      );
    case "attachment":
      return (
        <svg {...props}>
          <path d="M8.5 12.5 14 7a3 3 0 0 1 4.2 4.2l-7.2 7.2a4.2 4.2 0 0 1-6-6L12 5.5" />
        </svg>
      );
  }
}
