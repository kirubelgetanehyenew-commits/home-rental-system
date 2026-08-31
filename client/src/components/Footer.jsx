import { useLang } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-stone-200 bg-white text-center p-6 mt-auto text-stone-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <p className="text-sm">{t("footer.text")}</p>
    </footer>
  );
}
