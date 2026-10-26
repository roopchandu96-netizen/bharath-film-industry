import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

// 1. Copy index.html to 404.html for GitHub Pages fallback
const fourOhFourPath = path.join(distDir, '404.html');
fs.copyFileSync(indexHtmlPath, fourOhFourPath);
console.log('Created dist/404.html for SPA fallback');

// 2. Main SPA routes to generate static directories for direct 200 OK access
const spaRoutes = [
  'explore',
  'booking',
  'about',
  'works',
  'posts',
  'portfolio',
  'profile',
  'admin'
];

for (const route of spaRoutes) {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.copyFileSync(indexHtmlPath, path.join(routeDir, 'index.html'));
  console.log(`Created SPA route: dist/${route}/index.html`);
}

// 3. Ensure static legal standalone routes are preserved
const legalRoutes = ['privacy', 'terms', 'data-deletion', 'privacy-policy', 'terms-of-service', 'delete-account'];
for (const legal of legalRoutes) {
  const legalIndex = path.join(distDir, legal, 'index.html');
  if (fs.existsSync(legalIndex)) {
    console.log(`Verified standalone legal route: dist/${legal}/index.html`);
  } else {
    console.warn(`Warning: dist/${legal}/index.html was not found!`);
  }
}

console.log('All routes generated and verified successfully without # hash!');
