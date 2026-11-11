import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getLibrary } from "@/actions/cards";
import { CardTileList } from "@/components/card-tile";
import { CreateCardForm } from "@/components/create-card-form";
import { EmptyState } from "@/components/empty-state";
import { primaryButtonClass } from "@/components/library-styles";
import { Link } from "@/i18n/navigation";
import { readStoreFromDisk } from "@/lib/cards-repo";
import { cardSummaries, groupOptions } from "@/lib/library-view";
import { getCategory, getGroup } from "@/lib/cards-store";
import { routing } from "@/i18n/routing";

type GroupPageProps = {
  params: Promise<{ locale: string; groupId: string }>;
};

export async function generateStaticParams() {
  const store = await readStoreFromDisk();
  return routing.locales.flatMap((locale) =>
    store.groups.map((group) => ({ locale, groupId: group.id })),
  );
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const { groupId } = await params;
  const store = await getLibrary();
  return { title: getGroup(store, groupId)?.title ?? groupId };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  const t = await getTranslations("library");
  const store = await getLibrary();
  const group = getGroup(store, groupId);
  if (!group) notFound();
  const category = getCategory(store, group.categoryId);
  if (!category) notFound();

  const cards = cardSummaries(store, group.id);
  const groups = groupOptions(store);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <nav aria-label={t("breadcrumb")}>
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li>
            <Link href="/cards" prefetch={false} className="inline-flex h-11 items-center text-pine">
              {t("breadcrumbLibrary")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{category.title}</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {group.title}
          </li>
        </ol>
      </nav>
      <h1 className="mt-4 font-serif text-4xl">{group.title}</h1>
      <p className="mt-3 text-muted">{category.title}</p>
      {cards.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t("groupEmptyTitle")}
            body={t("groupEmptyBody")}
            action={
              <a href="#new-card" className={primaryButtonClass}>
                {t("createCard")}
              </a>
            }
          />
        </div>
      ) : (
        <CardTileList cards={cards} groups={groups} />
      )}
      <div className="mt-8 max-w-xl">
        <CreateCardForm groupId={group.id} />
      </div>
    </div>
  );
}
