import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageSlider from "@/components/ImageSlider";
import { Button } from "@/components/button";
import "@/scss/components/_simulari-pages.scss";

const UndePage = () => {
  const waveImages = [
    { src: "https://images.unsplash.com/photo-1527576539890-dfa815648363", alt: "Wave simulation" },
    { src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625", alt: "Oscillation simulation" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div style={{ paddingTop: "110px", flex: 1, display: "flex", flexDirection: "column" }}>
        <main className="flex-grow container mx-auto px-4 py-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Unde</h1>
          <div className="max-w-3xl mb-10">
            <p className="text-lg text-muted-foreground mb-4">
              Undele sunt fenomene de propagare a energiei și informației prin intermediul unui mediu sau al vidului.
              Studiul undelor ne ajută să înțelegem sunetul, lumina, cutremurele și multe alte fenomene naturale.
            </p>
            <p className="text-lg text-muted-foreground">
              Explorează simulările noastre pentru a vizualiza comportamentul diferitelor tipuri de unde.
            </p>
          </div>
          <div className="space-y-12">
            {/* Unde mecanice */}
            <div className="rounded-container">
              <h2 className="text-2xl font-bold mb-4">Unde mecanice</h2>
              <p className="text-muted-foreground mb-6">
                Undele mecanice sunt unde care au nevoie de un mediu material pentru a se propaga, precum undele sonore sau undele pe suprafața apei.
              </p>
              <ImageSlider images={waveImages} />
              <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ecuația undei:</h3>
                  <div className="text-lg font-mono">y(x, t) = A · sin(kx - ωt + φ)</div>
                  <p className="text-muted-foreground mt-2">
                    unde A este amplitudinea, k este numărul de undă, ω este pulsatia, t este timpul, x este poziția, iar φ este faza inițială.
                  </p>
                </div>
                <Button size="lg">Începe simularea</Button>
              </div>
            </div>
            {/* Unde staționare */}
            <div className="rounded-container">
              <h2 className="text-2xl font-bold mb-4">Unde staționare</h2>
              <p className="text-muted-foreground mb-6">
                Undele staționare apar prin suprapunerea a două unde identice care se propagă în sensuri opuse, rezultând zone fixe de amplitudine maximă și minimă.
              </p>
              <ImageSlider images={waveImages.slice().reverse()} />
              <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Caracteristici:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Noduri și burți</li>
                    <li>Frecvențe de rezonanță</li>
                    <li>Nu transportă energie pe distanțe mari</li>
                  </ul>
                </div>
                <Button size="lg">Începe simularea</Button>
              </div>
            </div>
            {/* Unde electromagnetice */}
            <div className="rounded-container">
              <h2 className="text-2xl font-bold mb-4">Unde electromagnetice</h2>
              <p className="text-muted-foreground mb-6">
                Undele electromagnetice, precum lumina, nu au nevoie de un mediu material pentru a se propaga și pot călători prin vid.
              </p>
              <ImageSlider images={waveImages} />
              <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ecuația vitezei:</h3>
                  <div className="text-lg font-mono">c = λ · f</div>
                  <p className="text-muted-foreground mt-2">
                    unde c este viteza luminii, λ este lungimea de undă, iar f este frecvența.
                  </p>
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

export default UndePage;
