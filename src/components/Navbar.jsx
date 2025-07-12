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
    const [searchValue, setSearchValue] = useState("");
    const dropdownRef = useRef(null);
    const dropdownMenuRef = useRef(null);
    const closeTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const darkModeOn = useDarkMode();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                dropdownMenuRef.current &&
                !dropdownMenuRef.current.contains(event.target)
            ) {
                setPulsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Improved hover behavior with delay
    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        setPulsOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setPulsOpen(false);
        }, 150); // Small delay to allow moving to dropdown menu
    };

    const handleDropdownMenuMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
    };

    const handleDropdownMenuMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setPulsOpen(false);
        }, 150);
    };

    const handleDropdownClick = (e) => {
        e.preventDefault();
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

    // Consolidated scroll logic
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = $(document).scrollTop();
            
            // Background and blur effects
            if (scrollTop <= 100) {
                $('nav').css('backdrop-filter', `blur(${0.2 * (scrollTop / 10)}px)`);
                $('nav').css('background', `linear-gradient(to bottom, rgba(0, 0, 0, ${scrollTop / 100 * 0.74}), rgba(0, 0, 0, 0))`);
            } else {
                $('nav').css('backdrop-filter', 'blur(2px)');
                $('nav').css('background', 'linear-gradient(to bottom, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0))');
            }

            // Color changes based on dark mode and scroll position
            if (!darkModeOn) {
                if (scrollTop <= 100) {
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
            } else {
                // Dark mode - always white text
                $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
                $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
                $('nav #navbar-search').css({ borderColor: 'white' });
                $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
                $('#logo-link img').attr('src', PulsLogoWhite);
            }
        };

        // Initial call to set correct colors
        handleScroll();

        // Add scroll event listener
        $(document).on("scroll.navbar-scroll", handleScroll);

        // Cleanup
        return () => {
            $(document).off("scroll.navbar-scroll");
        };
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
                            className="nav-link dropdown-toggle navbar-dropdown-toggle"
                            ref={dropdownRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleDropdownClick}
                        >
                            <span className="navbar-dropdown-span">
                                <span>P.U.L.S.</span>
                                <ChevronDown className="nav-icon navbar-dropdown-icon" />
                            </span>
                            {pulsOpen && (
                                <div
                                    ref={dropdownMenuRef}
                                    className="dropdown-menu navbar-dropdown-menu"
                                    onMouseEnter={handleDropdownMenuMouseEnter}
                                    onMouseLeave={handleDropdownMenuMouseLeave}
                                >
                                    <Link to="/resurse/pendule" className="dropdown-item navbar-dropdown-item">Pendule</Link>
                                    <Link to="/resurse/unde" className="dropdown-item navbar-dropdown-item">Unde</Link>
                                    <Link to="/resurse/lissajous" className="dropdown-item navbar-dropdown-item">Lissajous</Link>
                                    <Link to="/resurse/seism" className="dropdown-item navbar-dropdown-item">Seisme</Link>
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