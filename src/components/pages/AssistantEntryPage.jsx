import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import "@/scss/components/_assistant-entry.scss";
import { useI18n } from "@/i18n/LanguageContext";

/**
 * Pagină deschisă într-o filă nouă când utilizatorul cere Profesorul Whiz din căutare.
 * Asistentul se deschide automat din URL (vezi AssistantAvatar).
 */
const AssistantEntryPage = () => {
  const { t, lang } = useI18n();
  return (
    <div className="assistant-entry-page">
      <SEO
        title={t("assistantEntryPage.seo.title", "Asistent AI | PULS")}
        description={t(
          "assistantEntryPage.seo.description",
          "Ajutor instant la probleme și concepte de fizică, cu tutorul PULS.",
        )}
        keywords={t("assistantEntryPage.seo.keywords", "PULS, asistent AI, ajutor fizică")}
        image="/res/icons/New-logo.png"
        locale={lang === "en" ? "en_US" : "ro_RO"}
      />
      <Navbar />
      <main className="assistant-entry-main">
        <p className="assistant-entry-hint">
          {t(
            "assistant.entryPageHint",
            "Profesorul Whiz se deschide în fereastra de dialog. Poți continua conversația acolo sau poți închide această filă după ce ai primit răspunsul.",
          )}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default AssistantEntryPage;
