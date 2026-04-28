import { useTranslation } from "react-i18next";

const languages = [
  { code: "uz", label: "O'Z", flag: "🇺🇿" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
] as const;

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const activeIndex = languages.findIndex((l) =>
    i18n.language.startsWith(l.code)
  );

  return (
    <div
      className={`relative inline-flex rounded-full border border-slate-200/70 bg-white/95 p-1 shadow-[0_4px_14px_rgba(15,23,42,0.10)] backdrop-blur-md ${className}`}
    >
      <span
        className={`
          absolute top-1 bottom-1 left-1
          w-[calc(50%-4px)]
          rounded-full bg-slate-900 shadow-md
          transition-all duration-300
        `}
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {languages.map((lang) => {
        const isActive = i18n.language.startsWith(lang.code);

        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`
              relative z-10 flex items-center gap-2
              px-4 py-1.5 rounded-full text-sm font-semibold
              transition-colors duration-300
              ${
                isActive
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900"
              }
            `}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
