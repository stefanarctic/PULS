import { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
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

export const LanguageSwitcher = ({ className = '', style }) => {
    const { lang, setLang } = useContext(LanguageContext);
    const next = lang === 'en' ? 'ro' : 'en';
    const label = next.toUpperCase();
    return (
        <button
            type="button"
            className={`language-switcher ${className}`.trim()}
            onClick={() => setLang(next)}
            aria-label={lang === 'en' ? 'Switch to Romanian' : 'Comută la engleză'}
            title={lang === 'en' ? 'Switch to Romanian' : 'Switch to English'}
            style={style}
        >
            {label}
        </button>
    );
};

export { detectLangFromPath, stripLocale, resolvePath, EN_PREFIX };
