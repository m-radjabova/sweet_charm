import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uzb from "./locales/uzb.json";
import rus from "./locales/rus.json";

export const LANGUAGE_STORAGE_KEY = "barber_shop_language";

const resources = {
  uz: {
    translation: uzb,
  },
  ru: {
    translation: rus,
  },
} as const;

const savedLanguage =
  typeof window !== "undefined" ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;

const fallbackLng = savedLanguage === "ru" ? "ru" : "uz";

i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng: "uz",
  interpolation: {
    escapeValue: false,
  },
});

if (typeof window !== "undefined") {
  i18n.on("languageChanged", (lng) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  });
}

export default i18n;
