import { Link } from "react-router-dom";
import useDarkMode from "../hooks/useDarkMode";
import PulsLogoWhite from "/res/puls-logo-new2.png";
import PulsLogoBlack from "/res/puls-logo-new3.png";

const Footer = () => {
    const darkModeOn = useDarkMode();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <Link to="/" className="footer-brand-link">
                        <img
                            src={darkModeOn ? PulsLogoWhite : PulsLogoBlack}
                            alt="PULS"
                            className="footer-brand-img"
                            width={150}
                            height={48}
                            decoding="async"
                        />
                    </Link>
                    <p className="footer-tagline">
                        Platformă educațională pentru fizică: simulări interactive, probleme, grile și resurse teoretice.
                    </p>
                </div>
                <div className="footer-links">
                    <div className="footer-column">
                        <h4>Platformă</h4>
                        <ul>
                            <li><Link to="/">Acasă</Link></li>
                            <li><Link to="/probleme">Probleme</Link></li>
                            <li><Link to="/probleme/bac">Probleme BAC</Link></li>
                            <li><Link to="/probleme/grile">Grile</Link></li>
                            <li><Link to="/simulari">Simulări</Link></li>
                            <li><Link to="/resurse">Resurse</Link></li>
                            <li><Link to="/asistent">Asistent AI</Link></li>
                            <li><Link to="/profil">Profil</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Resurse rapide</h4>
                        <ul>
                            <li><Link to="/resurse/pendule">Pendule</Link></li>
                            <li><Link to="/resurse/unde">Unde</Link></li>
                            <li><Link to="/resurse/lissajous">Lissajous</Link></li>
                            <li><Link to="/resurse/seism">Seisme</Link></li>
                            <li><Link to="/resurse/termodinamica">Termodinamică</Link></li>
                            <li><Link to="/resurse/mecanica">Mecanică</Link></li>
                            <li><Link to="/resurse/optica">Optică</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Contact</h4>
                        <ul>
                            <li><Link to="/about-us">Despre noi</Link></li>
                            <li>
                                <a href="mailto:pulsphysics@gmail.com">pulsphysics@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>
                    © {new Date().getFullYear()} PULS · Toate drepturile rezervate.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
