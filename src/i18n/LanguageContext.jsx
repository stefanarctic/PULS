import { createContext, useContext, useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import enDictionary from '../../public/translations/site.en.json';
import {
    normalizePathname,
    splitPathQueryHash,
    romanianPathToEnglishPath,
    pathnameWithoutLocaleToRomanian,
} from './pathLocalization';

const SUPPORTED_LANGS = ['ro', 'en'];
const DEFAULT_LANG = 'ro';

/** UI menu (native names); only codes in SUPPORTED_LANGS are selectable. */
const LANGUAGE_MENU = [
    { code: 'ro', short: 'RO', nativeLabel: 'Română', flag: '🇷🇴' },
    { code: 'en', short: 'EN', nativeLabel: 'English', flag: '🇬🇧' },
    { code: 'fr', short: 'FR', nativeLabel: 'Français', flag: '🇫🇷', disabled: true },
    { code: 'it', short: 'IT', nativeLabel: 'Italiano', flag: '🇮🇹', disabled: true },
    { code: 'de', short: 'DE', nativeLabel: 'Deutsch', flag: '🇩🇪', disabled: true },
];
const EN_PREFIX = '/en';

const LanguageContext = createContext({
    lang: DEFAULT_LANG,
    setLang: () => {},
    t: (_key, defaultValue) => defaultValue ?? _key,
    localizedPath: (path) => path,
    stripLocalePath: (path) => path,
    canonicalRomanianPathname: '/',
});

const detectLangFromPath = (pathname) => {
    if (!pathname) return DEFAULT_LANG;
    if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)) return 'en';
    return DEFAULT_LANG;
};

const stripLocale = (pathname) => {
    if (!pathname) return '/';
    if (pathname === EN_PREFIX) return '/';
    if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length) || '/';
    return pathname;
};

