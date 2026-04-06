import { Book, FileQuestion, HelpCircle, Home, Layout, ListCheck, ListChecks, Settings, User, Search, ChevronDown, Menu, X, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import PulsLogoWhite from '/res/puls-logo-new2.png';
import PulsLogoBlack from '/res/puls-logo-new3.png';
import useDarkMode from "../hooks/useDarkMode";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import $ from 'jquery';
import { useEffect, useRef, useState } from "react";

const Navbar = () => {
    const [pulsOpen, setPulsOpen] = useState(false);
    const [pulsForceOpen, setPulsForceOpen] = useState(false);
    const [bacOpen, setBacOpen] = useState(false);
    const [bacForceOpen, setBacForceOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
    const [mobileBacDropdownOpen, setMobileBacDropdownOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownMenuRef = useRef(null);
    const submenuRef = useRef(null);
    const bacDropdownRef = useRef(null);
    const bacDropdownMenuRef = useRef(null);
    const closeTimeoutRef = useRef(null);
    const bacCloseTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const darkModeOn = useDarkMode();
    const [burgerColor, setBurgerColor] = useState(darkModeOn ? 'white' : 'black');
    const [user, setUser] = useState(null);
    const [profilePic, setProfilePic] = useState('');
    const [profilePicError, setProfilePicError] = useState(false);
    const [alias, setAlias] = useState('');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                dropdownMenuRef.current &&
                !dropdownMenuRef.current.contains(event.target) &&
                submenuRef.current &&
                !submenuRef.current.contains(event.target)
            ) {
                setPulsOpen(false);
                setPulsForceOpen(false);
                setSubmenuOpen(false);
            }
            if (
                bacDropdownRef.current &&
                !bacDropdownRef.current.contains(event.target) &&
                bacDropdownMenuRef.current &&
                !bacDropdownMenuRef.current.contains(event.target)
            ) {
                setBacOpen(false);
                setBacForceOpen(false);
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

    // Închide dropdown-urile mobile când se închide meniul mobil
    useEffect(() => {
        if (!mobileMenuOpen) {
            setMobileDropdownOpen(false);
            setMobileBacDropdownOpen(false);
        }
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

    // Improved hover behavior with delay
    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        if (!pulsForceOpen) setPulsOpen(true);
    };

    const handleMouseLeave = () => {
        if (!pulsForceOpen) {
            closeTimeoutRef.current = setTimeout(() => {
                setPulsOpen(false);
            }, 150); // Small delay to allow moving to dropdown menu
        }
    };

    const handleDropdownMenuMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
    };

    const handleDropdownMenuMouseLeave = (e) => {
        // Nu închide dacă mouse-ul se mută către submeniu
        if (submenuRef.current && submenuRef.current.contains(e.relatedTarget)) {
            return;
        }
        if (!pulsForceOpen) {
            closeTimeoutRef.current = setTimeout(() => {
                setPulsOpen(false);
                setSubmenuOpen(false);
            }, 200);
        }
    };

    const handleMaiMulteMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        setSubmenuOpen(true);
    };

    const handleMaiMulteMouseLeave = (e) => {
        // Verifică dacă mouse-ul se mută către submeniu sau dacă submeniul este vizibil
        const relatedTarget = e.relatedTarget;
        if (
            (submenuRef.current && submenuRef.current.contains(relatedTarget)) ||
            (relatedTarget && relatedTarget.closest('.submenu'))
        ) {
            return;
        }
        // Delay mai mare pentru a permite mutarea mouse-ului către submeniu
        closeTimeoutRef.current = setTimeout(() => {
            setSubmenuOpen(false);
        }, 200);
    };

    const handleSubmenuMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        setSubmenuOpen(true);
        // Asigură-te că dropdown-ul principal rămâne deschis
        if (!pulsForceOpen) {
            setPulsOpen(true);
        }
    };

    const handleSubmenuMouseLeave = (e) => {
        // Verifică dacă mouse-ul se mută înapoi la "Mai multe"
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && relatedTarget.closest('.mai-multe-item')) {
            return;
        }
        closeTimeoutRef.current = setTimeout(() => {
            setSubmenuOpen(false);
        }, 150);
    };

    const handleDropdownClick = (e) => {
        e.preventDefault();
        setPulsForceOpen((prev) => {
            const newState = !prev;
            setPulsOpen(newState);
            return newState;
        });
    };

    const handleDropdownItemClick = () => {
        setPulsForceOpen(false);
        setPulsOpen(false);
        setSubmenuOpen(false);
    };

    // BAC dropdown – hover
    const handleBacMouseEnter = () => {
        if (bacCloseTimeoutRef.current) clearTimeout(bacCloseTimeoutRef.current);
        if (!bacForceOpen) setBacOpen(true);
    };

    const handleBacMouseLeave = () => {
        if (!bacForceOpen) {
            bacCloseTimeoutRef.current = setTimeout(() => setBacOpen(false), 150);
        }
    };

    const handleBacDropdownMenuMouseEnter = () => {
        if (bacCloseTimeoutRef.current) clearTimeout(bacCloseTimeoutRef.current);
    };

    const handleBacDropdownMenuMouseLeave = () => {
        if (!bacForceOpen) {
            bacCloseTimeoutRef.current = setTimeout(() => {
                setBacOpen(false);
            }, 200);
        }
    };

    const handleBacDropdownClick = (e) => {
        e.preventDefault();
        setBacForceOpen((prev) => {
            const newState = !prev;
            setBacOpen(newState);
            return newState;
        });
    };

    const handleBacDropdownItemClick = () => {
        setBacForceOpen(false);
        setBacOpen(false);
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

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleMobileNavClick = () => {
        setMobileMenuOpen(false);
    };

    // Function to fix Google profile image URLs
    const fixGoogleProfileImageUrl = (url) => {
        if (!url || !url.includes('googleusercontent.com')) {
            return url;
        }
        
        // For Google images, try the original URL first, then clean it up if needed
        // Remove any query parameters that might cause issues
        let cleanUrl = url.split('?')[0];
        
        // Remove existing size parameters
        cleanUrl = cleanUrl.replace(/=s\d+-c$/, '');
        
        // Add a reliable size parameter
        cleanUrl = cleanUrl + '=s96-c';
        
        return cleanUrl;
    };

    // Load user profile data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Get profile picture and alias from Firestore
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const profilePicUrl = userData.profilePic || firebaseUser.photoURL || '';
                    setProfilePic(fixGoogleProfileImageUrl(profilePicUrl));
                    setAlias(userData.alias || '');
                } else {
                    // If user document doesn't exist, use Firebase photoURL
                    const profilePicUrl = firebaseUser.photoURL || '';
                    setProfilePic(fixGoogleProfileImageUrl(profilePicUrl));
                    setAlias('');
                }
                setProfilePicError(false);
            } else {
                setUser(null);
                setProfilePic('');
                setAlias('');
                setProfilePicError(false);
            }
        });
        return () => unsubscribe();
    }, []);

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
                    $('nav').removeClass('scrolled-white');
                    $('nav > #nav-container > ul > li > .nav-link').css({ color: 'black' });
                    $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'black' });
                    $('nav #navbar-search').css({ borderColor: 'black' });
                    $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'black' });
                    $('#logo-link img').attr('src', PulsLogoBlack);
                    setBurgerColor('black');
                } else {
                    $('nav').addClass('scrolled-white');
                    $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
                    $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
                    $('nav #navbar-search').css({ borderColor: 'white' });
                    $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
                    $('#logo-link img').attr('src', PulsLogoWhite);
                    setBurgerColor('white');
                }
            } else {
                // Dark mode - always white text
                $('nav').removeClass('scrolled-white');
                $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
                $('nav #navbar-search .search-icon, nav #navbar-search .search-input').css({ color: 'white' });
                $('nav #navbar-search').css({ borderColor: 'white' });
                $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
                $('#logo-link img').attr('src', PulsLogoWhite);
                setBurgerColor('white');
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
                            className={`nav-link dropdown-toggle navbar-dropdown-toggle${(pulsOpen || pulsForceOpen) ? ' active' : ''}`}
                            ref={dropdownRef}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleDropdownClick}
                        >
                            <span className="navbar-dropdown-span">
                                <span>P.U.L.S.</span>
                                <ChevronDown className="nav-icon navbar-dropdown-icon" />
                            </span>
                            {(pulsOpen || pulsForceOpen) && (
                                <div
                                    ref={dropdownMenuRef}
                                    className="dropdown-menu navbar-dropdown-menu"
                                    onMouseEnter={handleDropdownMenuMouseEnter}
                                    onMouseLeave={handleDropdownMenuMouseLeave}
                                >
                                    <Link to="/resurse/pendule" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Pendule</Link>
                                    <Link to="/resurse/unde" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Unde</Link>
                                    <Link to="/resurse/lissajous" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Lissajous</Link>
                                    <Link to="/resurse/seism" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Seisme</Link>
                                    <div 
                                        className="dropdown-item mai-multe-item"
                                        onMouseEnter={handleMaiMulteMouseEnter}
                                        onMouseLeave={handleMaiMulteMouseLeave}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            Mai multe <ChevronRight className="nav-icon" style={{ marginLeft: 4, width: 16, height: 16 }} />
                                        </span>
                                        {(submenuOpen || pulsForceOpen) && (
                                            <div 
                                                className="submenu"
                                                ref={submenuRef}
                                                onMouseEnter={handleSubmenuMouseEnter}
                                                onMouseLeave={handleSubmenuMouseLeave}
                                            >
                                                <Link to="/resurse/matematica" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Matematică</Link>
                                                <Link to="/resurse/astronomie" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Astronomie</Link>
                                                <Link to="/resurse/atomul" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Atomul</Link>
                                                <Link to="/resurse/fizica-cuantica" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Fizică cuantică</Link>
                                                <Link to="/resurse/fizica-nucleara" className="dropdown-item navbar-dropdown-item" onClick={handleDropdownItemClick}>Fizică nucleară</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div
                            className={`nav-link dropdown-toggle navbar-dropdown-toggle${(bacOpen || bacForceOpen) ? ' active' : ''}`}
                            ref={bacDropdownRef}
                            onMouseEnter={handleBacMouseEnter}
                            onMouseLeave={handleBacMouseLeave}
                            onClick={handleBacDropdownClick}
                        >
                            <span className="navbar-dropdown-span">
                                <span>BAC</span>
                                <ChevronDown className="nav-icon navbar-dropdown-icon" />
                            </span>
                            {(bacOpen || bacForceOpen) && (
                                <div
                                    ref={bacDropdownMenuRef}
                                    className="dropdown-menu navbar-dropdown-menu"
                                    onMouseEnter={handleBacDropdownMenuMouseEnter}
                                    onMouseLeave={handleBacDropdownMenuMouseLeave}
                                >
                                    <Link to="/resurse/mecanica" className="dropdown-item navbar-dropdown-item" onClick={handleBacDropdownItemClick}>Mecanică</Link>
                                    <Link to="/resurse/termodinamica" className="dropdown-item navbar-dropdown-item" onClick={handleBacDropdownItemClick}>Termodinamică</Link>
                                    <Link to="/resurse/electricitate" className="dropdown-item navbar-dropdown-item" onClick={handleBacDropdownItemClick}>Electricitate</Link>
                                    <Link to="/resurse/optica" className="dropdown-item navbar-dropdown-item" onClick={handleBacDropdownItemClick}>Optică</Link>
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
                            {user && profilePic && profilePic.trim() !== '' && !profilePicError ? (
                                <img 
                                    src={profilePic} 
                                    alt="Profile" 
                                    className="nav-profile-picture"
                                    {...(profilePic.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                                    onError={() => {
                                        // Fallback to icon if image fails to load
                                        setProfilePicError(true);
                                    }}
                                />
                            ) : (
                                <User className="nav-icon" />
                            )}
                            <span>{alias || 'Profil'}</span>
                        </Link>
                        <div className="nav-link dark-mode-toggle-link">
                            <DarkModeToggle />
                        </div>
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
                    {mobileMenuOpen ? <X size={24} color={burgerColor} /> : <Menu size={24} color={burgerColor} />}
                </button>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div id="mobile-menu" className={`active${darkModeOn ? ' dark-mode' : ''}`}>
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
                                    <Link to="/resurse/matematica" className="nav-link" onClick={handleMobileNavClick}>
                                        Matematică
                                    </Link>
                                    <Link to="/resurse/astronomie" className="nav-link" onClick={handleMobileNavClick}>
                                        Astronomie
                                    </Link>
                                    <Link to="/resurse/atomul" className="nav-link" onClick={handleMobileNavClick}>
                                        Atomul
                                    </Link>
                                    <Link to="/resurse/fizica-cuantica" className="nav-link" onClick={handleMobileNavClick}>
                                        Fizică cuantică
                                    </Link>
                                    <Link to="/resurse/fizica-nucleara" className="nav-link" onClick={handleMobileNavClick}>
                                        Fizică nucleară
                                    </Link>
                                </div>
                            </div>

                            <div className="mobile-dropdown">
                                <div className="mobile-dropdown-header" onClick={() => setMobileBacDropdownOpen(v => !v)}>
                                    <span>BAC</span>
                                    <ChevronDown className="nav-icon" style={{ transform: mobileBacDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                                </div>
                                <div className={`mobile-dropdown-content${mobileBacDropdownOpen ? ' open' : ''}`}>
                                    <Link to="/resurse/mecanica" className="nav-link" onClick={handleMobileNavClick}>
                                        Mecanică
                                    </Link>
                                    <Link to="/resurse/termodinamica" className="nav-link" onClick={handleMobileNavClick}>
                                        Termodinamică
                                    </Link>
                                    <Link to="/resurse/electricitate" className="nav-link" onClick={handleMobileNavClick}>
                                        Electricitate
                                    </Link>
                                    <Link to="/resurse/optica" className="nav-link" onClick={handleMobileNavClick}>
                                        Optică
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
                                {user && profilePic && profilePic.trim() !== '' && !profilePicError ? (
                                    <img 
                                        src={profilePic} 
                                        alt="Profile" 
                                        className="nav-profile-picture"
                                        {...(profilePic.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                                        onError={() => {
                                            // Fallback to icon if image fails to load
                                            setProfilePicError(true);
                                        }}
                                    />
                                ) : (
                                    <User className="nav-icon" />
                                )}
                                <span>{alias || 'Profil'}</span>
                            </Link>
                            <div className="nav-link dark-mode-toggle-link">
                                <DarkModeToggle />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;