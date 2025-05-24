import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageSlider from "@/components/ImageSlider";
import { Button } from "@/components/button";
import "@/scss/components/_simulari-pages.scss";


const seismImages = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Seismic_wave_animation.gif", alt: "Animație undă seismică" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Seismogram.png", alt: "Seismogramă" },
];

const SeismePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
        <main className="flex-grow container mx-auto px-4 py-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Seisme</h1>
          <div className="max-w-3xl mb-10">
            <p className="text-lg text-muted-foreground mb-4">
              Seismele (cutremurele) sunt mișcări ale scoarței terestre cauzate de eliberarea bruscă de energie în interiorul Pământului, generând unde seismice.
            </p>
            <p className="text-lg text-muted-foreground">
              Studiul seismelor ne ajută să înțelegem structura internă a Pământului și să dezvoltăm metode de protecție împotriva efectelor acestora.
            </p>
          </div>
          <div className="space-y-12">
            <div className="rounded-container">
              <h2 className="text-2xl font-bold mb-4">Unde seismice</h2>
              <p className="text-muted-foreground mb-6">
                Undele seismice sunt de mai multe tipuri: unde P (primare), unde S (secundare) și unde de suprafață, fiecare având caracteristici diferite de propagare.
              </p>

              <ImageSlider images={seismImages} />

              <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tipuri de unde seismice:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><b>Unde P</b> (primare): cele mai rapide, se propagă prin solide și lichide.</li>
                    <li><b>Unde S</b> (secundare): mai lente, se propagă doar prin solide.</li>
                    <li><b>Unde de suprafață</b>: responsabile pentru cele mai mari distrugeri la suprafață.</li>
                  </ul>
                </div>
                <Button size="lg">Începe simularea</Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default SeismePage;