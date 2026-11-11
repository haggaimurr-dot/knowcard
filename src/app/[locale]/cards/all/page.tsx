import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLibrary } from "@/actions/cards";
import { CardTileList } from "@/components/card-tile";
import { CreateCardForm } from "@/components/create-card-form";
import { EmptyState } from "@/components/empty-state";
import { primaryButtonClass } from "@/components/library-styles";
import { Link } from "@/i18n/navigation";
import { cardSummaries, groupOptions } from "@/lib/library-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("library");
  return { title: t("allTitle") };
}

export default async function AllCardsPage() {
  const t = await getTranslations("library");
  const store = await getLibrary();
  const groups = groupOptions(store);
  const cards = cardSummaries(store);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <h1 className="font-serif text-4xl">{t("allTitle")}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t("allLead")}</p>
      {groups.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t("noGroupTitle")}
            body={t("noGroupBody")}
            action={
              <Link href="/cards" prefetch={false} className={primaryButtonClass}>
                {t("noGroupAction")}
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {cards.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title={t("allEmptyTitle")}
                body={t("allEmptyBody")}
                action={
                  <a href="#new-card" className={primaryButtonClass}>
                    {t("createCard")}
                  </a>
                }
              />
            </div>
          ) : (
            <CardTileList cards={cards} groups={groups} showOwner />
          )}
          <div className="mt-8 max-w-xl">
            <CreateCardForm groups={groups} />
          </div>
        </>
      )}
    </div>
  );
}
