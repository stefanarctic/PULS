import { Link } from "react-router-dom";
import { useState } from "react";
import AssistantPopup from "./AssistantPopup";

const Footer = () => {
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const handleSupportClick = (e) => {
        e.preventDefault();
        setIsAssistantOpen(true);
    };

    return (
        <>
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <h3>P.U.L.S</h3>
                        <div className="footer-links">
                            <div className="footer-column">
                                <ul>
                                    <li><Link to="/resurse/pendule">Pendule</Link></li>
                                    <li><Link to="/resurse/unde">Unde</Link></li>
                                    <li><Link to="/resurse/lissajous">Lissajous</Link></li>
                                    <li><Link to="/resurse/seism">Seisme</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Platformă</h4>
                            <ul>
                                <li><Link to="/">Acasă</Link></li>
                                <li><Link to="/probleme">Probleme</Link></li>
                                <li><Link to="/simulari">Simulări</Link></li>
                                <li><Link to="/resurse">Resurse</Link></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Resurse</h4>
                            <ul>
                                <li><Link to="#">Documentație</Link></li>
                                <li><Link to="#">FAQ</Link></li>
                                <li><Link to="#">Termeni și condiții</Link></li>
                                <li><Link to="#">Politica de confidențialitate</Link></li>
                            </ul>
                        </div>
                        <div className="footer-column">
                            <h4>Contact</h4>
                            <ul>
                                <li><Link to="/about-us">Despre noi</Link></li>
                                <li><a href="#" onClick={handleSupportClick}>Suport</a></li>
                                <li>
                                    <Link to="mailto:pulsphysics@gmail.com">Email</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} PULS. Toate drepturile rezervate.</p>
                </div>
            </footer>
            {isAssistantOpen && <AssistantPopup onClose={() => setIsAssistantOpen(false)} />}
        </>
    );
}

export default Footer;