
const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-logo">
                    <h3>P.U.L.S</h3>
                    <p>Pendul Unde Lissajous Seism</p>
                </div>
                <div className="footer-links">
                    <div className="footer-column">
                        <h4>Platformă</h4>
                        <ul>
                            <li><a href="#home">Acasă</a></li>
                            <li><a href="#probleme">Probleme</a></li>
                            <li><a href="#simulari">Simulări</a></li>
                            <li><a href="#resurse">Resurse</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Resurse</h4>
                        <ul>
                            <li><a href="#">Documentație</a></li>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Termeni și condiții</a></li>
                            <li><a href="#">Politica de confidențialitate</a></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>Contact</h4>
                        <ul>
                            <li><a href="#">Despre noi</a></li>
                            <li><a href="#">Suport</a></li>
                            <li><a href="#">Email</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} PULS. Toate drepturile rezervate.</p>
            </div>
        </footer>
    );
}

export default Footer;