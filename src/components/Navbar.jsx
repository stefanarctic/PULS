import { Book, FileQuestion, HelpCircle, Home, Layout, ListCheck, ListChecks, Settings, User, Search, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";
import PulsLogoWhite from '/res/puls-logo-new2.png';
import PulsLogoBlack from '/res/puls-logo-new3.png';
import useDarkMode from "../hooks/useDarkMode";

const Navbar = () => {
    const [pulsOpen, setPulsOpen] = useState(false);
    const [hoveringDropdown, setHoveringDropdown] = useState(false);
    const dropdownRef = useRef(null);
    let closeTimeout = useRef();
    const darkModeOn = useDarkMode();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setPulsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Delay closing when mouse leaves
    const handleMouseEnter = () => {
        clearTimeout(closeTimeout.current);
        setHoveringDropdown(true);
        setPulsOpen(true);
    };

    const handleMouseLeave = () => {
        setHoveringDropdown(false);
        setPulsOpen(false); // Close instantly on mouse leave
    };

    const handleDropdownClick = () => {
        setPulsOpen((prev) => !prev);
    };

    return (
        <nav>
            {/* Logo */}
            <div id="logo-container">
                <Link to="/" id="logo-link">
                    <img src={darkModeOn ? PulsLogoWhite : PulsLogoBlack} alt="P.U.L.S" />
                </Link>
            </div>
            {/* Search Bar */}
            <div id="navbar-search">
                <Search className="search-icon" strokeWidth={3} />
                <input
                    type="text"
                    // placeholder="Cauta..."
                    className="search-input"
                />
            </div>
            {/* Links */}
            <div id="nav-container">
                <ul id="nav-list">
                    <li>
                        <Link to="/" className="nav-link">
                            <Home className="nav-icon" />
                            <span>Acasa</span>
                        </Link>
                        <div
                            className="nav-link dropdown-toggle"
                            ref={dropdownRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleDropdownClick}
                            style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
                        >
                            <span style={{ display: "flex", alignItems: "center" }}>
                                <span>P.U.L.S.</span>
                                <ChevronDown className="nav-icon" style={{ marginLeft: 4 }} />
                            </span>
                            {pulsOpen && (
                                <div className="dropdown-menu">
                                    <Link to="/Simulari/pendule" className="dropdown-item">Pendule</Link>
                                    <Link to="/Simulari/unde" className="dropdown-item">Unde</Link>
                                    <Link to="/Simulari/lissajous" className="dropdown-item">Lissajous</Link>
                                    <Link to="/Simulari/seism" className="dropdown-item">Seisme</Link>
                                </div>
                            )}
                        </div>
                        <Link to="/probleme" className="nav-link">
                            <ListCheck className="nav-icon" />
                            <span>Probleme</span>
                        </Link>
                        <Link to="/simulari" className="nav-link">
                            <Settings className="nav-icon" />
                            <span>Simulari</span>
                        </Link>
                        <Link to="/resurse" className="nav-link">
                            <Book className="nav-icon" />
                            <span>Resurse</span>
                        </Link>
                        <Link to="/profil" className="nav-link">
                            <User className="nav-icon" />
                            <span>Profil</span>
                        </Link>
                    </li>
                </ul>
                <div id="nav-mobile">
                    <a id="burger-menu" data-href="#">
                        <span />
                    </a>
                </div>
            </div>
            {/* Dark Mode Toggle */}
            <div id="dark-mode-toggle-container">
                <DarkModeToggle />
            </div>
        </nav>
    );
}

export default Navbar;