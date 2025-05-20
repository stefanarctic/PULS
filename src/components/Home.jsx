import Slideshow from "@/components/Slideshow";

const Home = () => {
    return (
        <header id="home">
            <nav>
                <div id="logo-container">
                    <a href=".">P.U.L.S</a>
                </div>
                <div id="nav-container">
                    <ul id="nav-list">
                        <li>
                            <a data-href="#home">Acasa</a>
                            <a data-href="#achievements">Probleme</a>
                            <a data-href="#our-work">Simulari</a>
                            <a data-href="#testimonials">Resurse</a>
                            <a data-href="#services">Profil</a>
                        </li>
                    </ul>
                    <div id="nav-mobile">
                        <a id="burger-menu" data-href="#">
                            <span />
                        </a>
                    </div>
                </div>
            </nav>
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
                    {/* <div id="hero-img-container" className="hidden hidden-bottom">
                        <div className="image-stack">
                            <div className="image-stack-item--bottom">
                                <img src="./res/architecture_indoors2.jpg" alt="" />
                            </div>
                            <div className="image-stack-item--top">
                                <img src="./res/architecture_indoors3.jpg" alt="" />
                            </div>
                        </div>
                    </div> */}
                </div>
                <div className="hero-slideshow-wrapper">
                    <div className="slideshow-parent hidden hidden-bottom">
                        <Slideshow />
                    </div>
                </div>
            </main>
        </header>
    );
}

export default Home;