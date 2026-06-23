import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: {
        common: {
          signingOut: "Signing out...",
        },
        roles: {
          admin: "Admin",
        },
        sidebar: {
          adminUser: "Admin user",
          applications: "Applications",
          applicationsDesc: "Requests",
          barbers: "Users",
          barbersDesc: "Manage users",
          closeMenu: "Close menu",
          dashboard: "Dashboard",
          dashboardDesc: "Overview",
          mainMenu: "Main menu",
          openMenu: "Open menu",
          settings: "Settings",
          settingsDesc: "Account",
          signOut: "Sign out",
        },
      },
    },
  },
});

export default i18n;