const resolvePath = (target, lang) => {
    if (typeof target !== 'string') return target;
    if (/^(?:https?:|mailto:|tel:|#|\?)/i.test(target)) return target;
    if (lang !== 'en') return target;
    if (target === '/') return EN_PREFIX;
    if (target.startsWith(EN_PREFIX + '/') || target === EN_PREFIX) return target;
    if (target.startsWith('/')) return `${EN_PREFIX}${target}`;
    return target;
};

const getByDottedPath = (obj, key) => {
    if (!obj || !key) return undefined;
    const parts = key.split('.');
    let cursor = obj;
    for (const part of parts) {
        if (cursor == null) return undefined;
        cursor = cursor[part];
    }
    return cursor;
};

const interpolate = (template, params) => {
    if (typeof template !== 'string' || !params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
    );
};

export const LanguageProvider = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const lang = detectLangFromPath(location.pathname);
    const dict = enDictionary;
    const routing = dict?.routing ?? {};

    useEffect(() => {
        if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.lang = lang;
        }
    }, [lang]);

    const setLang = useCallback(
        (nextLang) => {
            if (!SUPPORTED_LANGS.includes(nextLang) || nextLang === lang) return;
            const stripped = normalizePathname(stripLocale(location.pathname));
            const canonicalRomanian = pathnameWithoutLocaleToRomanian(stripped, routing);
            const uiPath =
                nextLang === 'en'
                    ? romanianPathToEnglishPath(canonicalRomanian, routing)
                    : canonicalRomanian;
            const target = `${resolvePath(uiPath, nextLang)}${location.search || ''}${location.hash || ''}`;
            navigate(target, { replace: false });
        },
        [lang, location.pathname, location.search, location.hash, navigate, routing]
    );

    const t = useCallback(
        (key, defaultValue, params) => {
            const fallback = defaultValue ?? key;
            if (lang !== 'en') return interpolate(fallback, params);
            if (!dict) return interpolate(fallback, params);
            const value = getByDottedPath(dict, key);
            if (typeof value === 'string') return interpolate(value, params);
            return interpolate(fallback, params);
        },
        [lang, dict]
    );

    const localizedPath = useCallback(
        (path) => {
            if (typeof path !== 'string') return path;
            if (/^(?:https?:|mailto:|tel:|#)/i.test(path)) return path;
            const [pathnamePart, qh] = splitPathQueryHash(path);
            const mid =
                lang === 'en' ? romanianPathToEnglishPath(pathnamePart, routing) : pathnamePart;
            return resolvePath(`${mid}${qh}`, lang);
        },
        [lang, routing]
    );
    const stripLocalePath = useCallback((path) => stripLocale(path), []);

    const canonicalRomanianPathname = useMemo(
        () => pathnameWithoutLocaleToRomanian(normalizePathname(stripLocale(location.pathname)), routing),
        [location.pathname, routing]
    );

    const value = useMemo(
        () => ({
            lang,
            setLang,
            t,
            localizedPath,
            stripLocalePath,
            dict,
            canonicalRomanianPathname,
        }),
        [lang, setLang, t, localizedPath, stripLocalePath, dict, canonicalRomanianPathname]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useI18n = () => useContext(LanguageContext);

export const useT = () => {
    const { t } = useContext(LanguageContext);
    return t;
};

export const LocalizedLink = ({ to, children, ...rest }) => {
    const { localizedPath } = useContext(LanguageContext);
    return (
        <Link to={localizedPath(to)} {...rest}>
            {children}
        </Link>
    );
};

export const LocalizedNavLink = ({ to, children, ...rest }) => {
    const { localizedPath } = useContext(LanguageContext);
    return (
        <NavLink to={localizedPath(to)} {...rest}>
            {children}
        </NavLink>
    );
};

export const LanguageSwitcher = ({ className = '', style, variant = 'default' }) => {
    const { lang, setLang } = useContext(LanguageContext);
    const [open, setOpen] = useState(false);
    const [forceOpen, setForceOpen] = useState(false);
    const wrapRef = useRef(null);
    const menuRef = useRef(null);
    const closeTimeoutRef = useRef(null);
    const isNavbar = variant === 'navbar';

    const current = LANGUAGE_MENU.find((x) => x.code === lang) ?? LANGUAGE_MENU[0];

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const onDocMouseDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                if (isNavbar) setForceOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                if (isNavbar) setForceOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, isNavbar]);

    const handleMouseEnter = () => {
        if (!isNavbar) return;
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        if (!forceOpen) setOpen(true);
    };

    const handleMouseLeave = () => {
        if (!isNavbar || forceOpen) return;
        closeTimeoutRef.current = setTimeout(() => setOpen(false), 150);
    };

    const handleMenuMouseEnter = () => {
        if (!isNavbar) return;
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };

    const handleMenuMouseLeave = () => {
        if (!isNavbar || forceOpen) return;
        closeTimeoutRef.current = setTimeout(() => setOpen(false), 200);
    };

    const handleTriggerClick = (e) => {
        if (isNavbar) {
            e.preventDefault();
            setForceOpen((prev) => {
                const newState = !prev;
                setOpen(newState);
                return newState;
            });
            return;
        }
        setOpen((v) => !v);
    };

    const handleLanguageSelect = (selectable, code) => {
        if (!selectable) return;
        setLang(code);
        setOpen(false);
        if (isNavbar) setForceOpen(false);
    };

    const wrapClassName = [
        'language-switcher-wrap',
        isNavbar && 'nav-link dropdown-toggle navbar-dropdown-toggle',
        isNavbar && (open || forceOpen) && 'active',
        className,
    ].filter(Boolean).join(' ');

    const triggerClassName = [
        'language-switcher-trigger',
        isNavbar && 'navbar-dropdown-span',
        open && 'is-open',
    ].filter(Boolean).join(' ');

    const menuClassName = isNavbar
        ? 'dropdown-menu navbar-dropdown-menu'
        : 'language-switcher-menu';

    const getOptionClassName = (item, selected) => {
        if (isNavbar) {
            return [
                'dropdown-item navbar-dropdown-item language-switcher-navbar-item',
                item.disabled && 'is-disabled',
                selected && 'is-selected',
            ].filter(Boolean).join(' ');
        }

        return [
            'language-switcher-option',
            selected && 'is-selected',
            item.disabled && 'is-disabled',
        ].filter(Boolean).join(' ');
    };

    return (
        <div
            ref={wrapRef}
            className={wrapClassName}
            style={style}
            onMouseEnter={isNavbar ? handleMouseEnter : undefined}
            onMouseLeave={isNavbar ? handleMouseLeave : undefined}
        >
            <button
                type="button"
                className={triggerClassName}
                onClick={handleTriggerClick}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={`Language: ${current.nativeLabel}. Open menu`}
            >
                {isNavbar ? (
                    <>
                        <span>{current.short}</span>
                        <ChevronDown className="nav-icon navbar-dropdown-icon" />
                    </>
                ) : (
                    <>
                        <span className="language-switcher-trigger-flag" aria-hidden>
                            {current.flag}
                        </span>
                        <span className="language-switcher-trigger-code">{current.short}</span>
                        <span className="language-switcher-trigger-chevron" aria-hidden>
                            <ChevronDown size={14} strokeWidth={2} />
                        </span>
                    </>
                )}
            </button>
            {open && (
                isNavbar ? (
                    <div
                        ref={menuRef}
                        className={menuClassName}
                        role="listbox"
                        aria-label="Languages"
                        onMouseEnter={handleMenuMouseEnter}
                        onMouseLeave={handleMenuMouseLeave}
                    >
                        {LANGUAGE_MENU.map((item) => {
                            const selectable = !item.disabled && SUPPORTED_LANGS.includes(item.code);
                            const selected = item.code === lang;
                            return (
                                <button
                                    key={item.code}
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    disabled={!selectable}
                                    className={getOptionClassName(item, selected)}
                                    title={item.disabled ? `${item.nativeLabel} — soon` : undefined}
                                    aria-label={
                                        item.disabled
                                            ? `${item.nativeLabel}, coming soon`
                                            : undefined
                                    }
                                    onClick={() => handleLanguageSelect(selectable, item.code)}
                                >
                                    {item.nativeLabel}
                                    {item.disabled ? (
                                        <span className="language-switcher-soon-badge">Soon</span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                <ul className={menuClassName} role="listbox" aria-label="Languages">
                    {LANGUAGE_MENU.map((item) => {
                        const selectable = !item.disabled && SUPPORTED_LANGS.includes(item.code);
                        const selected = item.code === lang;
                        return (
                            <li key={item.code} role="presentation">
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    disabled={!selectable}
                                    className={getOptionClassName(item, selected)}
                                    title={item.disabled ? `${item.nativeLabel} — soon` : undefined}
                                    aria-label={
                                        item.disabled
                                            ? `${item.nativeLabel}, coming soon`
                                            : undefined
                                    }
                                    onClick={() => handleLanguageSelect(selectable, item.code)}
                                >
                                    <span className="language-switcher-option-flag" aria-hidden>
                                        {item.flag}
                                    </span>
                                    <span className="language-switcher-option-label">{item.nativeLabel}</span>
                                    {item.disabled ? (
                                        <span className="language-switcher-soon-badge">Soon</span>
                                    ) : null}
                                </button>
                            </li>
                        );
                    })}
                </ul>
                )
            )}
        </div>
    );
};

export { detectLangFromPath, stripLocale, resolvePath, EN_PREFIX };
