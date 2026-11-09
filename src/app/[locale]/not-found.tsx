import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-20">
      <h1 className="font-serif text-4xl">{t("title")}</h1>
      <p className="mt-4 text-muted">{t("body")}</p>
      <Link href="/cards" prefetch={false} className="mt-6 inline-flex text-sm text-pine">
        {t("back")}
      </Link>
    </div>
  );
}
