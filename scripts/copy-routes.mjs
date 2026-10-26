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

// 2. Main routes to generate static directories for direct 200 OK access
const routes = [
  'explore',
  'booking',
  'about',
  'works',
  'posts',
  'portfolio',
  'profile',
  'admin'
];

for (const route of routes) {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.copyFileSync(indexHtmlPath, path.join(routeDir, 'index.html'));
  console.log(`Created route: dist/${route}/index.html`);
}

console.log('All routes generated successfully without # hash!');
