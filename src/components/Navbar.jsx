import { Book, FileQuestion, HelpCircle, Home, Layout, ListCheck, ListChecks, Settings, User, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav>
            <div id="logo-container">
                <Link to="/" id="logo-link">
                    <img src="/res/puls-logo-new2.png" alt="P.U.L.S" />
                </Link>
            </div>
            {/* Search bar start */}
            <div id="navbar-search">
                <Search className="search-icon" strokeWidth={3} />
                <input
                    type="text"
                    // placeholder="Cauta..."
                    className="search-input"
                />
            </div>
            {/* Search bar end */}
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
        </nav>
    );
}

export default Navbar;