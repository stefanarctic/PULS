import { Book, FileQuestion, HelpCircle, Home, Layout, ListCheck, ListChecks, Settings, User, Search, ChevronDown, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import PulsLogoWhite from '/res/puls-logo-new2.png';
import PulsLogoBlack from '/res/puls-logo-new3.png';
import useDarkMode from "../hooks/useDarkMode";

import $ from 'jquery';
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
    const [pulsOpen, setPulsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false); // NEW
    const [searchValue, setSearchValue] = useState("");
    const dropdownRef = useRef(null);
    const closeTimeoutRef = useRef(null);
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

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('#nav-mobile') && !event.target.closest('#burger-menu')) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Închide dropdown-ul mobil când se închide meniul mobil
    useEffect(() => {
        if (!mobileMenuOpen) setMobileDropdownOpen(false);
    }, [mobileMenuOpen]);

    // Blochează scrollbarul body-ului când meniul mobil e deschis
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Improved hover handlers with delay
    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setPulsOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setPulsOpen(false);
        }, 150); // 150ms delay before closing
    };

    const handleDropdownClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPulsOpen((prev) => !prev);
    };

    const handleDropdownItemClick = () => {
        setPulsOpen(false);
        setMobileMenuOpen(false);
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleMobileNavClick = () => {
        setMobileMenuOpen(false);
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
                $('#burger-menu svg').css({ color: 'black' });
            } else {
                $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
                $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
                $('nav #navbar-search').css({ borderColor: 'white' });
                $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
                $('#logo-link img').attr('src', PulsLogoWhite);
                $('#burger-menu svg').css({ color: 'white' });
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
                    $('#burger-menu svg').css({ color: 'black' });
                } else {
                    $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
                    $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
                    $('nav #navbar-search').css({ borderColor: 'white' });
                    $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
                    $('#logo-link img').attr('src', PulsLogoWhite);
                    $('#burger-menu svg').css({ color: 'white' });
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
            $('#burger-menu svg').css({ color: 'white' });
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
                    // placeholder="Caută..."
                />
            </form>
            
            {/* Desktop Navigation */}
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
                        >
                            <span className="dropdown-toggle-content">
                                <span>P.U.L.S.</span>
                                <ChevronDown className="nav-icon" />
                            </span>
                            {pulsOpen && (
                                <div 
                                    className="dropdown-menu"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Link to="/resurse/pendule" className="dropdown-item" onClick={handleDropdownItemClick}>
                                        Pendule
                                    </Link>
                                    <Link to="/resurse/unde" className="dropdown-item" onClick={handleDropdownItemClick}>
                                        Unde
                                    </Link>
                                    <Link to="/resurse/lissajous" className="dropdown-item" onClick={handleDropdownItemClick}>
                                        Lissajous
                                    </Link>
                                    <Link to="/resurse/seism" className="dropdown-item" onClick={handleDropdownItemClick}>
                                        Seisme
                                    </Link>
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
            </div>

            {/* Mobile Menu Button */}
            <div id="nav-mobile">
                <button 
                    id="burger-menu" 
                    onClick={handleMobileMenuToggle}
                    className={mobileMenuOpen ? 'active' : ''}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                
                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div id="mobile-menu" className="active">
                        {/* Buton de close */}
                        <button
                            className="mobile-menu-close"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Închide meniul"
                            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', zIndex: 1100 }}
                        >
                            <X size={32} color={darkModeOn ? '#fff' : '#222'} />
                        </button>
                        <div className="nav-list">
                            <Link to="/" className="nav-link" onClick={handleMobileNavClick}>
                                <Home className="nav-icon" />
                                <span>Acasa</span>
                            </Link>
                            
                            <div className="mobile-dropdown">
                                <div className="mobile-dropdown-header" onClick={() => setMobileDropdownOpen(v => !v)}>
                                    <span>P.U.L.S.</span>
                                    <ChevronDown className="nav-icon" style={{ transform: mobileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                </div>
                                <div className={`mobile-dropdown-content${mobileDropdownOpen ? ' open' : ''}`}>
                                    <Link to="/resurse/pendule" className="nav-link" onClick={handleMobileNavClick}>
                                        Pendule
                                    </Link>
                                    <Link to="/resurse/unde" className="nav-link" onClick={handleMobileNavClick}>
                                        Unde
                                    </Link>
                                    <Link to="/resurse/lissajous" className="nav-link" onClick={handleMobileNavClick}>
                                        Lissajous
                                    </Link>
                                    <Link to="/resurse/seism" className="nav-link" onClick={handleMobileNavClick}>
                                        Seisme
                                    </Link>
                                </div>
                            </div>
                            
                            <Link to="/probleme" className="nav-link" onClick={handleMobileNavClick}>
                                <ListCheck className="nav-icon" />
                                <span>Probleme</span>
                            </Link>
                            <Link to="/simulari" className="nav-link" onClick={handleMobileNavClick}>
                                <Settings className="nav-icon" />
                                <span>Simulari</span>
                            </Link>
                            <Link to="/resurse" className="nav-link" onClick={handleMobileNavClick}>
                                <Book className="nav-icon" />
                                <span>Resurse</span>
                            </Link>
                            <Link to="/profil" className="nav-link" onClick={handleMobileNavClick}>
                                <User className="nav-icon" />
                                <span>Profil</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Dark Mode Toggle */}
            <div id="dark-mode-toggle-container">
                <DarkModeToggle />
            </div>
        </nav>
    );
}

export default Navbar;