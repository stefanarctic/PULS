import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  url,
  siteName = 'PULS - Platformă Educațională pentru Fizică',
  locale = 'ro_RO',
  structuredData
}) => {
  const location = useLocation();
  const baseUrl = 'https://puls-fizica.ro';
  const fullUrl = url || `${baseUrl}${location.pathname}`;
  const defaultImage = `${baseUrl}/res/icons/New-logo.png`;
  const ogImage = image || defaultImage;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description);
    }
    
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', title || 'PULS - Platformă Educațională pentru Fizică', true);
    updateMetaTag('og:description', description || 'Platformă educațională modernă pentru studiul fizicii cu simulări interactive, probleme BAC și asistent AI.', true);
    updateMetaTag('og:image', fullOgImage, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:locale', locale, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title || 'PULS - Platformă Educațională pentru Fizică');
    updateMetaTag('twitter:description', description || 'Platformă educațională modernă pentru studiul fizicii cu simulări interactive, probleme BAC și asistent AI.');
    updateMetaTag('twitter:image', fullOgImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Add structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, ogImage, fullUrl, type, siteName, locale, structuredData]);

  return null;
};

export default SEO;

