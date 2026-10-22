import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.js';
import { initialArticles, initialProducts } from '../server/content.js';

const prefix = '/wugan-site';
const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'artifacts', 'nas-preview', 'wugan-site');
const dataDir = await mkdtemp(path.join(tmpdir(), 'wugan-static-'));
const { app, db } = createApp({ dataDir, env: { NODE_ENV: 'development' } });
const server = app.listen(0, '127.0.0.1');
await new Promise((resolve) => server.once('listening', resolve));
const port = server.address().port;

const routes = [
  '/', '/products', '/oem-odm', '/fabrics', '/factory', '/about', '/quote',
  '/contact', '/faq', '/guides', '/privacy', '/terms',
  ...initialProducts.map((product) => `/products/${product.id}`),
  ...initialArticles.map((article) => `/guides/${article.id}`),
];

function previewHtml(html, route) {
  const pageDirectory = route === '/' ? '/' : `${route}/`;
  function localLink(value) {
    const url = new URL(value, 'https://preview.invalid');
    let target = url.pathname;
    if (routes.includes(target)) target = target === '/' ? '/index.html' : `${target}/index.html`;
    else if (target.endsWith('/') && routes.includes(target.slice(0, -1))) target += 'index.html';
    let relative = path.posix.relative(pageDirectory, target);
    if (!relative.startsWith('.')) relative = './' + relative;
    if (['/app.js', '/style.css'].includes(url.pathname)) url.searchParams.set('v', 'nas-v3');
    return relative + url.search + url.hash;
  }
  return html
    .replace('<html lang="en">', '<html lang="en" data-static-preview>')
    .replace('<head>', '<head><meta name="robots" content="noindex,nofollow">')
    .replace(/\b(href|src|data-image)="(\/(?!\/)[^"]*)"/g, (_, attribute, value) => `${attribute}="${localLink(value)}"`)
    .replace('<span>©', '<span>NAS preview v3 · ©');
}

try {
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output, { recursive: true });
  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    if (!response.ok) throw new Error(`Unable to export ${route}: HTTP ${response.status}`);
    const target = route === '/' ? output : path.join(output, route.slice(1));
    mkdirSync(target, { recursive: true });
    writeFileSync(path.join(target, 'index.html'), previewHtml(await response.text(), route));
  }
  cpSync(path.join(root, 'public', 'media'), path.join(output, 'media'), { recursive: true });
  cpSync(path.join(root, 'public', 'favicon.svg'), path.join(output, 'favicon.svg'));
  cpSync(path.join(root, 'public', 'downloads'), path.join(output, 'downloads'), { recursive: true });
  cpSync(path.join(root, 'web', 'style.css'), path.join(output, 'style.css'));
  const appScript = readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  writeFileSync(path.join(output, 'app.js'), appScript);
  writeFileSync(path.join(output, '请先阅读.txt'), [
    'WUGAN NAS 静态预览版 v3 — 所有页面直接链接到 index.html',
    '',
    '把本文件夹里面的全部内容复制到 NAS 的 Web/wugan-site 文件夹。',
    `浏览地址：http://120.196.100.125:8082${prefix}/index.html`,
    '页面底部应显示 NAS preview v3，代表新版本已生效。',
    '',
    '这是设计审核版：页面、菜单、产品筛选和选品可以使用。',
    '询盘只显示测试提示，不会保存、发邮件或上传附件。',
    '正式网站仍需部署服务器版或转换为 WordPress。',
  ].join('\n'));
  console.log(`Static NAS preview exported to ${output}`);
} finally {
  await new Promise((resolve) => server.close(resolve));
  db.close();
  rmSync(dataDir, { recursive: true, force: true });
}
