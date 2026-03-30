import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/_assistant-entry.scss";

/**
 * Pagină deschisă într-o filă nouă când utilizatorul cere Profesorul Whiz din căutare.
 * Asistentul se deschide automat din URL (vezi AssistantAvatar).
 */
const AssistantEntryPage = () => {
  return (
    <div className="assistant-entry-page">
      <Navbar />
      <main className="assistant-entry-main">
        <p className="assistant-entry-hint">
          Profesorul Whiz se deschide în fereastra de dialog. Poți continua conversația
          acolo sau poți închide această filă după ce ai primit răspunsul.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default AssistantEntryPage;
