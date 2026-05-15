import useDarkMode from "../hooks/useDarkMode";
import PulsLogoWhite from "/res/puls-logo-new2.png";
import PulsLogoBlack from "/res/puls-logo-new3.png";
import { LocalizedLink as Link, useI18n } from "../i18n/LanguageContext";

const Footer = () => {
    const darkModeOn = useDarkMode();
    const { t } = useI18n();

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
                        {t('footer.tagline', 'Platformă educațională pentru fizică: simulări interactive, probleme, grile și resurse teoretice.')}
                    </p>
                </div>
                <div className="footer-links">
                    <div className="footer-column">
                        <h4>{t('footer.platform', 'Platformă')}</h4>
                        <ul>
                            <li><Link to="/">{t('common.home', 'Acasă')}</Link></li>
                            <li><Link to="/probleme">{t('common.problems', 'Probleme')}</Link></li>
                            <li><Link to="/probleme/bac">{t('common.bacProblems', 'Probleme BAC')}</Link></li>
                            <li><Link to="/probleme/grile">{t('common.quizzes', 'Grile')}</Link></li>
                            <li><Link to="/simulari">{t('common.simulations', 'Simulări')}</Link></li>
                            <li><Link to="/resurse">{t('common.resources', 'Resurse')}</Link></li>
                            <li><Link to="/asistent">{t('common.aiAssistant', 'Asistent AI')}</Link></li>
                            <li><Link to="/profil">{t('common.profile', 'Profil')}</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>{t('footer.quickResources', 'Resurse rapide')}</h4>
                        <ul>
                            <li><Link to="/resurse/pendule">{t('navigation.pulsMenu.pendulums', 'Pendule')}</Link></li>
                            <li><Link to="/resurse/unde">{t('navigation.pulsMenu.waves', 'Unde')}</Link></li>
                            <li><Link to="/resurse/lissajous">{t('navigation.pulsMenu.lissajous', 'Lissajous')}</Link></li>
                            <li><Link to="/resurse/seism">{t('navigation.pulsMenu.earthquakes', 'Seisme')}</Link></li>
                            <li><Link to="/resurse/termodinamica">{t('navigation.bacMenu.thermodynamics', 'Termodinamică')}</Link></li>
                            <li><Link to="/resurse/mecanica">{t('navigation.bacMenu.mechanics', 'Mecanică')}</Link></li>
                            <li><Link to="/resurse/optica">{t('navigation.bacMenu.optics', 'Optică')}</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h4>{t('common.contact', 'Contact')}</h4>
                        <ul>
                            <li><Link to="/about-us">{t('common.aboutUs', 'Despre noi')}</Link></li>
                            <li>
                                <a href="mailto:pulsphysics@gmail.com">pulsphysics@gmail.com</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>
                    © {new Date().getFullYear()} {t('footer.copyright', 'PULS · Toate drepturile rezervate.')}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
