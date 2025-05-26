import { Book, FileQuestion, HelpCircle, Home, Layout, ListCheck, ListChecks, Settings, User, Search } from "lucide-react";
import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import PulsLogoWhite from '/res/puls-logo-new2.png';
import PulsLogoBlack from '/res/puls-logo-new3.png';
import useDarkMode from "../hooks/useDarkMode";

import $ from 'jquery';
import { useEffect } from "react";

const Navbar = () => {

    // // Change header background on scroll
    // $(document).on("scroll", () => {
    //     if ($(document).scrollTop() <= 100) {
    //         $('nav').css('backdrop-filter', `blur(${0.2 * ($(document).scrollTop() / 10)}px)`);
    //         $('nav').css('background', `linear-gradient(to bottom, rgba(${darkModeOn ? '0, 0, 0,' : '255, 255, 255'} ${$(document).scrollTop() / 100 * 0.74}), rgba(${darkModeOn ? '0, 0, 0,' : '255, 255, 255'} 0))`);
    //     }
    //     else {
    //         $('nav').css('backdrop-filter', 'blur(2px)');
    //         $('nav').css('background', `linear-gradient(to bottom, rgba(${darkModeOn ? '0, 0, 0,' : '255, 255, 255'} 0.74), rgba(${darkModeOn ? '0, 0, 0,' : '255, 255, 255'} 0))`);
    //         // $('nav').css('color', 'white !important');
    //     }
    // });

    // Change header on scroll
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

    const darkModeOn = useDarkMode();
    
    // {
    //     if ($(document).scrollTop() <= 100) {
    //         $('nav > #nav-container > ul > li > .nav-link').css({ color: 'black' });
    //         $('nav #navbar-search').css({ color: 'black' });
    //         $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'black' });
    //     } else {
    //         $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
    //         $('nav #navbar-search').css({ color: 'white' });
    //         $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
    //     }

    //     console.log('Current mode: white mode');
    //     $(document).off("scroll.white-mode-scroll"); // To be sure
    //     $(document).on("scroll.white-mode-scroll", () => {
    //         if ($(document).scrollTop() <= 100) {
    //             $('nav > #nav-container > ul > li > .nav-link').css({ color: 'black' });
    //             $('nav #navbar-search').css({ color: 'black' });
    //             $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'black' });
    //         } else {
    //             $('nav > #nav-container > ul > li > .nav-link').css({ color: 'white' });
    //             $('nav #navbar-search').css({ color: 'white' });
    //             $('nav #dark-mode-toggle-container .toggle-parent .dark-mode-toggle').css({ color: 'white' });
    //         }
    //     });
    // }
    
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
                    {/* <img src={darkModeOn ? PulsLogoWhite : (typeof window !== "undefined" && $(document).scrollTop() <= 100 ? PulsLogoBlack : PulsLogoWhite)} alt="P.U.L.S" /> */}
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