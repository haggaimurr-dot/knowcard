import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-desk/80 backdrop-blur-md">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-40 focus:rounded-full focus:bg-paper focus:px-3 focus:py-2"
      >
        {t("skip")}
      </a>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/" prefetch={false} className="font-serif text-xl tracking-tight">
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/cards" prefetch={false} className="inline-flex h-11 items-center text-ink/80 hover:text-ink">
            {t("cards")}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
