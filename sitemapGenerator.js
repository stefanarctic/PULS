import SitemapGenerator from 'sitemap-generator';
 
// create generator
const generator = SitemapGenerator('https://puls-fizica.vercel.app', {
  stripQuerystring: false
});
 
// register event listeners
generator.on('done', () => {
  // sitemaps created
});
 
// start the crawler
generator.start();