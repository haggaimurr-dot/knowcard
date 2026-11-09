import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { listCards } from "@/actions/cards";
import { CreateCardForm } from "@/components/create-card-form";
import { EmptyState } from "@/components/empty-state";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("list");
  return { title: t("title") };
}

export default async function CardsPage() {
  const t = await getTranslations("list");
  const cards = await listCards();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <h1 className="font-serif text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t("lead")}</p>
      {cards.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={t("emptyTitle")} body={t("emptyBody")} />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <li key={card.id}>
              <Link href={`/cards/${card.id}`} prefetch={false} className="paper block h-full rounded-3xl p-6">
                <h2 className="font-serif text-2xl">{card.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{card.definition}</p>
                <p className="mt-5 text-xs tracking-wide text-pine">
                  {t("resources", { count: card.resources.length })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 max-w-xl">
        <CreateCardForm />
      </div>
    </div>
  );
}
