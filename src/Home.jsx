
const Home = () => {
    return (
        <header id="home">
            <nav>
                <div id="logo-container">
                    <a href=".">P.U.L.S.</a>
                </div>
                <div id="nav-container">
                    <ul id="nav-list">
                        <li>
                            <a data-href="#achievements">Probleme</a>
                            <a data-href="#our-work">Resurse</a>
                            <a data-href="#testimonials">Contact</a>
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
                    <h1>Contemporary</h1>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis
                        ipsa aliquid autem aut? Officiis quod culpa perspiciatis repellendus
                        beatae quo consequuntur. Architecto culpa harum reprehenderit dolor
                        quia suscipit ullam laudantium.
                    </p>
                    <button>
                        <p>Contact us</p>
                    </button>
                </div>
                <div id="hero-img-container" className="hidden hidden-bottom">
                    <div className="image-stack">
                        <div className="image-stack-item--bottom">
                            <img src="./res/architecture_indoors2.jpg" alt="" />
                        </div>
                        <div className="image-stack-item--top">
                            <img src="./res/architecture_indoors3.jpg" alt="" />
                        </div>
                    </div>
                </div>
            </main>
        </header>
    );
}

export default Home;