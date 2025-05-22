import Slideshow from "@/components/Slideshow";
import Navbar from "./Navbar";

const Home = () => {
    return (
        <>
            <Navbar />
            <header id="home">
                <main>
                    <div id="hero-container" className="hidden hidden-left">
                        <h1>Descoperă fizica prin exerciții și simulări interactive</h1>
                        <p>
                            PULS - Platforma educațională pentru studiul conceptelor de Pendul, Unde, Lissajous și Seism prin probleme și simulări interactive.
                        </p>
                        <div className="buttons">
                            <button className="filled">Exploreaza problemele</button>
                            <button>Incearca simularile</button>
                        </div>
                    </div>
                    <div className="hero-slideshow-wrapper">
                        <div className="slideshow-parent hidden hidden-bottom">
                            <Slideshow />
                        </div>
                    </div>
                </main>
            </header>
        </>

    );
}

export default Home;