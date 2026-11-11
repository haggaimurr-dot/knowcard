import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getLibrary } from "@/actions/cards";
import { readCardsFromDisk } from "@/lib/cards-repo";
import { CardStudio } from "@/components/card-studio";
import { StudioFallback } from "@/components/studio-fallback";
import { cardOwner, groupOptions } from "@/lib/library-view";
import { routing } from "@/i18n/routing";

type CardPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateStaticParams() {
  const cards = await readCardsFromDisk();
  return routing.locales.flatMap((locale) => cards.map((card) => ({ locale, id: card.id })));
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const { id } = await params;
  const store = await getLibrary();
  const card = store.cards.find((item) => item.id === id);
  return { title: card?.title ?? id };
}

async function CardPageContent({ params }: CardPageProps) {
  const { id } = await params;
  const store = await getLibrary();
  const owner = cardOwner(store, id);
  if (!owner) notFound();

  return (
    <CardStudio
      card={owner.card}
      owner={{
        groupId: owner.group.id,
        categoryTitle: owner.category.title,
        groupTitle: owner.group.title,
      }}
      groups={groupOptions(store)}
    />
  );
}

export default function CardPage({ params }: CardPageProps) {
  return (
    <Suspense fallback={<StudioFallback />}>
      <CardPageContent params={params} />
    </Suspense>
  );
}
