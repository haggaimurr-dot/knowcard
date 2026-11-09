import { getRequestConfig } from "next-intl/server";
import { locale as localeParam } from "next/root-params";
import { notFound } from "next/navigation";
import type { AppLocale } from "./routing";

function asLocale(value: string | undefined): AppLocale {
  if (value === "zh-Hans" || value === "en") return value;
  notFound();
  throw new Error("Unknown locale");
}

async function loadMessages(locale: AppLocale) {
  switch (locale) {
    case "zh-Hans":
      return (await import("../../messages/zh-Hans.json")).default;
    case "en":
      return (await import("../../messages/en.json")).default;
  }
}

export default getRequestConfig(async ({ locale }) => {
  const resolved = asLocale(locale ?? (await localeParam()));

  return {
    locale: resolved,
    messages: await loadMessages(resolved),
  };
});
