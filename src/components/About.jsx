import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/_about.scss";
import Layout from "./Layout";

const About = () => {
    return (
        <Layout>
            <div className="about-page">
                <main className="about-main">
                    <div className="about-text">
                        <h1 className="about-title">Despre noi</h1>
                        <p className="about-description">
                            Suntem dedicați educației moderne și inovării în predarea fizicii. Platforma noastră oferă simulări interactive și exerciții pentru a transforma învățarea într-o experiență captivantă și practică.
                        </p>
                        <p className="about-story">
                            Povestea noastră a început cu o simplă întrebare: cum putem face ca fenomenele oscilatorii să prindă viață și să devină mai ușor de înțeles pentru toți cei care le studiază? Noi, o echipă de elevi pasionați de știință, am simțit mereu că, dincolo de formule și definiții, există o lume fascinantă, plină de ritm, mișcare și conexiuni surprinzătoare cu natura și tehnologia. Așa s-a născut proiectul nostru, P.U.L.S - un site interactiv dedicat pendulelor, undelor, figurilor Lissajous și seismelor, menit să transforme studiul acestor fenomene într-o experiență captivantă. Ne-am propus să construim un spațiu digital unde elevii să poată vedea cu ochii lor cum se mișcă un pendul, cum vibrează o coardă sau cum undele seismice se propagă prin scoarța terestră.
                        </p>
                        <p className="about-story">
                            Am combinat pasiunea pentru fizică cu puterea tehnologiei, folosind Unity pentru a crea simulatii interactive și VSCODE pentru a dezvolta platforma noastră. Am inclus atât experimente virtuale, cât și secvențe filmate în laborator, pentru ca toți cei curioși să poată explora fenomenele oscilatorii într-un mod vizual și intuitiv. De la mișcarea armonică a unui pendul până la dansul hipnotizant al figurilor Lissajous, site-ul nostru este un loc unde știința prinde formă și devine accesibilă.
                        </p>
                        <p className="about-story">
                            Nu a fost un drum ușor. Am petrecut ore întregi studiind, programând și testând fiecare simulare, cu sprijinul necondiționat al mentorului nostru, doamna profesoară Bebu Ioana Bianka, și al colaboratorului nostru, fizicianul Bebu Ion. Am învățat că, dincolo de cifre și ecuații, fizica este o poveste despre ordine și haos, despre cum universul dansează pe ritmuri nevăzute, dar perfect regulate.
                        </p>
                        <p className="about-story">
                            P.U.L.S nu este doar un site - este o fereastră către un univers fascinant. Este dovada că știința poate fi frumoasă, că poate inspira și că, prin curiozitate și muncă, putem face ca lucrurile complicate să devină accesibile și uimitoare.
                        </p>
                        <p className="about-story">
                            Așa că, dacă vrei să vezi cum se mișcă lumea într-un ritm nevăzut, te invităm să explorezi site-ul nostru. Descoperă, experimentează și lasă-te purtat de pulsul fascinant al științei!
                        </p>
                        <h6 className="about-motto">
                            Descoperă, experimentează și lasă-te purtat de PULS-ul fascinant al științei!
                        </h6>
                    </div>
                </main>
            </div>
        </Layout>
    );
};

export default About;