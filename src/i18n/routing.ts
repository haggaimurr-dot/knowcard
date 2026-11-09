import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh-Hans", "en"],
  defaultLocale: "zh-Hans",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
