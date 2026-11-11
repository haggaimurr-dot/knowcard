import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getLibrary } from "@/actions/cards";
import { LibraryHome } from "@/components/library-home";
import { categorySections } from "@/lib/library-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("library");
  return { title: t("title") };
}

export default async function CardsPage() {
  const store = await getLibrary();
  return <LibraryHome sections={categorySections(store)} />;
}
