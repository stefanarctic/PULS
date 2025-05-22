import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav>
            <div id="logo-container">
                {/* <a href=".">P.U.L.S</a> */}
                <Link to="/" id="logo-link">
                    <img src="/res/puls-logo-new2.png" alt="P.U.L.S" />
                </Link>
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
    );
}

export default Navbar;