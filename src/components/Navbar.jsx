import { Book, FileQuestion, HelpCircle, Home, Layout, ListCheck, ListChecks, Settings, User, Search, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import PulsLogoWhite from '/res/puls-logo-new2.png';
import PulsLogoBlack from '/res/puls-logo-new3.png';
import useDarkMode from "../hooks/useDarkMode";

import $ from 'jquery';
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
    const [pulsOpen, setPulsOpen] = useState(false);
    const [hoveringDropdown, setHoveringDropdown] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const dropdownRef = useRef(null);
    let closeTimeout = useRef();
    const navigate = useNavigate();
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

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchValue.trim()) {
            // Navigate to a search results page with the query as a URL param
            navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
            setSearchValue("");
        }
    };

    // Keep the original scroll logic untouched!
    $(document).on("scroll", () => {
        if ($(document).scrollTop() <= 100)
        {
            $('nav').css('backdrop-filter', `blur(${0.2 * ($(document).scrollTop() / 10)}px)`);
            $('nav').css('background', `linear-gradient(to bottom, rgba(0, 0, 0, ${$(document).scrollTop() / 100 * 0.74}), rgba(0, 0, 0, 0))`);
        }
        else
        {
            $('nav').css('backdrop-filter', 'blur(2px)');
            $('nav').css('background', 'linear-gradient(to bottom, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0))');
        }
    });

    useEffect(() => {
        if (!darkModeOn)
        {            
            if ($(document).scrollTop() <= 100) {
                $('nav > #nav-container > ul > li > .nav-link').css({ color: 'black' });
                $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'black' });
                $('nav #navbar-search').css({ borderColor: 'black' });
                $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'black' });
                $('#logo-link img').attr('src', PulsLogoBlack);
            } else {
                $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
                $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
                $('nav #navbar-search').css({ borderColor: 'white' });
                $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
                $('#logo-link img').attr('src', PulsLogoWhite);
            }

            console.log('Current mode: white mode');
            $(document).off("scroll.white-mode-scroll"); // To be sure
            $(document).on("scroll.white-mode-scroll", () => {
                if ($(document).scrollTop() <= 100) {
                    $('nav > #nav-container > ul > li > .nav-link').css({ color: 'black' });
                    $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'black' });
                    $('nav #navbar-search').css({ borderColor: 'black' });
                    $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'black' });
                    $('#logo-link img').attr('src', PulsLogoBlack);
                } else {
                    $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
                    $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
                    $('nav #navbar-search').css({ borderColor: 'white' });
                    $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
                    $('#logo-link img').attr('src', PulsLogoWhite);
                }
            });
        }
        else
        {
            $(document).off("scroll.white-mode-scroll");
            console.log('Current mode: dark mode');
            $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
            $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
            $('nav #navbar-search').css({ borderColor: 'white' });
            $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
            $('#logo-link img').attr('src', PulsLogoWhite);
        }

        return () => {
            $(document).off("scroll.white-mode-scroll");
        }
    }, [darkModeOn]);

    return (
        <nav>
            {/* Logo */}
            <div id="logo-container">
                <Link to="/" id="logo-link">
                    <img src={darkModeOn ? PulsLogoWhite : PulsLogoBlack} alt="P.U.L.S" />
                </Link>
            </div>
            {/* Search Bar */}
            <form id="navbar-search" onSubmit={handleSearchSubmit}>
                <Search className="search-icon" strokeWidth={3} />
                <input
                    type="text"
                    className="search-input"
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </form>
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
                            style={{
                                position: "relative",
                                display: "inline-block",
                                cursor: "pointer"
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center" }}>
                                <span>P.U.L.S.</span>
                                <ChevronDown className="nav-icon" style={{ marginLeft: 4 }} />
                            </span>
                            {pulsOpen && (
                                <div
                                    className="dropdown-menu"
                                    style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        background: "#222",
                                        borderRadius: "0.5rem",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                        minWidth: "140px",
                                        maxWidth: "200px",
                                        zIndex: 2000,
                                        padding: "0.25rem 0",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        marginTop: 4,
                                        border: "1px solid #444",
                                        overflow: "hidden"
                                    }}
                                >
                                    <Link to="/resurse/pendule" className="dropdown-item" style={{
                                        color: "white",
                                        padding: "0.5rem 1rem",
                                        textDecoration: "none",
                                        fontSize: "1rem",
                                        transition: "background 0.2s",
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left"
                                    }}>Pendule</Link>
                                    <Link to="/resurse/unde" className="dropdown-item" style={{
                                        color: "white",
                                        padding: "0.5rem 1rem",
                                        textDecoration: "none",
                                        fontSize: "1rem",
                                        transition: "background 0.2s",
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left"
                                    }}>Unde</Link>
                                    <Link to="/resurse/lissajous" className="dropdown-item" style={{
                                        color: "white",
                                        padding: "0.5rem 1rem",
                                        textDecoration: "none",
                                        fontSize: "1rem",
                                        transition: "background 0.2s",
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left"
                                    }}>Lissajous</Link>
                                    <Link to="/resurse/seism" className="dropdown-item" style={{
                                        color: "white",
                                        padding: "0.5rem 1rem",
                                        textDecoration: "none",
                                        fontSize: "1rem",
                                        transition: "background 0.2s",
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left"
                                    }}>Seisme</Link>
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