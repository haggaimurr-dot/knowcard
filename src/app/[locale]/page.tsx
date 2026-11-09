import { getTranslations } from "next-intl/server";
import { listCards } from "@/actions/cards";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("home");
  const cards = await listCards();
  const sample = cards[0];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16">
      <p className="text-sm tracking-[0.18em] text-pine">{t("kicker")}</p>
      <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[1.15]">{t("title")}</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-muted">{t("lead")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {sample ? (
          <Link
            href={`/cards/${sample.id}`}
            prefetch={false}
            className="inline-flex h-11 items-center rounded-full bg-pine px-5 text-sm text-white"
          >
            {t("openSample", { title: sample.title })}
          </Link>
        ) : null}
        <Link
          href="/cards"
          prefetch={false}
          className="inline-flex h-11 items-center rounded-full border border-ink/15 bg-paper px-5 text-sm"
        >
          {t("browse")}
        </Link>
      </div>
    </div>
  );
}
