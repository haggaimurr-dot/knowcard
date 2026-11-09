import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCard } from "@/actions/cards";
import { readCardsFromDisk } from "@/lib/cards-repo";
import { CardStudio } from "@/components/card-studio";
import { StudioFallback } from "@/components/studio-fallback";
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
  const card = await getCard(id);
  return { title: card?.title ?? id };
}

async function CardPageContent({ params }: CardPageProps) {
  const { id } = await params;
  const card = await getCard(id);
  if (!card) notFound();
  return <CardStudio card={card} />;
}

export default function CardPage({ params }: CardPageProps) {
  return (
    <Suspense fallback={<StudioFallback />}>
      <CardPageContent params={params} />
    </Suspense>
  );
}
