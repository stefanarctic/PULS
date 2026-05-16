import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/_assistant-entry.scss";
import { useI18n } from "@/i18n/LanguageContext";

/**
 * Pagină deschisă într-o filă nouă când utilizatorul cere Profesorul Whiz din căutare.
 * Asistentul se deschide automat din URL (vezi AssistantAvatar).
 */
const AssistantEntryPage = () => {
  const { t } = useI18n();
  return (
    <div className="assistant-entry-page">
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
